import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ConfigurationError
from dotenv import load_dotenv

load_dotenv()

_client: MongoClient | None = None
_db = None


def get_client() -> MongoClient:
    """Return the singleton MongoClient, creating it on first call."""
    global _client
    if _client is None:
        uri = os.getenv("MONGODB_URI")
        if not uri:
            raise ConfigurationError("MONGODB_URI environment variable is not set.")
        _client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    return _client


def get_db():
    """Return the database handle, creating it on first call."""
    global _db
    if _db is None:
        db_name = os.getenv("MONGODB_DATABASE")
        if not db_name:
            raise ConfigurationError("MONGODB_DATABASE environment variable is not set.")
        _db = get_client()[db_name]
    return _db


def ping_db() -> bool:
    """Verify the MongoDB connection is alive. Used at startup."""
    try:
        get_client().admin.command("ping")
        return True
    except ConnectionFailure:
        return False
