import pdfplumber
import re
import json
import os
import requests
import logging
import subprocess

FIRST_NAME_CONFIG = "Zarin"
LAST_NAME_CONFIG = "Gracey"
input_all_campfin_docs = f"{FIRST_NAME_CONFIG}_{LAST_NAME_CONFIG}_2019_2025.txt"
output_unmatched_tec_file = f"unmatched_c_oh_files_{LAST_NAME_CONFIG}.txt"
output_related_sources_file = f"c_oh_related_sources_{LAST_NAME_CONFIG}.txt"
output_failed_docs = f"failed_documents_{LAST_NAME_CONFIG}.txt"
# Configure logging
log_file = "supplemental_parser.log"
logging.basicConfig(
    filename=log_file,
    filemode="a",  # Append mode
    format="%(asctime)s - %(levelname)s - %(message)s",
    level=logging.INFO,  # Set the default logging level
)

def find_all_similar_files(input_pdf, input_all_campfin_docs):
    similar_files = []
    input_file = input_pdf.split("/")[-1]
    input_suffix = input_file.split('_', 1)[-1]
    print(f"\n\nSearching Similar Files: {input_pdf}")
    print(f"input suffix: {input_suffix}")

    # Open the text file and search for matching suffixes
    with open(input_all_campfin_docs, 'r') as file:
        for line in file:
            line = line.strip()
            if line.endswith(input_suffix):
                print(f"Found: {line}")
                similar_files.append(line)
    return similar_files


