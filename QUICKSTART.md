# DukaanFlow - Quick Start Guide

## ⚡ Start the Application (Development)

### Terminal 1: Backend
```bash
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

### Access
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🎯 First Time Setup Checklist

- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] MongoDB running (local or Atlas)
- [ ] Created `backend/.env` with:
  - `MONGODB_URI=mongodb://localhost:27017/dukaanflow`
  - `GROQ_API_KEY=your_key_here`
  - `GROQ_MODEL_ID=groq/qwen/qwen3.8-27b`
- [ ] Ran `pip install -r backend/requirements.txt`
- [ ] Ran `npm install` in frontend folder
- [ ] (Optional) Ran `python backend/seed.py` for sample data

---

## 🧪 Quick Test Flow

1. **Open Dashboard** → See today's metrics
2. **Visit Appointments** → Click any row → View detail drawer
3. **Try Status Update** → Click status button → Confirm → See loading → Success toast
4. **Generate Invoice** → Click "Generate invoice" (only for completed jobs)
5. **Visit AI Operations** → Type: "Check if we have customer with phone 9876543210"
6. **Visit Technicians** → Click any technician → See today's schedule
7. **Visit Customers** → Click any customer → View service history

---

## 🔍 Troubleshooting

### Backend won't start
- Check MongoDB is running: `mongosh` (should connect)
- Verify `.env` file exists in backend folder
- Check Python version: `python --version` (should be 3.11+)

### Frontend won't start
- Delete `node_modules` and run `npm install` again
- Check Node version: `node --version` (should be 18+)
- Try different port: `npm run dev -- --port 5174`

### API errors in browser console
- Check backend is running at port 8000
- Open http://localhost:8000/api/health (should return `{"status":"ok"}`)
- Check browser console for CORS errors

### Empty data / no appointments showing
- Run seed script: `python backend/seed.py`
- Check MongoDB collections: `mongosh` → `use dukaanflow` → `db.appointments.find()`

---

## 📊 MongoDB Quick Commands

```bash
# Connect
mongosh

# Switch to database
use dukaanflow

# Check collections
show collections

# Count documents
db.appointments.countDocuments()
db.customers.countDocuments()
db.technicians.countDocuments()

# View sample data
db.appointments.find().limit(3).pretty()

# Clear all data (CAUTION)
db.appointments.deleteMany({})
db.customers.deleteMany({})
db.technicians.deleteMany({})
db.invoices.deleteMany({})
db.followups.deleteMany({})
db.activity.deleteMany({})
```

---

## 🎨 Available Pages

| URL | Page | Key Features |
|-----|------|--------------|
| `/` | Dashboard | Metrics, today's schedule, attention alerts |
| `/appointments` | Appointments | Filter, search, detail drawer, status updates |
| `/technicians` | Technicians | Availability, today's schedule, skills |
| `/customers` | Customers | Contact info, service history |
| `/invoices` | Invoices | Revenue tracking, invoice list |
| `/followups` | Follow-ups | Scheduled follow-ups, overdue alerts |
| `/ai-ops` | AI Operations | Natural language chat |
| `/settings` | Settings | (Stub) Business profile |

---

## 🤖 AI Agent Test Prompts

```
"Check if we have a customer with phone 9876543210"

"Create a new customer: name is Priya Sharma, phone is 9988776655, 
email priya@example.com, address is Green Park, Delhi"

"Check which technicians are available for AC service on 2026-09-15"

"Book an AC repair for Rahul (9876543210) on September 15 at 10 AM 
with technician Amit Kumar"

"Update job status to completed for appointment 67890abc123def"

"Generate invoice for appointment 67890abc123def"

"Schedule a follow-up for appointment 67890abc123def on September 20 
for post-service quality check"
```

---

## 🔧 Environment Variables Reference

### Backend `.env`
```env
# Database
MONGODB_URI=mongodb://localhost:27017/dukaanflow

# AI Agent
GROQ_API_KEY=gsk_xxx...
GROQ_MODEL_ID=groq/qwen/qwen3.8-27b

# Optional
PORT=8000
```

---

## 📦 Production Build

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm run build
# Outputs to: frontend/dist/
# Serve with any static host (Nginx, Vercel, Netlify, etc.)
```

---

## ✅ Verification Checklist

After starting both servers, verify:

- [ ] Backend health endpoint responds: http://localhost:8000/api/health
- [ ] Frontend loads: http://localhost:5173
- [ ] Dashboard shows metrics (even if zero)
- [ ] Navigation sidebar works
- [ ] Console shows no errors (except expected empty states)
- [ ] Clicking "Refresh" button on dashboard works
- [ ] Opening any appointment detail drawer works
- [ ] Status update shows loading state → success toast

---

**Ready to go! 🚀**
