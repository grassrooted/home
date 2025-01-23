import pdfplumber
import re
import json


# data source
pdf_path = "2020_1.pdf"
root_name = pdf_path.split(".")[0]
output_file = f"{root_name}.json"

def extract_finance_data_from_table(pdf_path):
    data = {
        "candidate_info": {},
        "report_totals": {},
        "contributions": [],
        "expenditures": []
    }

    def extract_small_dollar(data):
        flat_text = " ".join(filter(None, [str(item) for sublist in data for item in sublist]))
        print(flat_text + "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")
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

    def extract_office(data):
        combined_text = " ".join(filter(None, data))
        start_phrase = "3. Office Held"
        if start_phrase in combined_text:
            start_index = combined_text.index(start_phrase) + len(start_phrase)
            extracted_text = combined_text[start_index:].strip()
            return extracted_text
        return None
    
    def extract_first_name(data):
        flat_text = " ".join(filter(None, [str(item) for sublist in data for item in sublist]))
        flat_text.replace("MI", "")
        first_name_pattern = r'FIRST\s+([\w]+)'
        match = re.search(first_name_pattern, flat_text)
        return match.group(1) if match else None

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
    def extract_financial_data(flat_text):
        patterns = {
            "TOTAL OFFICEHOLDER CONTRIBUTIONS OF $50 OR LESS (OTHER THAN PLEDGES, LOANS, OR GUARANTEES OF LOANS), UNLESS ITEMIZED": r"TOTALOFFICEHOLDERCONTRIBUTIONSOF\$50ORLESS.*?\$([\d,]+\.\d{2})",
            "TOTAL OFFICEHOLDER CONTRIBUTIONS OTHER THAN PLEDGES, LOANS, OR GUARANTEES OF LOANS)": r"ESOFLOANS\)\$([\d,]+\.\d{2})",
            "TOTAL OFFICEHOLDER EXPENDITURES OF $100 OR LESS, UNLESS ITEMIZED": r"TOTALOFFICEHOLDEREXPENDITURESOF\$100ORLESS.*?\$([\d,]+\.\d{2})",
            "TOTAL OFFICEHOLDER EXPENDITURES": r"TOTALOFFICEHOLDEREXPENDITURES\$([\d,]+\.\d{2})",
            "TOTAL POLITICAL CONTRIBUTIONS OF $50 OR LESS (OTHER THAN PLEDGES LOANS, OR GUARANTEES OF LOANS), UNLESS ITEMIZED": r"TOTALPOLITICALCONTRIBUTIONSOF\$50ORLESS.*?\$([\d,]+\.\d{2})",
            "TOTAL POLITICAL CONTRIBUTIONS (OTHER THAN PLEDGES, LOANS, OR GUARANTEES OF LOANS)": r"TOTALPOLITICALCONTRIBUTIONS\(OTHERTHANPLEDGES,LOANS,ORGUARANTEESOFLOANS\)\$([\d,]+\.\d{2})",
            "TOTAL POLITICAL EXPENDITURES OF $100 OR LESS UNLESS ITEMIZED": r"TOTALPOLITICALEXPENDITURESOF\$100ORLESS.*?\$([\d,]+\.\d{2})",
            "TOTAL POLITICAL EXPENDITURES": r"TOTALPOLITICALEXPENDITURES\$([\d,]+\.\d{2})"
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
        flat_text = " ".join(filter(None, [str(item) for sublist in table for item in sublist])).replace("None", "").replace(" ", "").replace("\n","")

        print(flat_text)
        header["candidate_info"] = {
            "first_name": extract_first_name(table),
            "last_name": extract_last_name(table),
            "office_sought": extract_office(table[10]),
            "report_totals" : extract_financial_data(flat_text)
        }
        
        json_str = json.dumps(header, indent=4)
        print(json_str)
        return header

    def parse_contribution_record(row):
        try:
            date_and_type = row[0].split("\n")
            date = date_and_type[1]
            transaction_type = " ".join(date_and_type[2:])

            donor_name_and_address = row[1].split("\n")
            donor_name = donor_name_and_address[1]
            address = donor_name_and_address[-1]

            amount = float(row[-1].split("\n")[-1])

            if date and donor_name and address and amount and transaction_type:
                return {
                    "Transaction_Date": date,
                    "Name": donor_name,
                    "Address": address,
                    "Amount": float(amount),
                    "Transaction_Type": transaction_type
                }
            return None
        except Exception:
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
            # For debugging purposes
            print(f"Error parsing record: {e}")
            return None


    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            if page_num == 0:
                header = parse_header_page(tables[0])
                if header:
                    data["candidate_info"] = header["candidate_info"]
            for table in tables:
                for row in table:
                    record = parse_contribution_record(row)
                    if record:
                        data["contributions"].append(record)

                # Extract expenditure records
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

    return data

finance_data = extract_finance_data_from_table(pdf_path)

with open(output_file, "w") as file:
    json.dump(finance_data, file, indent=4)

total_contributions = round(sum(record["Amount"] for record in finance_data["contributions"]), 2)
total_expenditures = round(sum(record["Amount"] for record in finance_data["expenditures"]), 2)

print(f"Total Contributions: {total_contributions}")
print(f"Total Expenditures: {total_expenditures}")
