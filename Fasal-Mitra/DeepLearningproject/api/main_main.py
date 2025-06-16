from fastapi import FastAPI, File, UploadFile
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
from starlette.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from typing import Type
from fastapi.responses import JSONResponse
import requests
import bs4
import time
import threading
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import pathlib

app = FastAPI()
MiddlewareType: Type[CORSMiddleware] = CORSMiddleware

# Get the current directory
CURRENT_DIR = pathlib.Path(__file__).parent.absolute()
BASE_DIR = CURRENT_DIR.parent

# Policy-related constants with absolute paths
POLICY_URL = "https://pib.gov.in/PressReleaseIframePage.aspx?PRID=2002012"
POLICY_DIR = os.path.join(BASE_DIR, "policys")
POLICY_FILE_PATH = os.path.join(POLICY_DIR, "webpage_data.html")
POLICY_BACKUP_FILE = os.path.join(POLICY_DIR, "webpage_data_backup.html")

# Create policys directory if it doesn't exist
os.makedirs(POLICY_DIR, exist_ok=True)

# Update CORS configuration to match your frontend
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://agri-fasal-mitra.vercel.app",
    "https://agri-fasal-mitra.onrender.com",
    "http://localhost:8002",
    "http://127.0.0.1:8002"
]

app.add_middleware(
    MiddlewareType,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Load ML models with absolute paths
MODELS_DIR = os.path.join(BASE_DIR, "models")
potato_model = tf.keras.models.load_model(os.path.join(MODELS_DIR, "1.keras"))
bell_pepper_model = tf.keras.models.load_model(os.path.join(MODELS_DIR, "2.keras"))
tomato_model = tf.keras.models.load_model(os.path.join(MODELS_DIR, "3.keras"))
pest_model = tf.keras.models.load_model(os.path.join(MODELS_DIR, "4.keras"))

# Class names for each model
POTATO_CLASSES = ["Early Blight", "Late Blight", "Healthy"]
BELL_PEPPER_CLASSES = ["Bacterial Spot", "Healthy"]
TOMATO_CLASSES = ["Bacterial Spot", "Early Blight", "Late Blight", "Leaf Mold","Septoria Leaf Spot","Spider Mites Two Spotted Spider","Target Spot","Yellow Leaf Curl Virus","Mosaic virus","Healthy"]
PEST_CLASSES = ["ants","bees","beetle","catterpillar","earthworms","earwig","grasshopper","moth","slug","snail","wasp","weevil"]

# Policy-related functions
def fetch_webpage_data():
    """Fetch webpage content and save only tables."""
    try:
        print(f"Fetching policy data from {POLICY_URL}")
        response = requests.get(POLICY_URL, timeout=10)
        response.raise_for_status()
        soup = bs4.BeautifulSoup(response.text, "html.parser")

        # Remove unwanted elements
        for tag in soup(["script", "style", "img", "nav", "footer", "header", "aside"]):
            tag.decompose()

        # Extract main content
        main_content = soup.find("div", class_="innner-page-main-about-us-content-right-part")
        if not main_content:
            main_content = soup.find("div", class_="col-sm-12")
        if not main_content:
            main_content = soup.find("body")

        # Extract only tables
        tables = main_content.find_all("table") if main_content else []
        table_content = "".join(str(table) for table in tables)

        if not table_content:
            print("No tables found on the webpage.")
            return

        # Structured HTML output
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

        # Backup and save
        if os.path.exists(POLICY_FILE_PATH):
            os.replace(POLICY_FILE_PATH, POLICY_BACKUP_FILE)
            print(f"Backed up existing file to {POLICY_BACKUP_FILE}")

        with open(POLICY_FILE_PATH, "w", encoding="utf-8") as file:
            file.write(extracted_html)
            print(f"Saved new policy data to {POLICY_FILE_PATH}")

        print("Policy data updated successfully.")

    except requests.RequestException as e:
        print(f"Error fetching policy data: {e}")
        if os.path.exists(POLICY_BACKUP_FILE):
            os.replace(POLICY_BACKUP_FILE, POLICY_FILE_PATH)
            print("Restored from backup.")
        else:
            print("No backup available to restore.")
    except Exception as e:
        print(f"Unexpected error: {e}")

def update_policy_data_periodically(interval=259200):  # 3 days
    """Updates the policy data periodically."""
    while True:
        fetch_webpage_data()
        time.sleep(interval)

# Start policy update thread
policy_update_thread = threading.Thread(target=update_policy_data_periodically, daemon=True)
policy_update_thread.start()

# Helper function for image processing
def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    return image

# API Routes
@app.get("/ping")
async def ping():
    return {"message": "Hello, I am alive"}

@app.get("/api/policy")
async def get_policy_data():
    """Get policy data endpoint."""
    try:
        if not os.path.exists(POLICY_FILE_PATH):
            print(f"Policy file not found at {POLICY_FILE_PATH}")
            # Try to fetch the data if file doesn't exist
            fetch_webpage_data()
            if not os.path.exists(POLICY_FILE_PATH):
                return JSONResponse(
                    status_code=404,
                    content={"error": "Policy data not found. Please try again later."}
                )
            
        with open(POLICY_FILE_PATH, "r", encoding="utf-8") as file:
            data = file.read()
            
        return JSONResponse(
            content={"webpage_html": data},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        )
    except Exception as e:
        print(f"Error reading policy file: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Error reading policy data: {str(e)}"}
        )

@app.post("/predict/potato")
async def predict_potato(file: UploadFile = File(...)):
    image = read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, 0)
    predictions = potato_model.predict(img_batch)
    predicted_class = POTATO_CLASSES[np.argmax(predictions[0])]
    confidence = np.max(predictions[0])
    return {"class": predicted_class, "confidence": float(confidence)}

@app.post("/predict/bell_pepper")
async def predict_bell_pepper(file: UploadFile = File(...)):
    image = read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, 0)
    predictions = bell_pepper_model.predict(img_batch)
    predicted_class = BELL_PEPPER_CLASSES[np.argmax(predictions[0])]
    confidence = np.max(predictions[0])
    return {"class": predicted_class, "confidence": float(confidence)}

@app.post("/predict/tomato")
async def predict_tomato(file: UploadFile = File(...)):
    image = read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, 0)
    predictions = tomato_model.predict(img_batch)
    predicted_class = TOMATO_CLASSES[np.argmax(predictions[0])]
    confidence = np.max(predictions[0])
    return {"class": predicted_class, "confidence": float(confidence)}

@app.post("/predict/pest")
async def predict_pest(file: UploadFile = File(...)):
    image = read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, 0)
    predictions = pest_model.predict(img_batch)
    predicted_class = PEST_CLASSES[np.argmax(predictions[0])]
    confidence = np.max(predictions[0])
    return {"class": predicted_class, "confidence": float(confidence)}

if __name__ == "__main__":
    # Initial policy data fetch
    print("Starting initial policy data fetch...")
    print(f"Current directory: {CURRENT_DIR}")
    print(f"Base directory: {BASE_DIR}")
    print(f"Policy directory: {POLICY_DIR}")
    print(f"Policy file path: {POLICY_FILE_PATH}")
    
    fetch_webpage_data()
    
    # Start the FastAPI server
    uvicorn.run(app, host='0.0.0.0', port=8002)
