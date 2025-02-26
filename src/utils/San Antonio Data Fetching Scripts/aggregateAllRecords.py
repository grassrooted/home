import os
import json
import shutil

FIRST = "Marc"
LAST = "Whyte"
folder = f"{FIRST} {LAST}/"
output_file = f"{FIRST}_{LAST}_contributions_expenditures.json"
unique_sources_file = "unique_sources.txt"

def clean_string(value):
    if isinstance(value, str):
        return value.encode('utf-8').decode('unicode_escape').strip()
    return value

all_contributions = []
all_expenditures = []
unique_sources = set()

for filename in os.listdir(folder):
    if filename.endswith(".json"):
        file_path = os.path.join(folder, filename)
        with open(file_path, 'r') as file:
            try:
                data = json.load(file)
                
                contributions = data.get("contributions", [])
                for contribution in contributions:
                    contribution = {key: clean_string(value) for key, value in contribution.items()}
                    contribution["Recipient"] = f"{FIRST} {LAST}"
                    if "Source" in contribution:
                        unique_sources.add(contribution["Source"])
                    all_contributions.append(contribution)
                expenditures = data.get("expenditures", [])
                for expenditure in expenditures:
                    expenditure = {key: clean_string(value) for key, value in expenditure.items()}
                    expenditure["Recipient"] = f"{FIRST} {LAST}"
                    if "Source" in expenditure:
                        unique_sources.add(expenditure["Source"])
                    all_expenditures.append(expenditure)

            except json.JSONDecodeError:
                print(f"Error decoding JSON in file: {filename}")

aggregated_data = {
    "contributions": all_contributions,
    "expenditures": all_expenditures
}

with open(output_file, 'w') as outfile:
    json.dump(aggregated_data, outfile, indent=4)

print(f"Aggregated data has been written to {output_file}")

with open(unique_sources_file, 'w') as source_file:
    source_file.write("\n".join(unique_sources))

print(f"Unique sources have been written to {unique_sources_file}")

for source in unique_sources:
    origin_path = os.path.join(f"downloaded_pdfs_{FIRST}_{LAST}", source)
    if os.path.exists(origin_path):
        destination_path = os.path.join(folder, os.path.basename(source))
        shutil.move(origin_path, destination_path)
        print(f"Moved file: {source} to {destination_path}")
    else:
        print(f"Source file not found: {source}")
