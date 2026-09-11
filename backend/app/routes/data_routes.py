"""
data_routes.py — REST endpoints for the DukaanFlow frontend data pages.
Read-only (GET) endpoints that surface MongoDB collections as JSON.
"""
from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from app.database.mongodb import get_db

router = APIRouter(prefix="/api/data", tags=["data"])


def _oid(doc: dict) -> dict:
    """Convert ObjectId fields to strings so the response is JSON-serialisable."""
    doc["_id"] = str(doc["_id"])
    return doc


# ─── Customers ────────────────────────────────────────────────────────────────

@router.get("/customers")
def list_customers(search: str = Query(default="")):
    db = get_db()
    query = {}
    if search.strip():
        query = {
            "$or": [
                {"name": {"$regex": search.strip(), "$options": "i"}},
                {"phone": {"$regex": search.strip(), "$options": "i"}},
            ]
        }
    customers = [_oid(c) for c in db["customers"].find(query).sort("name", 1)]
    return {"customers": customers, "total": len(customers)}


# ─── Technicians ──────────────────────────────────────────────────────────────

@router.get("/technicians")
def list_technicians(skill: str = Query(default="")):
    from datetime import datetime, timezone
    db = get_db()
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    query = {}
    if skill.strip():
        query = {"skills": {"$elemMatch": {"$regex": f"^{skill.strip()}$", "$options": "i"}}}

    techs = [_oid(t) for t in db["technicians"].find(query).sort("name", 1)]

    # Annotate each technician with today's job count and derived status
    for t in techs:
        tid = t["_id"]
        todays_jobs = list(db["appointments"].find({
            "technician_id": {"$in": [tid, str(tid)]},
            "date": today_str,
            "status": {"$in": ["scheduled", "assigned", "in_progress", "confirmed"]},
        }))
        # Also match by name since some appointments store name not id
        todays_jobs_by_name = list(db["appointments"].find({
            "technician_name": t.get("name", ""),
            "date": today_str,
            "status": {"$in": ["scheduled", "assigned", "in_progress", "confirmed"]},
        }))
        all_jobs = {str(j["_id"]): j for j in todays_jobs + todays_jobs_by_name}
        t["todays_job_count"] = len(all_jobs)

        unavail = t.get("unavailable_dates", [])
        if today_str in unavail:
            t["availability_status"] = "unavailable"
        elif len(all_jobs) >= 3:
            t["availability_status"] = "busy"
        elif len(all_jobs) > 0:
            t["availability_status"] = "busy"
        else:
            t["availability_status"] = "available"

    return {"technicians": techs, "total": len(techs)}


