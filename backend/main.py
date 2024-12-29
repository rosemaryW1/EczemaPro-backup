from fastapi import FastAPI, File, UploadFile
import boto3
from botocore.exceptions import NoCredentialsError, ClientError
import uuid
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array, load_img
import numpy as np
import os
from dotenv import load_dotenv
load_dotenv()


app = FastAPI()

# AWS S3 Configuration
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")
AWS_REGION = os.getenv("AWS_REGION")

# print(AWS_ACCESS_KEY, AWS_SECRET_KEY)

# Path to the model
MODEL_PATH = "models/balanced_resnet50_eczema_model.h5"

# Load the model
model = load_model(MODEL_PATH)
print("Model loaded successfully")


def predict_image(file_path):
    try:
        # Load the image with target size for the model
        image = load_img(file_path, target_size=(224, 224))  # Adjust size if required by the model
        image = img_to_array(image)
        image = np.expand_dims(image, axis=0)
        image = image / 255.0  # Normalize pixel values

        # Make prediction
        predictions = model.predict(image)

        # Convert predictions to a JSON-serializable format
        if hasattr(predictions, "tolist"):
            predictions = predictions.tolist()

        return predictions

    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}


# Initialize S3 Client
s3_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=AWS_REGION,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with specific origins for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Debugging: Log received file details
        print(f"Received file: {file.filename}, Content type: {file.content_type}")

        # Validate file type
        if file.content_type not in ["image/jpeg", "image/png"]:
            return {"error": "Invalid file type. Only JPEG and PNG are allowed."}

        # Generate a unique filename
        local_file_name = f"temp_{uuid.uuid4()}.jpg"
        file_key = f"images/{uuid.uuid4()}.jpg"

        # Save file locally for prediction
        with open(local_file_name, "wb") as temp_file:
            temp_file.write(file.file.read())

        # Perform prediction
        prediction = predict_image(local_file_name)

        # Remove local file after prediction
        os.remove(local_file_name)

        # Upload to S3 (without ACL)
        file.file.seek(0)  # Reset file pointer for upload
        s3_client.upload_fileobj(
            file.file,
            AWS_BUCKET_NAME,
            file_key,
            ExtraArgs={"ContentType": file.content_type},
        )

        # Generate the public URL
        public_url = f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{file_key}"

        return {"success": True, "url": public_url, "prediction": prediction}

    except NoCredentialsError:
        return {"error": "AWS credentials not available"}

    except ClientError as e:
        return {"error": f"AWS error: {e.response['Error']['Message']}"}

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
