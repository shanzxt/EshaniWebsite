from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

class ContactMessageCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    message: str = Field(min_length=1, max_length=4000)

@api_router.post("/messages")
async def create_message(input: ContactMessageCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "name": input.name,
        "email": input.email,
        "message": input.message,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.messages.insert_one(doc)
    resend_key = os.environ.get("RESEND_API_KEY")
    if resend_key:
        try:
            import resend
            resend.api_key = resend_key
            html = (
                '<table style="font-family:monospace;font-size:14px;line-height:1.7;color:#111">'
                f'<tr><td style="padding:4px 16px 4px 0;color:#666">From</td><td>{input.name} &lt;{input.email}&gt;</td></tr>'
                f'<tr><td style="padding:4px 16px 4px 0;color:#666;vertical-align:top">Message</td><td>{input.message}</td></tr>'
                '</table>'
            )
            params = {
                "from": os.environ.get("SENDER_EMAIL", "onboarding@resend.dev"),
                "to": [os.environ.get("CONTACT_INBOX", "eshani.swdesign@gmail.com")],
                "subject": f"Portfolio enquiry from {input.name}",
                "html": html,
            }
            await asyncio.to_thread(resend.Emails.send, params)
        except Exception as e:
            logger.error(f"Email notification failed: {e}")
    return {"status": "received", "id": doc["id"]}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()