@router.get("/technicians/{technician_id}")
def get_technician(technician_id: str):
    from bson.errors import InvalidId
    from datetime import datetime, timezone
    db = get_db()
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    try:
        oid = ObjectId(technician_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid technician id.")

    tech = db["technicians"].find_one({"_id": oid})
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found.")
    tech = _oid(tech)

    # All appointments for this technician
    appts = list(db["appointments"].find({
        "$or": [
            {"technician_id": technician_id},
            {"technician_name": tech.get("name", "__NONE__")},
        ]
    }).sort("date", -1))

    today_appts = [_oid(dict(a)) for a in appts if a.get("date") == today_str]
    upcoming    = [_oid(dict(a)) for a in appts if a.get("date", "") > today_str]
    past        = [_oid(dict(a)) for a in appts if a.get("date", "") < today_str]

    # Status
    unavail = tech.get("unavailable_dates", [])
    if today_str in unavail:
        status = "unavailable"
    elif any(a.get("status") == "in_progress" for a in appts if a.get("date") == today_str):
        status = "busy"
    elif any(a.get("date") == today_str for a in appts):
        status = "busy"
    else:
        status = "available"

    tech["availability_status"] = status
    tech["today_appointments"]  = today_appts
    tech["upcoming_appointments"] = upcoming[:5]
    tech["past_appointments"]   = past[:5]
    tech["today"] = today_str

    return tech


@router.post("/technicians")
def create_technician(body: dict):
    from datetime import datetime
    db = get_db()

    name  = (body.get("name") or "").strip()
    phone = (body.get("phone") or "").strip()
    if not name or not phone:
        raise HTTPException(status_code=400, detail="name and phone are required.")

    if db["technicians"].find_one({"phone": phone}):
        raise HTTPException(status_code=409, detail=f"A technician with phone {phone} already exists.")

    doc = {
        "name":             name,
        "phone":            phone,
        "skills":           [s.strip() for s in body.get("skills", []) if s.strip()],
        "rating":           float(body.get("rating", 0)),
        "experience_years": int(body.get("experience_years", 0)),
        "unavailable_dates": [],
        "created_at":       datetime.utcnow().isoformat(),
    }
    result = db["technicians"].insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc


@router.patch("/technicians/{technician_id}")
def update_technician(technician_id: str, body: dict):
    from bson.errors import InvalidId
    from datetime import datetime
    db = get_db()

    try:
        oid = ObjectId(technician_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid technician id.")

    tech = db["technicians"].find_one({"_id": oid})
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found.")

    allowed = {"name", "phone", "skills", "rating", "experience_years"}
    updates = {k: v for k, v in body.items() if k in allowed}
    if not updates:
        raise HTTPException(status_code=400, detail="No valid fields to update.")

    updates["updated_at"] = datetime.utcnow().isoformat()
    db["technicians"].update_one({"_id": oid}, {"$set": updates})
    return {"success": True, "technician_id": technician_id, **updates}


@router.post("/technicians/{technician_id}/unavailable")
def add_unavailable_date(technician_id: str, body: dict):
    from bson.errors import InvalidId
    db = get_db()

    date = (body.get("date") or "").strip()
    if not date:
        raise HTTPException(status_code=400, detail="date is required (YYYY-MM-DD).")

    try:
        oid = ObjectId(technician_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid technician id.")

    tech = db["technicians"].find_one({"_id": oid})
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found.")

    db["technicians"].update_one(
        {"_id": oid},
        {"$addToSet": {"unavailable_dates": date}},
    )
    return {"success": True, "technician_id": technician_id, "date": date}


@router.delete("/technicians/{technician_id}/unavailable/{date}")
def remove_unavailable_date(technician_id: str, date: str):
    from bson.errors import InvalidId
    db = get_db()

    try:
        oid = ObjectId(technician_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid technician id.")

    db["technicians"].update_one(
        {"_id": oid},
        {"$pull": {"unavailable_dates": date}},
    )
    return {"success": True, "technician_id": technician_id, "removed_date": date}


# ─── Appointments ─────────────────────────────────────────────────────────────

@router.get("/appointments")
def list_appointments(
    status: str     = Query(default=""),
    search: str     = Query(default=""),
    date: str       = Query(default=""),
    technician: str = Query(default=""),
    skill: str      = Query(default=""),
):
    db = get_db()
    query = {}
    if status.strip():
        query["status"] = status.strip()
    if date.strip():
        query["date"] = date.strip()
    if technician.strip():
        query["technician_name"] = {"$regex": technician.strip(), "$options": "i"}
    if skill.strip():
        query["skill"] = {"$regex": f"^{skill.strip()}$", "$options": "i"}
    if search.strip():
        or_clause = [
            {"customer_name":  {"$regex": search.strip(), "$options": "i"}},
            {"customer_phone": {"$regex": search.strip(), "$options": "i"}},
            {"technician_name":{"$regex": search.strip(), "$options": "i"}},
            {"skill":          {"$regex": search.strip(), "$options": "i"}},
        ]
        if "$or" in query:
            query["$and"] = [{"$or": query.pop("$or")}, {"$or": or_clause}]
        else:
            query["$or"] = or_clause
    appts = [_oid(a) for a in db["appointments"].find(query).sort("date", -1)]
    return {"appointments": appts, "total": len(appts)}


@router.get("/appointments/{appointment_id}")
def get_appointment(appointment_id: str):
    from bson.errors import InvalidId
    db = get_db()
    try:
        oid = ObjectId(appointment_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid appointment id.")
    appt = db["appointments"].find_one({"_id": oid})
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    appt = _oid(appt)

    # Attach related invoice and follow-up if they exist
    invoice = db["invoices"].find_one({"appointment_id": appointment_id})
    followup = db["followups"].find_one({"appointment_id": appointment_id})
    appt["invoice"]  = _oid(invoice)  if invoice  else None
    appt["followup"] = _oid(followup) if followup else None

    # Attach activity for this appointment
    activity = [_oid(e) for e in
        db["activity"].find({"meta.appointment_id": appointment_id}).sort("ts", -1)]
    appt["activity"] = activity

    return appt


@router.patch("/appointments/{appointment_id}/status")
def update_appointment_status(appointment_id: str, body: dict):
    from bson.errors import InvalidId
    from datetime import datetime
    db = get_db()

    VALID = {"scheduled", "assigned", "in_progress", "completed", "cancelled", "confirmed"}
    new_status = (body.get("status") or "").strip().lower()
    if new_status not in VALID:
        raise HTTPException(status_code=400, detail=f"Invalid status '{new_status}'.")

    try:
        oid = ObjectId(appointment_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid appointment id.")

    appt = db["appointments"].find_one({"_id": oid})
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    updated_at = datetime.utcnow().isoformat()
    db["appointments"].update_one(
        {"_id": oid},
        {"$set": {"status": new_status, "updated_at": updated_at}},
    )

    # Write activity log
    try:
        db["activity"].insert_one({
            "action": "job_status_updated",
            "description": f"Job status updated to '{new_status}' for {appt.get('customer_name', '?')}",
            "meta": {"appointment_id": appointment_id, "status": new_status},
            "ts": updated_at,
        })
    except Exception:
        pass

    return {"success": True, "appointment_id": appointment_id, "status": new_status, "updated_at": updated_at}


# ─── Invoices ─────────────────────────────────────────────────────────────────

@router.get("/invoices")
def list_invoices(status: str = Query(default=""), appointment_id: str = Query(default="")):
    db = get_db()
    query = {}
    if status.strip():
        query["status"] = status.strip()
    if appointment_id.strip():
        query["appointment_id"] = appointment_id.strip()
    invoices = [_oid(i) for i in db["invoices"].find(query).sort("created_at", -1)]
    return {"invoices": invoices, "total": len(invoices)}


# ─── Follow-ups ───────────────────────────────────────────────────────────────

@router.get("/followups")
def list_followups(status: str = Query(default=""), appointment_id: str = Query(default="")):
    db = get_db()
    query = {}
    if status.strip():
        query["status"] = status.strip()
    if appointment_id.strip():
        query["appointment_id"] = appointment_id.strip()
    followups = [_oid(f) for f in db["followups"].find(query).sort("scheduled_for", 1)]
    return {"followups": followups, "total": len(followups)}


# ─── Invoice generation (REST shortcut, mirrors the Strands tool logic) ──────

@router.post("/appointments/{appointment_id}/invoice")
def create_invoice(appointment_id: str):
    """Generate an invoice for a completed appointment (REST endpoint)."""
    from app.agent.tools import generate_invoice
    result = generate_invoice(appointment_id)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Failed to generate invoice."))
    return result


# ─── Follow-up scheduling (REST shortcut) ─────────────────────────────────────

@router.post("/appointments/{appointment_id}/followup")
def create_followup(appointment_id: str, body: dict):
    """Schedule a follow-up for an appointment (REST endpoint)."""
    from app.agent.tools import schedule_followup
    followup_date = (body.get("followup_date") or "").strip()
    reason        = (body.get("reason") or "").strip()
    if not followup_date or not reason:
        raise HTTPException(status_code=400, detail="followup_date and reason are required.")
    result = schedule_followup(appointment_id, followup_date, reason)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message", "Failed to schedule follow-up."))
    return result


# ─── Activity log (write helper used by tools) ────────────────────────────────

@router.get("/activity")
def list_activity(limit: int = Query(default=20)):
    db = get_db()
    entries = [_oid(e) for e in db["activity"].find().sort("ts", -1).limit(limit)]
    return {"activity": entries}


# ─── Dashboard stats ──────────────────────────────────────────────────────────

@router.get("/dashboard")
def dashboard_stats():
    from datetime import datetime, timezone, timedelta
    db = get_db()

    # Today's date string (IST ≈ UTC+5:30; use UTC date as proxy)
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # ── Overall metrics ──
    total_customers   = db["customers"].count_documents({})
    total_technicians = db["technicians"].count_documents({})

    # Today's appointments (date field is stored as YYYY-MM-DD string)
    todays_appts_cursor = list(db["appointments"].find({"date": today_str}))
    todays_count     = len(todays_appts_cursor)
    in_progress      = sum(1 for a in todays_appts_cursor if a.get("status") == "in_progress")
    completed_today  = sum(1 for a in todays_appts_cursor if a.get("status") == "completed")
    unassigned_today = sum(1 for a in todays_appts_cursor if a.get("status") == "scheduled")

    # All-time stats
    total_appointments = db["appointments"].count_documents({})
    open_appointments  = db["appointments"].count_documents(
        {"status": {"$in": ["scheduled", "assigned", "in_progress"]}}
    )
    total_invoices = db["invoices"].count_documents({})
    total_revenue_agg = list(db["invoices"].aggregate([
        {"$match": {"status": "generated"}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}},
    ]))
    revenue = total_revenue_agg[0]["total"] if total_revenue_agg else 0

    pending_followups = db["followups"].count_documents({"status": "scheduled"})

    # ── Today's appointments table (sorted by time_slot) ──
    todays_appts = [_oid(a) for a in
        db["appointments"].find({"date": today_str}).sort("time_slot", 1)]

    # If no appointments today, fall back to the 8 most recent across all dates
    if not todays_appts:
        todays_appts = [_oid(a) for a in
            db["appointments"].find().sort("created_at", -1).limit(8)]

    # ── Attention items (real, derived from data) ──
    attention = []

    # 1. Appointments with no technician assigned (status=scheduled, no technician_id or empty)
    needs_assign = db["appointments"].count_documents({
        "status": "scheduled",
        "$or": [{"technician_id": {"$exists": False}}, {"technician_id": ""}],
    })
    if needs_assign:
        attention.append({
            "type": "warning",
            "message": f"{needs_assign} appointment{'s' if needs_assign > 1 else ''} need technician assignment",
            "link": "/appointments",
            "link_label": "View appointments",
        })

    # 2. Follow-ups overdue (scheduled_for < today, status=scheduled)
    overdue_fups = db["followups"].count_documents({
        "status": "scheduled",
        "scheduled_for": {"$lt": today_str},
    })
    if overdue_fups:
        attention.append({
            "type": "urgent",
            "message": f"{overdue_fups} follow-up{'s' if overdue_fups > 1 else ''} overdue",
            "link": "/followups",
            "link_label": "View follow-ups",
        })

    # 3. Completed jobs without an invoice
    completed_ids = [str(a["_id"]) for a in db["appointments"].find({"status": "completed"})]
    invoiced_ids  = [i["appointment_id"] for i in db["invoices"].find({}, {"appointment_id": 1})]
    uninvoiced    = len([cid for cid in completed_ids if cid not in invoiced_ids])
    if uninvoiced:
        attention.append({
            "type": "info",
            "message": f"{uninvoiced} completed job{'s' if uninvoiced > 1 else ''} without an invoice",
            "link": "/invoices",
            "link_label": "View invoices",
        })

    # 4. Follow-ups due today
    due_today = db["followups"].count_documents({
        "status": "scheduled",
        "scheduled_for": today_str,
    })
    if due_today:
        attention.append({
            "type": "info",
            "message": f"{due_today} follow-up{'s' if due_today > 1 else ''} due today",
            "link": "/followups",
            "link_label": "View follow-ups",
        })

    # ── Recent activity log (last 10 entries) ──
    activity = [_oid(e) for e in db["activity"].find().sort("ts", -1).limit(10)]

    # ── AI ops summary (derived from activity log) ──
    ai_lookups     = db["activity"].count_documents({"action": "customer_lookup"})
    ai_assignments = db["activity"].count_documents({"action": "technician_assigned"})
    ai_followups   = db["activity"].count_documents({"action": "followup_scheduled"})
    ai_invoices    = db["activity"].count_documents({"action": "invoice_generated"})
    ai_total       = db["activity"].count_documents({})

    return {
        "today": today_str,
        "metrics": {
            "todays_appointments": todays_count,
            "in_progress":         in_progress,
            "completed_today":     completed_today,
            "pending_followups":   pending_followups,
            # secondary
            "total_customers":     total_customers,
            "total_technicians":   total_technicians,
            "total_appointments":  total_appointments,
            "open_appointments":   open_appointments,
            "total_invoices":      total_invoices,
            "total_revenue":       round(revenue, 2),
            "unassigned_today":    unassigned_today,
        },
        "todays_appointments": todays_appts,
        "attention":  attention,
        "activity":   activity,
        "ai_ops": {
            "total_actions":   ai_total,
            "customer_lookups": ai_lookups,
            "assignments":     ai_assignments,
            "followups":       ai_followups,
            "invoices":        ai_invoices,
        },
    }
