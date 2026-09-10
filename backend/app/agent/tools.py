from datetime import datetime
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
    customer = db["customers"].find_one({
        "phone": phone.strip()
    })

    if not customer:
        return {
            "found": False,
            "message": f"No customer found with phone number {phone}."
        }

    # Return only safe, relevant fields
    return {
        "found": True,
        "name": customer.get("name", "N/A"),
        "phone": customer.get("phone", "N/A"),
        "email": customer.get("email", "N/A"),
        "address": customer.get("address", "N/A"),
    }


@tool
def create_customer(name: str, phone: str, email: str = "", address: str = "") -> dict:
    """
    Register a new customer in the database.

    Use this when a caller is not found by get_customer and wants to proceed
    with a service request. Always call get_customer first to avoid duplicates.

    Args:
        name:    Full name of the customer (e.g. "Sunita Devi").
        phone:   Mobile number, digits only (e.g. "9876500000").
        email:   Optional email address.
        address: Optional street / city address.

    Returns:
        A dict confirming creation with the assigned customer id,
        or an error dict if the phone number already exists.
    """

    db = get_db()
    phone = phone.strip()

    # Guard against duplicate phone numbers
    existing = db["customers"].find_one({"phone": phone})
    if existing:
        return {
            "created": False,
            "message": f"A customer with phone {phone} already exists. "
                       "Use get_customer to retrieve their details.",
        }

    doc = {
        "name": name.strip(),
        "phone": phone,
        "email": email.strip(),
        "address": address.strip(),
        "created_at": datetime.utcnow().isoformat(),
    }

    result = db["customers"].insert_one(doc)

    return {
        "created": True,
        "customer_id": str(result.inserted_id),
        "name": doc["name"],
        "phone": doc["phone"],
        "message": f"Customer '{doc['name']}' created successfully.",
    }


@tool
def check_technician_availability(skill: str, date: str) -> dict:
    """
    Find technicians who have the required skill and are available on a given date.

    Args:
        skill: The repair skill needed (e.g. "AC", "washing_machine", "refrigerator",
               "microwave", "geyser").  Case-insensitive.
        date:  The requested service date in YYYY-MM-DD format (e.g. "2026-09-15").

    Returns:
        A dict containing a list of available technicians with their ids and names,
        or a message if none are available.
    """

    db = get_db()
    skill_query = skill.strip().lower()

    # Technicians whose skills array contains the requested skill (case-insensitive)
    # and who are NOT listed as unavailable on that date
    technicians = list(db["technicians"].find({
        "skills": {"$elemMatch": {"$regex": f"^{skill_query}$", "$options": "i"}},
        "unavailable_dates": {"$not": {"$elemMatch": {"$eq": date.strip()}}},
    }))

    if not technicians:
        return {
            "available": False,
            "skill": skill,
            "date": date,
            "message": f"No technicians available for '{skill}' on {date}.",
        }

    available = [
        {
            "technician_id": str(t["_id"]),
            "name": t.get("name", "N/A"),
            "phone": t.get("phone", "N/A"),
            "skills": t.get("skills", []),
        }
        for t in technicians
    ]

    return {
        "available": True,
        "skill": skill,
        "date": date,
        "count": len(available),
        "technicians": available,
    }


@tool
def get_technician_details(technician_id: str) -> dict:
    """
    Retrieve full profile details for a specific technician by their id.

    Use this after check_technician_availability to get complete information
    before assigning a job or sharing contact details with a customer.

    Args:
        technician_id: The MongoDB ObjectId string returned by
                       check_technician_availability (e.g. "664a1b2c3d4e5f6789abcdef").

    Returns:
        A dict with the technician's name, phone, skills, rating, and availability,
        or a not-found message.
    """

    from bson import ObjectId
    from bson.errors import InvalidId

    db = get_db()

    try:
        oid = ObjectId(technician_id.strip())
    except InvalidId:
        return {
            "found": False,
            "message": f"'{technician_id}' is not a valid technician id.",
        }

    tech = db["technicians"].find_one({"_id": oid})

    if not tech:
        return {
            "found": False,
            "message": f"No technician found with id {technician_id}.",
        }

    return {
        "found": True,
        "technician_id": str(tech["_id"]),
        "name": tech.get("name", "N/A"),
        "phone": tech.get("phone", "N/A"),
        "skills": tech.get("skills", []),
        "rating": tech.get("rating", "N/A"),
        "experience_years": tech.get("experience_years", "N/A"),
        "unavailable_dates": tech.get("unavailable_dates", []),
    }