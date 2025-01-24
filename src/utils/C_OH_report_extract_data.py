import pdfplumber
import re
import json


# data source
pdf_path = "c_oh_july_2020.pdf"
root_name = pdf_path.split(".")[0]
output_file = f"{root_name}.json"

def extract_finance_data_from_table(pdf_path):
    data = {
        "candidate_info": {},
        "contributions": [],
        "expenditures": [],
        "in_kind_contributions": []
    }

    def extract_small_dollar(data):
        flat_text = " ".join(filter(None, [str(item) for sublist in data for item in sublist]))
        matches = re.findall(r'\$\d+(?:,\d{3})*(?:\.\d{2})?', flat_text)
        if len(matches) > 1:
            return float(matches[1].replace('$', '').replace(',', ''))
        elif matches:
            return float(matches[0].replace('$', '').replace(',', ''))
        return None

    def extract_amount(data):
        flat_text = " ".join(filter(None, [str(item) for sublist in data for item in sublist]))
        match = re.search(r'\$(\d+(?:,\d{3})*(?:\.\d{2})?)', flat_text)
        if match:
            return float(match.group(1).replace(',', ''))
        return None

    def extract_office(flat_text):
        pattern = r"13\s*OFFICE\s*SOUGHT\s*\(if known\)\s*([A-Za-z]+\s*District\s*\d+)"
        match = re.search(pattern, flat_text)

        if match:
            office_sought = match.group(1).strip()
            return office_sought
        else:
            return "Not Found"
    
    def extract_first_name(flat_text):
        match = re.search(r"CANDIDATE /OFFICEHOLDERNAME.*?\bFIRST MI\s*Mr\s+(\w+)", flat_text, re.IGNORECASE)

        if match:
            first_name = match.group(1)
            return first_name
        else:
            return "Not Found"

    def extract_last_name(data):
        last_name = None
        flattened_data = [str(item) for sublist in data for item in sublist if isinstance(item, str)]
        last_name_pattern = re.compile(r"(NICKNAME LAST SUFFIX|LAST|NICKNAME LAST)\s*.*?\n([A-Za-z]+)")

        for line in flattened_data:
            match = last_name_pattern.search(line)
            if match:
                last_name = match.group(2)
                break
        
        return last_name
    
    # Function to extract financial data
    def parse_totals_page(table):
        flat_text = " ".join(filter(None, [str(item) for sublist in table for item in sublist])).replace("None", "").replace("\n","")
        patterns = {
            "TOTAL POLITICAL CONTRIBUTIONS OF $50 OR LESS (OTHER THAN PLEDGES LOANS, OR GUARANTEES OF LOANS), UNLESS ITEMIZED": r"LOANS, OR GUARANTEES OF LOANS\), UNLESS ITEMIZED\s+\$\s*([\d,]+\.\d{2})",
            "TOTAL POLITICAL CONTRIBUTIONS (OTHER THAN PLEDGES, LOANS, OR GUARANTEES OF LOANS)": r"2\. TOTAL POLITICAL CONTRIBUTIONS\s*\(OTHER THAN PLEDGES, LOANS, OR GUARANTEES OF LOANS\)\s+\$\s*([\d,]+\.\d{2})",
            "TOTAL POLITICAL EXPENDITURES OF $100 OR LESS UNLESS ITEMIZED": r"100 OR LESS,UNLESS ITEMIZED\s+\$\s*([\d,]+\.\d{2})",
            "TOTAL POLITICAL EXPENDITURES": r"4\. TOTAL POLITICAL EXPENDITURES\s+\$\s*([\d,]+\.\d{2})",
            "TOTAL POLITICAL CONTRIBUTIONS MAINTAINED AS OF THE LAST DAY OF REPORTING PERIOD": r"REPORTING PERIOD\s+\$\s*([\d,]+\.\d{2})"
        }

        # Extract and store values in a dictionary
        results = {}

        for header, pattern in patterns.items():
            match = re.search(pattern, flat_text)
            if match:
                # Extract and clean the value
                value = match.group(1).replace(",", "").strip()
                results[header] = float(value)
            else:
                results[header] = 0.00

        return results

    def parse_header_page(table):
        header = {}
        flat_text = " ".join(filter(None, [str(item) for sublist in table for item in sublist])).replace("None", "").replace("\n","")

        header["candidate_info"] = {
            "first_name": extract_first_name(flat_text),
            "last_name": extract_last_name(table),
            "office_sought": extract_office(flat_text),
        }
        
        return header

    def parse_contribution_record(row):
        try:
            # Extract and parse the date and transaction type
            date_and_type = row[0].split("\n")
            date = date_and_type[1].strip() if len(date_and_type) > 1 else None

            # Extract and parse the donor name and address
            donor_info = row[1].split("\n")
            donor_name = donor_info[1].strip() if len(donor_info) > 1 else None
            address = donor_info[-1].strip() if len(donor_info) > 2 else None

            # Extract and parse the contribution amount
            amount_info = row[-1].split("\n")
            amount = float(amount_info[-1].strip()) if len(amount_info) > 0 else None

            # Return the parsed data as a dictionary if all fields are valid
            if date and donor_name and address and amount:
                return {
                    "Transaction_Date": date,
                    "Name": donor_name,
                    "Address": address,
                    "Amount": amount,
                    "Transaction_Type": "Contribution"
                }
            return None
        except Exception as e:
            return None

    def extract_amount_and_description(text):
        try:
            # Pattern to extract the first number after "description"
            amount_pattern = r"description\s*([\d,]+\.\d{2})"
            amount_match = re.search(amount_pattern, text)
            amount = float(amount_match.group(1)) if amount_match else None

            # Pattern to extract the text following the number until "Check if travel outside of Texas"
            description_pattern = rf"{amount_match.group(1)}\s+(.*?)\s+Check if travel outside of Texas"
            description_match = re.search(description_pattern, text)
            description = description_match.group(1).strip() if description_match else None
            
            return amount, description
        except Exception as e:
            return None, None


    def parse_in_kind_contribution(table):
        try:
            results = []  # Initialize as a list to store the parsed records
            for row in table:
                # Initialize fields as None
                date, name, address, amount, description_line = None, None, None, None, None

                # Extract Date
                if row[0] and row[0].startswith("5 Date"):
                    date = row[0].split("\n")[1].strip()

                # Extract Contributor Name and Address
                if row[1] and "Full name of contributor" in row[1]:
                    lines = row[1].split("\n")
                    name = lines[1].strip()  # Extract Name
                    address = lines[-1].strip()  # Extract Address

                # Extract Amount and In-kind Contribution Description
                if row[-1] and "Amount of" in row[-1]:
                    lines = " ".join(row[-1].split("\n")).replace("○", "")  # Clean up text
                    amount, description_line = extract_amount_and_description(lines)

                # Append to results if all fields are non-None
                if date and name and address and amount and description_line:
                    results.append({
                        "Date": date,
                        "Name": name,
                        "Address": address,
                        "Amount": amount,
                        "Description": description_line
                    })

            return results

        except Exception as e:
            return None





    def parse_expenditure_record(record):
        try:
            # Extract date and payee name
            date_and_payee = record[0][0].split("\n")
            date = date_and_payee[1]
            payee_name = record[0][1].split("\n")[1]

            # Extract amount and transaction type
            amount_data = record[1][0]
            transaction_type = " ".join(amount_data.split("\n")[2:])
            
            # Match the monetary value (handles both formats)
            match = re.search(r'\d+(?:,\d{3})*(?:\.\d{2})', amount_data)
            amount = round(float(match.group().replace(",", "")),2) if match else None

            # Extract payee address
            payee_address = record[1][1].split("\n")[-1]

            # Extract category and description
            category_data = record[2][1].split("\n")
            category = category_data[1] if len(category_data) > 1 else None
            description = record[2][2].split("\n")[-1] if record[2][2] else None

            # Return the parsed record
            if date and payee_name and amount and payee_address and category and description:
                return {
                    "Transaction_Date": date,
                    "Name": payee_name,
                    "Address": payee_address,
                    "Amount": amount,
                    "Transaction_Type": transaction_type,
                    "Category": category,
                    "Description": description
                }
            return None
        except Exception as e:
            return None


    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            if page_num == 0:
                header = parse_header_page(tables[0])
                if header:
                    data["candidate_info"] = header["candidate_info"]
            elif page_num == 1:
                totals = parse_totals_page(tables[0])
                json_str = json.dumps(totals, indent=4)
                print(json_str)
                if totals:
                    data["candidate_info"]["report_totals"] = totals

            page_title = "".join(page.extract_tables()[0][0][0])

            for table in tables:
                if "A1" in page_title:
                    for row in table:
                        record = parse_contribution_record(row)
                        if record:
                            data["contributions"].append(record)

                if "F1" in page_title:
                    for i in range(len(table) - 4):
                        if (
                            table[i] 
                            and len(table[i]) > 1
                            and table[i][0] 
                            and isinstance(table[i][0], str) 
                            and "Date" in table[i][0]
                            and table[i][1] 
                            and isinstance(table[i][1], str)
                            and "Payee name" in table[i][1]
                        ):                        
                            expenditure_record = parse_expenditure_record(table[i:i + 5])
                            if expenditure_record:
                                data["expenditures"].append(expenditure_record)

                if "A2" in page_title:
                    in_kind_contribution = parse_in_kind_contribution(table)
                    if in_kind_contribution:
                        data["in_kind_contributions"].extend(in_kind_contribution)
    return data

finance_data = extract_finance_data_from_table(pdf_path)

with open(output_file, "w") as file:
    json.dump(finance_data, file, indent=4)

total_contributions_monetary = round(sum(record["Amount"] for record in finance_data["contributions"]), 2)
total_expenditures = round(sum(record["Amount"] for record in finance_data["expenditures"]) + finance_data["candidate_info"]["report_totals"]["TOTAL POLITICAL EXPENDITURES OF $100 OR LESS UNLESS ITEMIZED"], 2)
total_in_kind_contributions = round(sum(record["Amount"] for record in finance_data["in_kind_contributions"]), 2)
total_contributions = total_contributions_monetary + total_in_kind_contributions


print(f"Total Contributions: {total_contributions}")
print(f"Total Expenditures: {total_expenditures}")
