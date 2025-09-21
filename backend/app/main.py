from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import create_engine, Column, Integer, String, TIMESTAMP
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# FastAPI app instance
app = FastAPI()

# PostgreSQL database configuration
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:vishu%4020052@localhost:5432/oceanic_hazards"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
# Database model for the reports table
class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    image_name = Column(String)
    tag = Column(String)
    latitude = Column(String)
    longitude = Column(String)
    location_name = Column(String)
    submission_date = Column(TIMESTAMP)
# Configure CORS
origins = [
    "http://localhost:5173",  # Your frontend's address
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# A simple in-memory list to store reports for now
# We will replace this with a proper database connection later
reports_db = []

# Pydantic model to validate the incoming data from the frontend
class ReportData(BaseModel):
    tag: str
    latitude: str
    longitude: str
    locationName: str
    submissionDate: str

# API endpoint to receive a new report
# API endpoint to receive a new report
@app.post("/submit_report/")
async def submit_report(
    image: UploadFile = File(...),
    tag: str = Form(...),
    latitude: str = Form(...),
    longitude: str = Form(...),
    locationName: str = Form(...),
    submissionDate: str = Form(...)
):
    # Create a database session
    db = SessionLocal()
    
    try:
        # Create a new Report instance with the incoming data
        new_report = Report(
            image_name=image.filename,
            tag=tag,
            latitude=latitude,
            longitude=longitude,
            location_name=locationName,
            submission_date=submissionDate
        )

        # Add the new report to the database session
        db.add(new_report)
        # Commit the transaction to save the data
        db.commit()
        # Refresh the instance to get the new primary key (id)
        db.refresh(new_report)

        print("Received new report:")
        print(new_report.__dict__)

        return {"message": "Report received successfully!", "report": new_report}

    finally:
        # Close the database session
        db.close()
# API endpoint to fetch all reports
@app.get("/reports")
async def get_reports():
    db = SessionLocal()
    try:
        # Query all reports from the database
        reports = db.query(Report).all()
        return reports
    finally:
        db.close()