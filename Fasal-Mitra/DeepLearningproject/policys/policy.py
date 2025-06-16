import requests
import bs4
from flask import Flask, jsonify
import time
from flask_cors import CORS
import threading
import os

app = Flask(__name__)
CORS(app)

url = "https://pib.gov.in/PressReleaseIframePage.aspx?PRID=2002012"
file_path = "webpage_data.html"
backup_file = "webpage_data_backup.html"


def fetch_webpage_data():
    """Fetch webpage content and save only tables (no text)."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = bs4.BeautifulSoup(response.text, "html.parser")

        # Remove unwanted elements
        for tag in soup(["script", "style", "img", "nav", "footer", "header", "aside"]):
            tag.decompose()

        # Extract main content
        main_content = soup.find("div", class_="innner-page-main-about-us-content-right-part")
        if not main_content:
            main_content = soup.find("div", class_="col-sm-12")  # Adjust based on actual structure
        if not main_content:
            main_content = soup.find("body")  # Fallback if no specific div is found

        # Extract only tables
        tables = main_content.find_all("table") if main_content else []
        table_content = "".join(str(table) for table in tables)

        if not table_content:
            print("No tables found on the webpage.")
            return

        # Structured HTML output (only tables)
        extracted_html = f"""
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Extracted Policy Tables</title>
            <style>
                body {{ font-family: Arial, sans-serif; }}
                h2 {{ text-align: center; }}
                table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                th {{ background-color: #f2f2f2; }}
            </style>
        </head>
        <body>
        <h2>Policy Tables</h2>
        {table_content}
        </body>
        </html>
        """

        # Backup the current data before overwriting
        if os.path.exists(file_path):
            os.replace(file_path, backup_file)

        # Save the new data
        with open(file_path, "w", encoding="utf-8") as file:
            file.write(extracted_html)

        print("Data updated successfully (Only Tables).")

    except requests.RequestException as e:
        print(f"Error fetching webpage data: {e}")

        # Restore from backup if available
        if os.path.exists(backup_file):
            os.replace(backup_file, file_path)
            print("Restored from backup.")
        else:
            print("No backup available to restore.")


def update_data_periodically(interval=259200):
    """Updates the webpage data every 3 days."""
    while True:
        fetch_webpage_data()
        time.sleep(interval)


@app.route('/api/policy', methods=['GET'])
def get_policy_data():
    """Reads the HTML file (only tables) and serves it."""
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            data = file.read()
        return jsonify({"webpage_html": data})
    except FileNotFoundError:
        return jsonify({"error": "Data file not found. Please wait for the next update."})


# Start background thread to update data every 3 days
update_thread = threading.Thread(target=update_data_periodically, daemon=True)
update_thread.start()

if __name__ == '__main__':
    print("Starting initial data fetch...")
    fetch_webpage_data()  # Initial data fetch
    app.run(debug=True, port=5002)
