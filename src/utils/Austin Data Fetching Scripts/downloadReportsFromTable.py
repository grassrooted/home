
# import pandas lib as pd
import pandas as pd
import requests, os

CAMPAIGN = "Alter, Alison B."
filename = "AustinReportDetail_May_30_2025.csv"

raw_df = pd.read_csv(filename)
print(f"TOTAL Reports Found: {len(raw_df)}")
campaign_df = raw_df.loc[raw_df['Filer_Name'] == CAMPAIGN]
links_column = campaign_df['View_Report'].tolist()
report_links = []

for line in links_column:
    link = line.replace("View Report", "")\
                .replace("(", "")\
                .replace(")", "")\
                .strip()
    report_links.append(link)

print(f"TOTAL Reports Found for <{CAMPAIGN}>: {len(report_links)}")

unique_report_links = set(report_links)
print(f"UNIQUE Reports Found for <{CAMPAIGN}>: {len(unique_report_links)}")

def extract_filename_from_url(url):
    return url.split("/")[-1]

def download_pdf(url, output_dir):
    try:
        filename = f"{CAMPAIGN}_{extract_filename_from_url(url)}".replace(".","")+".pdf"
        filepath = os.path.join(output_dir, filename)

        if not os.path.exists(filepath):
            response = requests.get(url)
            with open(filepath, "wb") as file:
                file.write(response.content)
        else:
            print(f"{filename} already exists locally.")
        return filepath
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return None


def process_pdfs_from_links(links, output_dir=CAMPAIGN):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for link in links:
        pdf_path = download_pdf(link, output_dir)
        if pdf_path:
            print(f"{pdf_path} SUCCESS")
        else:
            print("ERROR")

process_pdfs_from_links(report_links)