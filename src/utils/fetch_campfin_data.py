from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import json

driver = webdriver.Chrome()

# Open the target webpage
driver.get("https://campfin.dallascityhall.com/search.aspx")

# Set search parameters
search_last_name_query = "Mendelsohn"
transaction_type_query = "Contributions"
start_year = "2019"
end_year = "2025"

# Convert the existing headers (left) to standardized headers (right)
header_mapping = {
    "Report:": "Report",
    "S/R:": "S/R",
    "Name:": "Name",
    "Contact Type:": "Contact_Type",
    "ReportId": "ReportId",
    "Report Type:": "Report_Type",
    "Amount:": "Amount",
    "Cand/Committee:": "Recipient",
    "Transaction Date:": "Transaction_Date",
    "Date/Time Submitted:": "Date_Time_Submitted"
}
save_file_name = f"{search_last_name_query}_{transaction_type_query}_{start_year}_{end_year}"


# Locate and fill search inputs
last_name_box = driver.find_element(By.ID, "txtLName")
dropdown_start_year = driver.find_element(By.ID, "SDateYYYY")
dropdown_end_year = driver.find_element(By.ID, "EDateYYYY")
dropdown_transaction_type = driver.find_element(By.ID, "TranType")

last_name_box.send_keys(search_last_name_query)
Select(dropdown_transaction_type).select_by_visible_text(transaction_type_query)
Select(dropdown_start_year).select_by_visible_text(start_year)
Select(dropdown_end_year).select_by_visible_text(end_year)

submit_button = driver.find_element(By.ID, "btnSearch")
submit_button.send_keys(Keys.RETURN)

time.sleep(5)

data = []
removed_records = []

all_campfin_docs_links = set()

def extract_table_data():
    global data, all_campfin_docs_links

    results_table = driver.find_element(By.ID, "DataGrid1")
    rows = results_table.find_elements(By.TAG_NAME, "tr")
    

    headers = [header.text for header in rows[0].find_elements(By.TAG_NAME, "td")]

    for row in rows[1:]:
        cells = row.find_elements(By.TAG_NAME, "td")
        if len(cells) == len(headers):
            row_data = {}
            for i in range(len(headers)):
                if headers[i] == "S/R:" or headers[i] == "Report:":
                    link_element = cells[i].find_element(By.TAG_NAME, "a") if cells[i].find_elements(By.TAG_NAME, "a") else None
                    if link_element:
                        row_data[headers[i]] = link_element.get_attribute("href")
                        all_campfin_docs_links.add(link_element.get_attribute("href"))
                    else:
                        row_data[headers[i]] = cells[i].text
                else:
                    row_data[headers[i]] = cells[i].text
            data.append(row_data)

seen_pages = set()
all_page_links = set()
while True:
    try:
        results_table = driver.find_element(By.ID, "DataGrid1")
        pagination_row = results_table.find_elements(By.TAG_NAME, "tr")[-1]
        page_links = pagination_row.find_elements(By.TAG_NAME, "a")

        next_page_found = False
        for link in page_links:
            if link.text not in seen_pages:
                seen_pages.add(link.text)
                print(f"Navigating to page {link.text}")

                link = driver.find_element(By.LINK_TEXT, link.text)
                link.click()

                time.sleep(5)

                extract_table_data()
                next_page_found = True
                break

        if not next_page_found:
            break
    except Exception as e:
        print(f"No more pages or error occurred: {e}")
        break

driver.quit()


def remove_duplicates(data):
    seen_records = {}

    for record in data:
        key = (record['Name:'], record['Amount:'], record['Transaction Date:'])

        # Preserve the Correction record and remove Old record
        if key in seen_records:
            if "Correction" in record["Report Type:"]:
                removed_records.append(seen_records[key])
                seen_records[key] = record
        else:
            seen_records[key] = record

    return list(seen_records.values())

# Search results may contain records that don't pertain to the candidate, remove those records.
#THIS ISN'T WORKING; SEE PHILLIP KINGSTON AND ERIC JOHNSON RECORDS IN CHAD WEST DATASET
def remove_unrelated_records(data):
    for record in data:
        if search_last_name_query not in record["Cand/Committee:"]:
            data.remove(record)
            removed_records.append(record)
    return data

print("Begin data cleaning")
cleaned_data = remove_duplicates(data)
cleaned_data = remove_unrelated_records(cleaned_data)

with open(save_file_name + "_removed" + ".json", "w") as f:
    json.dump(removed_records, f, ensure_ascii=False, indent=4)

def rename_keys(json_obj, mapping):
    return {mapping.get(key, key): value for key, value in json_obj.items()}

# Amount may be saved as a string with $ prefix, convert to simple float
def convert_amount_to_number(data):
    for obj in data:
        if "Amount" in obj:
            obj["Amount"] = float(obj["Amount"].replace("$", "").replace(",",""))
    return data

def extract_address_from_name_field(data):
    for obj in data:
        if "Name" in obj:
            parts = obj["Name"].split("\n", 1)
            obj["Name"] = parts[0]
            obj["Address"] = parts[1] if len(parts) > 1 else ""
    return data


renamed_data = [rename_keys(obj, header_mapping) for obj in cleaned_data]
renamed_data = convert_amount_to_number(renamed_data)
renamed_data = extract_address_from_name_field(renamed_data)

print("Writing to file")
with open(save_file_name + ".json", "w") as f:
    json.dump(renamed_data, f, ensure_ascii=False, indent=4)

with open(save_file_name + ".txt", "w") as file:
    for item in all_campfin_docs_links:
        file.write(f"{item}\n")

print("Complete.")