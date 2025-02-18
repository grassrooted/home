import json

output_file = "conflicts_resolved.json"

def merge_contributions(authoritative, supplementary):
    for type in ["contributions", "expenditures"]:

        authoritative_records = authoritative[type]
        supplementary_records = supplementary[type]
        
        for auth_record in authoritative_records:
            matching_supp_record = next(
                (supp_record for supp_record in supplementary_records
                if supp_record["Transaction_Date"] == auth_record["Transaction_Date"]
                and supp_record["Amount"] == auth_record["Amount"]
                and (supp_record["Name"] == auth_record["Name"] or supp_record["Address"] == auth_record["Address"])),
                None
            )
            
            if matching_supp_record:
                for key, value in matching_supp_record.items():
                    if key not in auth_record or auth_record[key] in (None, ""):
                        print(f"Key: {key}\nValue: {value}\n\n")
                        auth_record[key] = value
    return authoritative

# Example usage
authoritative_data = {}
authoritative_file_path = "chad_west_contributions_expenditures_auth.json"
with open(authoritative_file_path, 'r') as file:
    authoritative_data = json.load(file)

supplementary_data = {}
supplementary_file_path = "Chad_West_contributions_expenditures_supp.json"
with open(supplementary_file_path, 'r') as file:
    supplementary_data = json.load(file)


merged_data = merge_contributions(authoritative_data, supplementary_data)
with open(output_file, 'w') as outfile:
    json.dump(merged_data, outfile, indent=4)
