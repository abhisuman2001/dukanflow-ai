from strands import tool
from app.database.mongodb import get_db


@tool
def get_customer(phone: str) -> dict:
    """
    Look up a customer in the database by their phone number.

    Args:
        phone: The customer's phone number (e.g. "9876543210").

    Returns:
        A dict with basic customer info, or a not-found message.
    """
    db = get_db()
    # Search by phone field; strip whitespace so minor formatting differences don't break lookup
    customer = db["customers"].find_one({"phone": phone.strip()})

    if not customer:
        return {"found": False, "message": f"No customer found with phone number {phone}."}

    # Return only safe, relevant fields — never expose internal DB IDs or sensitive metadata
    return {
        "found": True,
        "name": customer.get("name", "N/A"),
        "phone": customer.get("phone", "N/A"),
        "email": customer.get("email", "N/A"),
        "address": customer.get("address", "N/A"),
    }
