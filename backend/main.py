import psycopg2
import os
import shutil
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, HTTPException, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create the uploads directory if it doesn't exist
UPLOAD_DIR = "./uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="oceanic_hazards",
            user="postgres",
            password="vishu@20052",
            cursor_factory=RealDictCursor  # Returns dicts instead of tuples
        )
        return conn
    except psycopg2.OperationalError as e:
        print(f"Database connection failed: {e}")
        raise HTTPException(status_code=500, detail="Could not connect to the database.")

class ReportCreate(BaseModel):
    tag: str
    latitude: Optional[float]
    longitude: Optional[float]
    location_name: str
    image_name: str
    submission_date: str

class DashboardData(BaseModel):
    reports: List[Dict]
    locations: List[Dict]
    event_tag_counts: List[Dict]

@app.get("/user/dashboard", response_model=DashboardData)
def get_dashboard_data():
    """Fetches all data for the user dashboard from the database."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Fetch all reports from 'reports' table
        cursor.execute("SELECT * FROM reports")
        reports = cursor.fetchall()  # Already dicts because of RealDictCursor

        # Locations with valid coordinates
        locations = [
            {'latitude': r['latitude'], 'longitude': r['longitude']}
            for r in reports if r['latitude'] is not None and r['longitude'] is not None
        ]

        # Count reports by tag
        cursor.execute("SELECT tag, COUNT(*) as count FROM reports GROUP BY tag")
        event_tag_counts = cursor.fetchall()

        return {
            "reports": reports,
            "locations": locations,
            "event_tag_counts": event_tag_counts
        }
    finally:
        if conn:
            conn.close()

@app.post("/submit_report/")
def submit_report(
    image: UploadFile = File(...),
    tag: str = Form(...),
    latitude: str = Form(None),
    longitude: str = Form(None),
    locationName: str = Form(...),
    submissionDate: str = Form(...),
):
    """Submits a new hazard report to the database, including image upload."""
    conn = None
    try:
        # Save the uploaded file to the 'uploads' directory
        file_location = f"{UPLOAD_DIR}/{image.filename}"
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        # Convert empty strings for latitude and longitude to None
        parsed_latitude = float(latitude) if latitude else None
        parsed_longitude = float(longitude) if longitude else None

        conn = get_db_connection()
        cursor = conn.cursor()

        # Parse the ISO 8601 submission date string from the frontend.
        # .fromisoformat() is used to handle the 'YYYY-MM-DDTHH:MM:SS.sssZ' format.
        parsed_date = datetime.fromisoformat(submissionDate.replace('Z', '+00:00')).date()

        cursor.execute("""
            INSERT INTO reports (image_name, tag, latitude, longitude, location_name, submission_date)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            image.filename,
            tag,
            parsed_latitude,
            parsed_longitude,
            locationName,
            parsed_date
        ))

        new_id = cursor.fetchone()["id"]
        conn.commit()

        return {"message": "Report submitted successfully", "id": new_id}

    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")
    finally:
        if conn:
            conn.close()