def download_pdfs(file_path):
    related_coh_files = []
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"The file {file_path} does not exist.")
    
    logging.info(f"Extracting Campaign Finance Links from {file_path}")
    with open(file_path, 'r') as file:
        links = file.read().splitlines()
    
    output_dir = os.path.dirname(os.path.abspath(__file__))
    
    downloaded_files = []
    
    for link in links:
        try:
            filename = os.path.join(output_dir, os.path.basename(link))
            
            response = requests.get(link, stream=True)
            response.raise_for_status()
            
            with open(filename, 'wb') as pdf_file:
                pdf_file.write(response.content)
            
            downloaded_files.append(filename)
            logging.info(f"Downloaded: {filename}")
        
        except requests.exceptions.RequestException as e:
            logging.error(f"Failed to download {link}: {e}")
            filename = link.split("/")[-1]
            #print(f"Couldn't download {filename}")
            alternative_file = find_similar_file(filename, input_all_campfin_docs)
            related_coh_files.append(alternative_file)
            #print(f"*Try parsing: {alternative_file}\n")
            #subprocess.run(["python", "C_OH_report_extract_data.py", alternative_file])

    if related_coh_files:
        with open(output_related_sources_file, "w") as failed_file:
            for file_name in related_coh_files:
                failed_file.write(f"{file_name}\n")
        logging.info(f"Related C/OH files written to {output_related_sources_file}")

    downloaded_files.sort()
    return downloaded_files

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
            logging.warning(f"Error extracting period covered: {e}")
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
        logging.info(json_str)
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
                    "Transaction_Type": transaction_type,
                    "Source" : source_filename
                }
            return None
        except Exception:
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
            logging.warning(f"Error in extract_amount_and_description: {e}")
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
                        "Source" : source_filename
                    })

            return results

        except Exception as e:
            #logging.warning(f"Error parsing table: {e}")
            return results

    def parse_non_itemized_totals_into_records(data):
        contributions = []
        expenditures = []

        officeholder_contributions = data["candidate_info"]["report_totals"]["TOTAL OFFICEHOLDER CONTRIBUTIONS OF $50 OR LESS (OTHER THAN PLEDGES, LOANS, OR GUARANTEES OF LOANS), UNLESS ITEMIZED"]
        political_contributions = data["candidate_info"]["report_totals"]["TOTAL POLITICAL CONTRIBUTIONS OF $50 OR LESS (OTHER THAN PLEDGES LOANS, OR GUARANTEES OF LOANS), UNLESS ITEMIZED"]
        
        officeholder_expenditures = data["candidate_info"]["report_totals"]["TOTAL OFFICEHOLDER EXPENDITURES OF $100 OR LESS, UNLESS ITEMIZED"]
        political_expenditures = data["candidate_info"]["report_totals"]["TOTAL POLITICAL EXPENDITURES OF $100 OR LESS UNLESS ITEMIZED"]

        end_of_reporting_period = data["form_data"]["period"].split("_")[-1]
        if officeholder_contributions > 0:
            contributions.append({
                "Transaction_Date": end_of_reporting_period,
                "Name": "TOTAL OFFICEHOLDER CONTRIBUTIONS OF $50 OR LESS",
                "Address": "N/A",
                "Amount": officeholder_contributions,
                "Transaction_Type": "Officeholder Contribution",
                "Source": source_filename
            })
        if political_contributions > 0:
            contributions.append({
                "Transaction_Date": end_of_reporting_period,
                "Name": "TOTAL POLITICAL CONTRIBUTIONS OF $50 OR LESS",
                "Address": "N/A",
                "Amount": political_contributions,
                "Transaction_Type": "Campaign Contribution",
                "Source": source_filename
            })
        if officeholder_expenditures > 0:
            expenditures.append({
                "Transaction_Date": end_of_reporting_period,
                "Name": "TOTAL OFFICEHOLDER EXPENDITURES OF $100 OR LESS",
                "Address": "N/A",
                "Amount": officeholder_expenditures,
                "Transaction_Type": "Officeholder Expenditure",
                "Category": "N/A",
                "Description": "N/A",
                "Source": source_filename
            })
        if political_expenditures > 0:
            expenditures.append({
                "Transaction_Date": end_of_reporting_period,
                "Name": "TOTAL POLITICAL EXPENDITURES OF $100 OR LESS",
                "Address": "N/A",
                "Amount": political_expenditures,
                "Transaction_Type": "Campaign Expenditure",
                "Category": "N/A",
                "Description": "N/A",
                "Source": source_filename
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
            #logging.warning(f"Error parsing record: {e}")
            return None


    with pdfplumber.open(pdf_path) as pdf:
        source_filename = pdf_path.split("/")[-1]
        for page_num, page in enumerate(pdf.pages):
            page_title = "".join(page.extract_tables()[0][0][0])
            tables = page.extract_tables()
            if page_num == 0:
                logging.info(f"Page Title: {page_title}")
                header = parse_header_page(tables[0])
                if header:
                    data["candidate_info"] = header["candidate_info"]
                    end_of_reporting_period = data["form_data"]["period"].split("_")[-1].replace("-", "/")
                    print(f"Period: {end_of_reporting_period}")
                    non_itemized_contributions, non_itemized_expenditures = parse_non_itemized_totals_into_records(data)
                    data["contributions"].extend(non_itemized_contributions)
                    data["expenditures"].extend(non_itemized_expenditures)
                    
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

def is_supplemental_form(pdf_path):
    try:
        with pdfplumber.open(pdf_path) as pdf:
            # Check the first page for a supplemental form identifier
            first_page_text = pdf.pages[0].extract_text()
            # Define criteria to identify supplemental forms
            if "SUPPLEMENTAL" in first_page_text.upper():  # Adjust based on actual identifier
                return True
            return False
    except Exception as e:
        logging.warning(f"Error checking if form is supplemental: {e}")
        return False

def find_similar_file(input_pdf, input_all_campfin_docs):
    filename = input_pdf.split("/")[-1]
    input_suffix = input_pdf.split('_', 1)[-1]

    # Open the text file and search for matching suffixes
    with open(input_all_campfin_docs, 'r') as file:
        for line in file:
            line = line.strip()
            if line.endswith(input_suffix) and filename not in line:
                return line


def process_pdfs(pdf_files):
    failed_files = []
    for pdf_path in pdf_files:
        try:
            if not is_supplemental_form(pdf_path):
                continue
            logging.info(f"\n\nParsing: {pdf_path}")
            print(f"\nParsing: {pdf_path}")

            # set up default output filename
            root_name = os.path.splitext(pdf_path)[0]
            output_file = f"{root_name}_supplemental.json"

            finance_data = extract_finance_data_from_table(pdf_path)
            parsed_last_name = finance_data["candidate_info"]["last_name"]

            if parsed_last_name.lower() not in LAST_NAME_CONFIG.lower():
                logging.warning(f"Skipping file {pdf_path} due to parsed name mismatch\nParsed: {parsed_last_name}\nConfigured: {LAST_NAME_CONFIG}")
                print(f"Skipping file {pdf_path} due to parsed name mismatch\nParsed: {parsed_last_name}\nConfigured: {LAST_NAME_CONFIG}")
                continue
            
            related_file = find_similar_file(pdf_path, input_all_campfin_docs)
            finance_data["form_data"]["related files"] = related_file
            period_covered = finance_data["form_data"]["period"]
            if period_covered and parsed_last_name:
                pc = period_covered.replace("/", "-")
                output_file = f"{parsed_last_name}_{pc}_supplemental.json"

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

            logging.info(f"\nReported Contributions: {reported_total_contributions}")
            logging.info(f"Parsed Contributions: {total_contributions}")

            logging.info(f"\nReported Expenditures: {reported_total_expenditures}")
            logging.info(f"Parsed Expenditures: {total_expenditures}")
            if (reported_total_contributions != total_contributions):
                logging.info("***MISMATCHING CONTRIBUTION TOTAL***\n\n")
                finance_data["candidate_info"]["report_totals"]["Contribution Mismatch"] = True
            elif (reported_total_expenditures != total_expenditures):
                logging.info("***MISMATCHING EXPENDITURE TOTAL***\n\n")
                finance_data["candidate_info"]["report_totals"]["Expenditure Mismatch"] = True
            
            all_similar_links = find_all_similar_files(pdf_path, input_all_campfin_docs)
            finance_data["form_data"]["data_source"] = all_similar_links
            logging.info(f"Writing Records to {output_file}")
            with open(output_file, "w") as file:
                json.dump(finance_data, file, indent=4)
        except Exception as e:
            logging.error(f"Error processing {pdf_path}: {e}")
            failed_files.append(pdf_path)
    # Write failed filenames to a text file
    if failed_files:
        with open(output_failed_docs, "w") as failed_file:
            for file_name in failed_files:
                failed_file.write(f"{file_name}\n")
        logging.info(f"Failed files written to failed_documents.txt")


def find_unmatched_tec_files(file_path):
    srp_ids = set()
    tec_files = {}

    with open(file_path, 'r') as file:
        for line in file:
            line = line.strip()
            
            # Regex to extract type (srp/tec) and numeric identifier
            match = re.search(r"/(srp|tec)(\d+)_", line)
            if match:
                file_type, file_id = match.groups()
                if file_type == "srp":
                    srp_ids.add(file_id)
                elif file_type == "tec":
                    tec_files[file_id] = line  # Store full URL

    # Identify 'tec' files without matching 'srp' files
    unmatched_tec_files = [url for file_id, url in tec_files.items() if file_id not in srp_ids]

    return unmatched_tec_files

try:
    downloaded_files = download_pdfs(input_all_campfin_docs)
    logging.info("\nDownloaded files (sorted):")
    for file in downloaded_files:
        logging.info(file)

    unmatched_tec_files = find_unmatched_tec_files(input_all_campfin_docs)
    if unmatched_tec_files:
        with open(output_unmatched_tec_file, "w") as file:
            for file_name in unmatched_tec_files:
                file.write(f"{file_name}\n")
        logging.info(f"Additional TEC files for parsing written to {output_unmatched_tec_file}")

    process_pdfs(downloaded_files)

except Exception as e:
    logging.error(f"Error: {e}")