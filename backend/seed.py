"""
seed.py — Populate the database with sample customer data for local development.
Run once: python seed.py
"""
import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

client = MongoClient(os.environ["MONGODB_URI"])
db = client[os.environ["MONGODB_DATABASE"]]

sample_customers = [
    {
        "name": "Ravi Sharma",
        "phone": "9876543210",
        "email": "ravi@example.com",
        "address": "12 MG Road, Bengaluru",
    },
    {
        "name": "Priya Patel",
        "phone": "9123456789",
        "email": "priya@example.com",
        "address": "45 SV Nagar, Hyderabad",
    },
    {
        "name": "Arjun Mehta",
        "phone": "9001234567",
        "email": "arjun@example.com",
        "address": "8 Civil Lines, Jaipur",
    },
]

result = db["customers"].insert_many(sample_customers)
print(f"Inserted {len(result.inserted_ids)} customers.")
