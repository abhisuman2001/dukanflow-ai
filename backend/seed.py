"""
seed.py — Populate the database with demo customer and technician data for DukaanFlow.

Safe to run multiple times — uses upsert keyed on phone number,
so existing records are never duplicated.

Run with:
    .venv\\Scripts\\python seed.py
"""

import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

CUSTOMERS = [
    {
        "name": "Rahul Sharma",
        "phone": "9876543210",
        "email": "rahul.sharma@example.com",
        "address": "Dhanbad, Jharkhand",
        "preferred_time": "evening",
    },
    {
        "name": "Priya Singh",
        "phone": "9876543211",
        "email": "priya.singh@example.com",
        "address": "Bokaro, Jharkhand",
        "preferred_time": "morning",
    },
    {
        "name": "Amit Kumar",
        "phone": "9876543212",
        "email": "amit.kumar@example.com",
        "address": "Ranchi, Jharkhand",
        "preferred_time": "evening",
    },
]

TECHNICIANS = [
    {
        "name": "Ravi Prasad",
        "phone": "9800000001",
        "skills": ["AC", "refrigerator"],
        "rating": 4.8,
        "experience_years": 7,
        "unavailable_dates": [],
    },
    {
        "name": "Suresh Mahto",
        "phone": "9800000002",
        "skills": ["washing_machine", "microwave"],
        "rating": 4.5,
        "experience_years": 5,
        "unavailable_dates": ["2026-09-12"],
    },
    {
        "name": "Deepak Yadav",
        "phone": "9800000003",
        "skills": ["geyser", "AC", "microwave"],
        "rating": 4.7,
        "experience_years": 6,
        "unavailable_dates": [],
    },
    {
        "name": "Meena Devi",
        "phone": "9800000004",
        "skills": ["washing_machine", "refrigerator", "geyser"],
        "rating": 4.9,
        "experience_years": 8,
        "unavailable_dates": ["2026-09-15"],
    },
]


def seed_collection(collection, records, key_field: str, label: str):
    inserted = 0
    skipped = 0
    for record in records:
        result = collection.update_one(
            {key_field: record[key_field]},   # lookup key
            {"$setOnInsert": record},          # only write on insert, never overwrite
            upsert=True,
        )
        if result.upserted_id:
            inserted += 1
            print(f"  ✅ Inserted {label}: {record['name']} ({record[key_field]})")
        else:
            skipped += 1
            print(f"  ⏭  Skipped (exists): {record['name']} ({record[key_field]})")
    return inserted, skipped


def seed():
    uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("MONGODB_DATABASE")

    if not uri or not db_name:
        raise EnvironmentError(
            "MONGODB_URI and MONGODB_DATABASE must be set in .env"
        )

    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    db = client[db_name]

    print("\n── Customers ──")
    ci, cs = seed_collection(db["customers"], CUSTOMERS, "phone", "customer")

    print("\n── Technicians ──")
    ti, ts = seed_collection(db["technicians"], TECHNICIANS, "phone", "technician")

    print(
        f"\nDone — customers: {ci} inserted, {cs} skipped | "
        f"technicians: {ti} inserted, {ts} skipped."
    )
    client.close()


if __name__ == "__main__":
    seed()
