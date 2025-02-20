import pdfplumber
import re
import json
import os

pdf_path = "srp0000002777_20250115_220358.pdf"


def extract_finance_data_from_table(pdf_path):
    data = {
        "candidate_info": {},
        "form_data" : {
            "data_source" : pdf_path,
        },
        "contributions": [],
        "expenditures": [],
        "in_kind_contributions": [],
    }

    def extract_office(flat_text):
        pattern = r"OFFICE\s*SOUGHT\s*\(if known\)\s*([A-Za-z]+\s*District\s*\d+)"
        match = re.search(pattern, flat_text)

        if match:
            office_sought = match.group(1).strip()
            return office_sought
        else:
            return "Not Found"
    
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
            "TOTAL OFFICEHOLDER CONTRIBUTIONS (OTHER THAN PLEDGES, LOANS, OR GUARANTEES OF LOANS)": r"ESOFLOANS\)\$([\d,]+\.\d{2})",
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

    def extract_period_covered(flattened_text):
        try:
            pattern_start = r"PERIOD/COVERED.*?(\d{1,2}/\d{1,2}/\d{4})"
            pattern_end = r"\s*THROUGH\s*(\d{1,2}/\d{1,2}/\d{4})"

            match_start = re.search(pattern_start, flattened_text, re.IGNORECASE).group(1)
            match_end = re.search(pattern_end, flattened_text, re.IGNORECASE).group(1)

            if match_start and match_end:
                start_date = match_start
                end_date = match_end
                return f"{start_date}_{end_date}"
            else:
                return None  # Return None if no match is found
        except Exception as e:
            print(f"Error extracting period covered: {e}")
            return None


    def parse_header_page(table):
        header = {}
        flat_text = " ".join(filter(None, [str(item) for sublist in table for item in sublist])).replace("None", "").replace(" ", "").replace("\n","")
        period_covered = extract_period_covered(flat_text)
        data["form_data"]["period"] = period_covered
        header["candidate_info"] = {
            "first_name": extract_first_name(table),
            "last_name": extract_last_name(table),
            "office_sought": extract_office(flat_text),
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


            if not transaction_type:
                officeholder_contributions_total = round(data["candidate_info"]["report_totals"]["TOTAL OFFICEHOLDER CONTRIBUTIONS (OTHER THAN PLEDGES, LOANS, OR GUARANTEES OF LOANS)"])
                campaign_contributions_total = round(data["candidate_info"]["report_totals"]["TOTAL POLITICAL CONTRIBUTIONS (OTHER THAN PLEDGES, LOANS, OR GUARANTEES OF LOANS)"])
                print(f"Officeholder: {officeholder_contributions_total}\nCampaign: {campaign_contributions_total}\n")
                if officeholder_contributions_total != 0 and campaign_contributions_total == 0:
                    transaction_type = "Campaign Contribution"
                elif officeholder_contributions_total == 0 and campaign_contributions_total != 0:
                    transaction_type = "Officeholder Contribution"
                

            print(f"Date: {date}\nTransaction Type: {transaction_type}\nDonor: {donor_name}\nAddress: {address}\nAmount: {amount}\n\n")

            if date and donor_name and address and amount:

                return {
                    "Transaction_Date": date,
                    "Name": donor_name,
                    "Address": address,
                    "Amount": float(amount),
                    "Transaction_Type": transaction_type,
                    "Source" : source_filename
                }
            return None
        except Exception as e:
            print(e)
            return None

    def extract_amount_and_description(text):
        try:
            # Pattern to extract the first number after "description"
            amount_pattern = r"description\s*([\d,]+\.\d{2})"
            amount_match = re.search(amount_pattern, text)
            amount = float(amount_match.group(1)) if amount_match else None

            # Pattern to extract the text following the number until "Check if travel outside of Texas"
            if amount_match:
                description_pattern = rf"{re.escape(amount_match.group(1))}\s+(.*?)\s+Check if travel outside of Texas"
                description_match = re.search(description_pattern, text)
                description = description_match.group(1).strip() if description_match else None
            else:
                description = None

            return amount, description
        except Exception as e:
            print(f"Error in extract_amount_and_description: {e}")
            return None, None


    def parse_in_kind_contribution(table):
        try:
            results = []  # Initialize as a list to store the parsed records
            for row in table:
                # Initialize fields as None
                date, name, address, amount, description_line = None, None, None, None, None

                # Extract Date
                if row[0] and "Date" in row[0]:
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
                        "Description": description_line,
                        "Source" : source_filename
                    })

            return results

        except Exception as e:
            #print(f"Error parsing table: {e}")
            return results




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
                    "Description": description,
                    "Source": source_filename
                }
            return None
        except Exception as e:
            # For debugging purposes
            #print(f"Error parsing record: {e}")
            return None


    with pdfplumber.open(pdf_path) as pdf:
        source_filename = pdf_path.split("/")[-1]
        for page_num, page in enumerate(pdf.pages):
            page_title = "".join(page.extract_tables()[0][0][0])
            tables = page.extract_tables()
            if page_num == 0:
                print(f"Page Title: {page_title}")
                header = parse_header_page(tables[0])
                if header:
                    data["candidate_info"] = header["candidate_info"]
                    
            for table in tables:
                if "A1" in page_title:
                    for row in table:
                        record = parse_contribution_record(row)
                        if record:
                            data["contributions"].append(record)

                if "F1" in page_title:
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
                    
                if "A2" in page_title:
                    in_kind_contribution = parse_in_kind_contribution(table)
                    if in_kind_contribution:
                        data["in_kind_contributions"].extend(in_kind_contribution)

    return data

