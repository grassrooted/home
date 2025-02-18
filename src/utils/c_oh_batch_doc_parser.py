import pdfplumber
import re
import json
import os
import requests

# File containing the list of PDF links
LAST_NAME_CONFIG = "Gracey"
related_tec_docs_filename = f"c_oh_related_sources_{LAST_NAME_CONFIG}.txt"
unmatched_tec_docs_filename = f"unmatched_c_oh_files_{LAST_NAME_CONFIG}.txt"
def extract_filename_from_url(url):
    return url.split("/")[-1]

def download_pdf(url, output_dir):
    try:
        filename = extract_filename_from_url(url)
        filepath = os.path.join(output_dir, filename)

        if not os.path.exists(filepath):
            print(f"Downloading {filename}...")
            response = requests.get(url)
            with open(filepath, "wb") as file:
                file.write(response.content)
        else:
            print(f"{filename} already exists locally.")
        return filepath
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return None

def extract_finance_data_from_table(pdf_path):
    data = {
        "candidate_info": {},
        "form_data" : {},
        "contributions": [],
        "expenditures": [],
        "in_kind_contributions": [],
    }
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

    def extract_last_name(table):
        last_name_row = table[3]
        for row in table:
            for cell in row:
                if cell and "3 CANDIDATE /\nOFFICEHOLDER\nNAME" in cell:
                    # Identify the row with the officeholder's name information
                    last_name_row = row
                    print(f"Last Name Row: {last_name_row}")
        for cell in last_name_row:
            if cell and "NICKNAME LAST SUFFIX" in cell:
                # Flatten the text in the cell
                flat_text = cell.replace("\n", " ")
                print(f"Last Name Flat Text: {flat_text}")
                last_name = flat_text.split(" ")[-1]
                return last_name
        return None
    
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

    def extract_period_covered(table):
        try:
            period_row = table[-5]
            for row in table:
                for cell in row:
                    if cell and '10 PERIOD\nCOVERED' in cell:
                        # Identify the row with the officeholder's name information
                        period_row = row
                        print(f"\nPeriod Row: {period_row}")
            for cell in period_row:
                if cell and "Month Day Year" in cell:
                    # Flatten the text in the cell
                    flat_text = cell.replace("\n", " ")
                    print(f"flattened period text: {flat_text}")
                    match = re.search(r"(\d{2}) (\d{2}) (\d{4})\s+(\d{2}) (\d{2}) (\d{4})", flat_text)
                    if match:
                        start_date = "-".join(match.groups()[:3])
                        end_date = "-".join(match.groups()[3:])
                        return f"{start_date}_{end_date}"
                    return None
            return None
        except Exception as e:
            return None
        except Exception as e:
            return None

    def parse_header_page(table):
        header = {}
        flat_text = " ".join(filter(None, [str(item) for sublist in table for item in sublist])).replace("None", "").replace("\n","")

        period_covered = extract_period_covered(table)
        data["form_data"]["period"] = period_covered
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
                    "Transaction_Type": "Contribution",
                    "Source" : pdf_path
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
                        "Transaction_Type": "In-Kind Contribution",
                        "Description": description_line,
                        "Source" : pdf_path
                    })

            return results

        except Exception as e:
            print(f"Error parsing table: {e}")
            return results

    def parse_non_itemized_totals_into_records(data, end_of_reporting_period):
        contributions = []
        expenditures = []

        political_contributions = data["TOTAL POLITICAL CONTRIBUTIONS OF $50 OR LESS (OTHER THAN PLEDGES LOANS, OR GUARANTEES OF LOANS), UNLESS ITEMIZED"]
        political_expenditures = data["TOTAL POLITICAL EXPENDITURES OF $100 OR LESS UNLESS ITEMIZED"]

        if political_contributions > 0:
            contributions.append({
                "Transaction_Date": end_of_reporting_period,
                "Name": "TOTAL POLITICAL CONTRIBUTIONS OF $50 OR LESS",
                "Address": "N/A",
                "Amount": political_contributions,
                "Transaction_Type": "Contribution",
                "Source": pdf_path
            })
        if political_expenditures > 0:
            expenditures.append({
                "Transaction_Date": end_of_reporting_period,
                "Name": "TOTAL POLITICAL EXPENDITURES OF $100 OR LESS",
                "Address": "N/A",
                "Amount": political_expenditures,
                "Transaction_Type": "Expenditure",
                "Category": "N/A",
                "Description": "N/A",
                "Source": pdf_path
            })
        return contributions, expenditures

    def parse_expenditure_record(record):
        try:
            # Extract date and payee name
            date_and_payee = record[0][0].split("\n")
            date = date_and_payee[1]
            payee_name = record[0][1].split("\n")[1]

            # Extract amount and transaction type
            amount_data = record[1][0]
            #transaction_type = " ".join(amount_data.split("\n")[2:])
            
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
                    "Transaction_Type": "Expenditure",
                    "Category": category,
                    "Description": description,
                    "Source" : pdf_path
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
                if totals:
                    if data["form_data"]["period"]:   
                        end_of_reporting_period = data["form_data"]["period"].split("_")[-1].replace("-", "/")
                    else:
                        end_of_reporting_period = "badly_formatted_period"
                    print(f"Period: {end_of_reporting_period}")
                    data["candidate_info"]["report_totals"] = totals
                    non_itemized_contributions, non_itemized_expenditures = parse_non_itemized_totals_into_records(totals, end_of_reporting_period)
                    data["contributions"].extend(non_itemized_contributions)
                    data["expenditures"].extend(non_itemized_expenditures)
                    json_str = json.dumps(data["candidate_info"]["report_totals"], indent=4)
                    print(json_str)

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

