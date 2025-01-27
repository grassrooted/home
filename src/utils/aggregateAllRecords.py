import os
import json
import shutil

input_folder = "Tennell Atkins/"
output_file = "tennell_atkins_contributions_expenditures.json"
unique_sources_file = "unique_sources.txt"

def clean_string(value):
    if isinstance(value, str):
        return value.encode('utf-8').decode('unicode_escape').strip()
    return value

all_contributions = []
all_expenditures = []
unique_sources = set()

for filename in os.listdir(input_folder):
    if filename.endswith(".json"):
        file_path = os.path.join(input_folder, filename)
        with open(file_path, 'r') as file:
            try:
                data = json.load(file)
                
                contributions = data.get("contributions", [])
                for contribution in contributions:
                    contribution = {key: clean_string(value) for key, value in contribution.items()}
                    contribution["Recipient"] = "Tennell Atkins"
                    if "Source" in contribution:
                        unique_sources.add(contribution["Source"])
                all_contributions.extend(contributions)
                
                expenditures = data.get("expenditures", [])
                for expenditure in expenditures:
                    expenditure = {key: clean_string(value) for key, value in expenditure.items()}
                    expenditure["Recipient"] = "Tennell Atkins"
                    if "Source" in expenditure:
                        unique_sources.add(expenditure["Source"])
                all_expenditures.extend(expenditures)
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
    if os.path.exists(source):
        destination_path = os.path.join(input_folder, os.path.basename(source))
        shutil.move(source, destination_path)
        print(f"Moved file: {source} to {destination_path}")
    else:
        print(f"Source file not found: {source}")
