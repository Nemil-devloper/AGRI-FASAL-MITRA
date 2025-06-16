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

app = FastAPI()
MiddlewareType: Type[CORSMiddleware] = CORSMiddleware

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8002",
    "http://127.0.0.1:8002",
    "*"  # Allow all origins in development
]
app.add_middleware(
    MiddlewareType,
    allow_origins=origins,  # Allowed origins
    allow_credentials=True,  # Allow credentials (cookies, etc.)
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"]
)

# Load your models
potato_model = tf.keras.models.load_model("../models/1.keras")
bell_pepper_model = tf.keras.models.load_model("../models/2.keras")
tomato_model = tf.keras.models.load_model("../models/3.keras")
pest_model = tf.keras.models.load_model("../models/4.keras")


# Class names for each model
POTATO_CLASSES = ["Early Blight", "Late Blight", "Healthy"]
BELL_PEPPER_CLASSES = ["Bacterial Spot", "Healthy"]
TOMATO_CLASSES = ["Bacterial Spot", "Early Blight", "Late Blight", "Leaf Mold","Septoria Leaf Spot","Spider Mites Two Spotted Spider","Target Spot","Yellow Leaf Curl Virus","Mosaic virus","Healthy"]
PEST_CLASSES = ["ants","bees","beetle","catterpillar","earthworms","earwig","grasshopper","moth","slug","snail","wasp","weevil"]

@app.get("/ping")
async def ping():
    return {"message": "Hello, I am alive"}

def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    return image

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
    uvicorn.run(app, host='localhost', port=8002)
