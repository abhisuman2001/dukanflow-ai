"""
seed.py — Populate the database with demo customer data for DukaanFlow.

Safe to run multiple times — uses upsert keyed on phone number,
so existing customers are never duplicated.

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


def seed():
    uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("MONGODB_DATABASE")

    if not uri or not db_name:
        raise EnvironmentError(
            "MONGODB_URI and MONGODB_DATABASE must be set in .env"
        )

    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    db = client[db_name]
    collection = db["customers"]

    inserted = 0
    skipped = 0

    for customer in CUSTOMERS:
        result = collection.update_one(
            {"phone": customer["phone"]},   # lookup key
            {"$setOnInsert": customer},      # only write on insert, never overwrite
            upsert=True,
        )
        if result.upserted_id:
            inserted += 1
            print(f"  ✅ Inserted: {customer['name']} ({customer['phone']})")
        else:
            skipped += 1
            print(f"  ⏭  Skipped (already exists): {customer['name']} ({customer['phone']})")

    print(f"\nDone — {inserted} inserted, {skipped} already existed.")
    client.close()


if __name__ == "__main__":
    seed()