print(f"\n\nParsing: {pdf_path}")
print(f"Parsing: {pdf_path}")
# set up default output filename
root_name = os.path.splitext(pdf_path)[0]
output_file = f"{root_name}_supplemental.json"

finance_data = extract_finance_data_from_table(pdf_path)
period_covered = finance_data["form_data"]["period"].replace("/", "-")
last_name = finance_data["candidate_info"]["last_name"]
if period_covered and last_name:
    output_file = f"{last_name}_{period_covered}_supplemental.json"

total_political_contributions = round(sum(record["Amount"] for record in finance_data["contributions"]), 2)
total_expenditures = round(sum(record["Amount"] for record in finance_data["expenditures"]), 2)
total_in_kind_contributions = round(sum(record["Amount"] for record in finance_data["in_kind_contributions"]), 2)
total_contributions = total_in_kind_contributions + total_political_contributions

finance_data["candidate_info"]["report_totals"]["Total Parsed Contributions"] = total_contributions
finance_data["candidate_info"]["report_totals"]["Total Parsed Expenditures"] = total_expenditures

reported_total_contributions = finance_data["candidate_info"]["report_totals"]["TOTAL OFFICEHOLDER CONTRIBUTIONS (OTHER THAN PLEDGES, LOANS, OR GUARANTEES OF LOANS)"]\
    + finance_data["candidate_info"]["report_totals"]["TOTAL POLITICAL CONTRIBUTIONS (OTHER THAN PLEDGES, LOANS, OR GUARANTEES OF LOANS)"]
    #+ finance_data["candidate_info"]["report_totals"]["TOTAL POLITICAL CONTRIBUTIONS OF $50 OR LESS (OTHER THAN PLEDGES LOANS, OR GUARANTEES OF LOANS), UNLESS ITEMIZED"]\
    #+finance_data["candidate_info"]["report_totals"]["TOTAL OFFICEHOLDER CONTRIBUTIONS OF $50 OR LESS (OTHER THAN PLEDGES, LOANS, OR GUARANTEES OF LOANS), UNLESS ITEMIZED"]\
reported_total_expenditures = finance_data["candidate_info"]["report_totals"]["TOTAL OFFICEHOLDER EXPENDITURES"]\
    + finance_data["candidate_info"]["report_totals"]["TOTAL POLITICAL EXPENDITURES"]
    #+ finance_data["candidate_info"]["report_totals"]["TOTAL OFFICEHOLDER EXPENDITURES OF $100 OR LESS, UNLESS ITEMIZED"]\
    #+ finance_data["candidate_info"]["report_totals"]["TOTAL POLITICAL EXPENDITURES OF $100 OR LESS UNLESS ITEMIZED"]\

finance_data["candidate_info"]["report_totals"]["Total Itemized Reported Contributions"] = reported_total_contributions
finance_data["candidate_info"]["report_totals"]["Total Itemized Reported Expenditures"] = reported_total_expenditures

print(f"\nReported Contributions: {reported_total_contributions}")
print(f"Parsed Contributions: {total_contributions}")

print(f"\nReported Expenditures: {reported_total_expenditures}")
print(f"Parsed Expenditures: {total_expenditures}")
if (reported_total_contributions != total_contributions):
    print("***MISMATCHING CONTRIBUTION TOTAL***\n\n")
    finance_data["candidate_info"]["report_totals"]["Contribution Mismatch"] = True
elif (reported_total_expenditures != total_expenditures):
    print("***MISMATCHING EXPENDITURE TOTAL***\n\n")
    finance_data["candidate_info"]["report_totals"]["Expenditure Mismatch"] = True

print(f"Writing Records to {output_file}")
with open(output_file, "w") as file:
    json.dump(finance_data, file, indent=4)
