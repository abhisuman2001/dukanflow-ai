from datetime import datetime
from strands import tool

from app.database.mongodb import get_db


# ──────────────────────────────────────────────
# Customer tools
# ──────────────────────────────────────────────

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


# ──────────────────────────────────────────────
# Appointment tools
# ──────────────────────────────────────────────

@tool
def book_appointment(
    customer_phone: str,
    technician_id: str,
    skill: str,
    date: str,
    time_slot: str = "10:00 AM",
    notes: str = "",
) -> dict:
    """
    Create a new service appointment and persist it to the database.

    Always call get_customer and check_technician_availability BEFORE this tool
    to confirm the customer exists and the technician is free.

    Args:
        customer_phone: The customer's phone number (e.g. "9876543210").
        technician_id:  The MongoDB ObjectId string of the assigned technician.
        skill:          The appliance/service type (e.g. "AC", "washing_machine").
        date:           Service date in YYYY-MM-DD format (e.g. "2026-09-15").
        time_slot:      Preferred time slot (default "10:00 AM").
        notes:          Any additional instructions from the customer.

    Returns:
        A dict with the created appointment id and summary, or an error dict.
    """
    from bson import ObjectId
    from bson.errors import InvalidId

    db = get_db()

    # Validate customer
    customer = db["customers"].find_one({"phone": customer_phone.strip()})
    if not customer:
        return {
            "booked": False,
            "message": f"No customer found with phone {customer_phone}. "
                       "Please register the customer first using create_customer.",
        }

    # Validate technician
    try:
        tech_oid = ObjectId(technician_id.strip())
    except InvalidId:
        return {"booked": False, "message": f"'{technician_id}' is not a valid technician id."}

    technician = db["technicians"].find_one({"_id": tech_oid})
    if not technician:
        return {"booked": False, "message": f"No technician found with id {technician_id}."}

    # Guard: no double-booking the technician on the same date
    existing = db["appointments"].find_one({
        "technician_id": technician_id.strip(),
        "date": date.strip(),
        "status": {"$in": ["scheduled", "confirmed"]},
    })
    if existing:
        return {
            "booked": False,
            "message": f"Technician {technician.get('name')} already has an appointment on {date}. "
                       "Please choose a different technician or date.",
        }

    appointment = {
        "customer_phone": customer_phone.strip(),
        "customer_name": customer.get("name", "N/A"),
        "technician_id": technician_id.strip(),
        "technician_name": technician.get("name", "N/A"),
        "skill": skill.strip(),
        "date": date.strip(),
        "time_slot": time_slot.strip(),
        "notes": notes.strip(),
        "status": "scheduled",
        "created_at": datetime.utcnow().isoformat(),
    }

    result = db["appointments"].insert_one(appointment)
    appointment_id = str(result.inserted_id)

    return {
        "booked": True,
        "appointment_id": appointment_id,
        "customer_name": appointment["customer_name"],
        "technician_name": appointment["technician_name"],
        "skill": appointment["skill"],
        "date": appointment["date"],
        "time_slot": appointment["time_slot"],
        "status": "scheduled",
        "message": (
            f"Appointment booked successfully! "
            f"{appointment['technician_name']} will visit {appointment['customer_name']} "
            f"on {appointment['date']} at {appointment['time_slot']} for {appointment['skill']} service."
        ),
    }


@tool
def assign_technician(appointment_id: str, technician_id: str) -> dict:
    """
    Assign (or reassign) a technician to an existing appointment.

    Use this after book_appointment if you need to change the technician,
    or to confirm the assignment and update the appointment status to 'confirmed'.

    Args:
        appointment_id: The MongoDB ObjectId string of the appointment.
        technician_id:  The MongoDB ObjectId string of the technician to assign.

    Returns:
        A dict confirming the assignment, or an error dict.
    """
    from bson import ObjectId
    from bson.errors import InvalidId

    db = get_db()

    # Validate appointment
    try:
        appt_oid = ObjectId(appointment_id.strip())
    except InvalidId:
        return {"assigned": False, "message": f"'{appointment_id}' is not a valid appointment id."}

    appointment = db["appointments"].find_one({"_id": appt_oid})
    if not appointment:
        return {"assigned": False, "message": f"No appointment found with id {appointment_id}."}

    # Validate technician
    try:
        tech_oid = ObjectId(technician_id.strip())
    except InvalidId:
        return {"assigned": False, "message": f"'{technician_id}' is not a valid technician id."}

    technician = db["technicians"].find_one({"_id": tech_oid})
    if not technician:
        return {"assigned": False, "message": f"No technician found with id {technician_id}."}

    # Check for double-booking on that date (excluding this appointment)
    conflict = db["appointments"].find_one({
        "_id": {"$ne": appt_oid},
        "technician_id": technician_id.strip(),
        "date": appointment["date"],
        "status": {"$in": ["scheduled", "confirmed"]},
    })
    if conflict:
        return {
            "assigned": False,
            "message": (
                f"Technician {technician.get('name')} already has a confirmed appointment on "
                f"{appointment['date']}. Choose a different technician."
            ),
        }

    db["appointments"].update_one(
        {"_id": appt_oid},
        {
            "$set": {
                "technician_id": technician_id.strip(),
                "technician_name": technician.get("name", "N/A"),
                "status": "confirmed",
                "updated_at": datetime.utcnow().isoformat(),
            }
        },
    )

    return {
        "assigned": True,
        "appointment_id": appointment_id,
        "technician_name": technician.get("name", "N/A"),
        "technician_phone": technician.get("phone", "N/A"),
        "date": appointment["date"],
        "time_slot": appointment.get("time_slot", "N/A"),
        "status": "confirmed",
        "message": (
            f"Technician {technician.get('name')} has been confirmed for the appointment on "
            f"{appointment['date']} at {appointment.get('time_slot', 'N/A')}."
        ),
    }


@tool
def send_customer_message(
    customer_phone: str,
    message_text: str,
    message_type: str = "notification",
) -> dict:
    """
    Record and send a message to a customer (e.g. appointment confirmation, reminder, update).

    In this demo the message is logged to the database. In production this would
    trigger an SMS/WhatsApp gateway. Always verify the customer exists first.

    Args:
        customer_phone: The customer's phone number (e.g. "9876543210").
        message_text:   The message content to send to the customer.
        message_type:   Type of message — one of: "notification", "reminder",
                        "confirmation", "update", "invoice". Defaults to "notification".

    Returns:
        A dict confirming the message was queued/logged, or an error dict.
    """
    db = get_db()

    customer = db["customers"].find_one({"phone": customer_phone.strip()})
    if not customer:
        return {
            "sent": False,
            "message": f"No customer found with phone {customer_phone}. Cannot send message.",
        }

    log_entry = {
        "customer_phone": customer_phone.strip(),
        "customer_name": customer.get("name", "N/A"),
        "message_text": message_text.strip(),
        "message_type": message_type.strip(),
        "channel": "sms",  # In production: SMS / WhatsApp
        "status": "queued",
        "sent_at": datetime.utcnow().isoformat(),
    }

    result = db["messages"].insert_one(log_entry)

    return {
        "sent": True,
        "message_id": str(result.inserted_id),
        "customer_name": customer.get("name", "N/A"),
        "customer_phone": customer_phone.strip(),
        "message_type": message_type,
        "preview": message_text[:120] + ("…" if len(message_text) > 120 else ""),
        "message": (
            f"Message successfully queued for {customer.get('name')} ({customer_phone}). "
            f"They will receive it via SMS/WhatsApp."
        ),
    }