def process_pdfs_from_links(related_tec_docs_filename, unmatched_tec_docs_filename, output_dir="pdf_files"):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    links = []
    if os.path.exists(related_tec_docs_filename):
        with open(related_tec_docs_filename, "r") as file:
            links.extend(line.strip() for line in file.readlines())

    if os.path.exists(unmatched_tec_docs_filename):
        with open(unmatched_tec_docs_filename, "r") as file:
            unmatched_links = [line.strip() for line in file.readlines()]
            links.extend(unmatched_links)

    for link in links:
        pdf_path = download_pdf(link, output_dir)
        if pdf_path:
            root_name = os.path.splitext(os.path.basename(pdf_path))[0]
            output_file = f"{root_name}.json"

            print(f"Processing {pdf_path}...")
            finance_data = extract_finance_data_from_table(pdf_path)
            
            finance_data["form_data"]["data_source"] = link
            parsed_last_name = finance_data["candidate_info"]["last_name"]
            if parsed_last_name.lower() not in LAST_NAME_CONFIG.lower():
                print(f"Skipping file {pdf_path} due to parsed name mismatch\nParsed: {parsed_last_name}\nConfigured: {LAST_NAME_CONFIG}\n")
                continue

            period_covered = finance_data["form_data"]["period"]
            last_name = finance_data["candidate_info"]["last_name"]
            if period_covered and last_name:
                pc = period_covered.replace("/", "-")
                output_file = f"{last_name}_{pc}_c_oh.json"

            total_contributions_monetary = round(sum(record["Amount"] for record in finance_data["contributions"]), 2)
            total_in_kind_contributions = round(sum(record["Amount"] for record in finance_data["in_kind_contributions"]), 2)
            total_contributions = total_contributions_monetary + total_in_kind_contributions
            total_expenditures = round(sum(record["Amount"] for record in finance_data["expenditures"]) + finance_data["candidate_info"]["report_totals"]["TOTAL POLITICAL EXPENDITURES OF $100 OR LESS UNLESS ITEMIZED"], 2)

            finance_data["candidate_info"]["report_totals"]["Total Parsed Contributions"] = total_contributions
            finance_data["candidate_info"]["report_totals"]["Total Parsed Expenditures"] = total_expenditures

            reported_total_contributions = finance_data["candidate_info"]["report_totals"]["TOTAL POLITICAL CONTRIBUTIONS (OTHER THAN PLEDGES, LOANS, OR GUARANTEES OF LOANS)"]\
                + finance_data["candidate_info"]["report_totals"]["TOTAL POLITICAL CONTRIBUTIONS OF $50 OR LESS (OTHER THAN PLEDGES LOANS, OR GUARANTEES OF LOANS), UNLESS ITEMIZED"]
            reported_total_expenditures = finance_data["candidate_info"]["report_totals"]["TOTAL POLITICAL EXPENDITURES"]\
                + finance_data["candidate_info"]["report_totals"]["TOTAL POLITICAL EXPENDITURES OF $100 OR LESS UNLESS ITEMIZED"]

            finance_data["candidate_info"]["report_totals"]["Total Itemized Reported Contributions"] = reported_total_contributions
            finance_data["candidate_info"]["report_totals"]["Total Itemized Reported Expenditures"] = reported_total_expenditures

            if (reported_total_contributions != total_contributions):
                print("***MISMATCHING CONTRIBUTION TOTAL***\n\n")
                finance_data["candidate_info"]["report_totals"]["Contribution Mismatch"] = True
            elif (reported_total_expenditures != total_expenditures):
                print("***MISMATCHING EXPENDITURE TOTAL***\n\n")
                finance_data["candidate_info"]["report_totals"]["Expenditure Mismatch"] = True
            print("\n\n\n\n")
            with open(output_file, "w") as file:
                json.dump(finance_data, file, indent=4)

process_pdfs_from_links(related_tec_docs_filename, unmatched_tec_docs_filename)
