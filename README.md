# DukaanFlow AI

**AI-powered operations management for local appliance repair businesses**

DukaanFlow is a complete SaaS platform that combines conversational AI with professional operations management. Built for small service businesses in India, it handles customer interactions, technician scheduling, job tracking, invoicing, and follow-ups through both a natural language interface and a full-featured web application.

---

## 🎯 Project Status: Day 4 Complete

### ✅ Completed Features

**Backend (Python + FastAPI)**
- ✅ 10 Strands AI agent tools for automated operations
- ✅ Customer, technician, appointment, invoice, and follow-up management
- ✅ Real-time job status updates and activity logging
- ✅ Comprehensive REST API with MongoDB integration
- ✅ Dashboard analytics and attention-based alerts
- ✅ Duplicate prevention and data validation

**Frontend (React + Vite + Tailwind CSS)**
- ✅ Complete SaaS app shell with responsive sidebar navigation
- ✅ Dashboard with real-time metrics and activity feed
- ✅ Appointments page with full detail drawer and status management
- ✅ Technicians page with availability tracking and schedule timeline
- ✅ Customers page with service history
- ✅ Invoices page with revenue tracking
- ✅ Follow-ups page with overdue alerts
- ✅ AI Operations chat interface (Day 1-3 preserved)
- ✅ Professional UI components library
- ✅ Full error handling with sanitized messages
- ✅ All mutations connected to real backend APIs

**AI Agent Capabilities**
- Customer lookup and creation
- Technician availability checking
- Appointment booking and assignment
- Job status updates
- Invoice generation (with GST calculation)
- Follow-up scheduling
- Customer messaging
- Activity logging

---

## 🏗️ Architecture

```
dukaanflow-ai/
├── backend/
│   ├── app/
│   │   ├── agent/           # Strands AI agent + tools
│   │   ├── database/        # MongoDB connection
│   │   ├── routes/          # FastAPI endpoints
│   │   └── main.py          # Application entry
│   ├── requirements.txt
│   └── .env                 # Configuration
│
└── frontend/
    ├── src/
    │   ├── api/             # Backend integration layer
    │   ├── components/      # Reusable UI components
    │   │   ├── layout/      # AppShell, Sidebar, TopBar
    │   │   └── ui/          # Shared primitives
    │   ├── pages/           # 8 routed pages
    │   └── App.jsx          # Router configuration
    ├── package.json
    └── tailwind.config.js
```

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+** (backend)
- **Node.js 18+** (frontend)
- **MongoDB** (local or Atlas)
- **Groq API key** (for AI agent - free tier available)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Copy .env.example to .env and fill in:
# - MONGODB_URI
# - GROQ_API_KEY
# - GROQ_MODEL_ID

# Seed sample data (optional)
python seed.py

# Start server
uvicorn app.main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 3. Access the Application

1. Open browser to `http://localhost:5173`
2. Navigate through the dashboard and operations pages
3. Try the AI Operations chat at `/ai-ops` for natural language interactions

---

## 📊 MongoDB Collections

| Collection | Purpose |
|-----------|---------|
| `customers` | Customer records with contact info |
| `technicians` | Service team with skills and availability |
| `appointments` | Scheduled jobs and service requests |
| `invoices` | Generated bills with GST calculation |
| `followups` | Scheduled customer follow-ups |
| `activity` | AI operations audit log |
| `messages` | Customer notification queue |

---

## 🎨 Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Today's metrics, appointments, attention items, activity feed |
| `/appointments` | Appointments | Job management with filters, status updates, invoice generation |
| `/technicians` | Technicians | Team roster with availability, schedule, skills management |
| `/customers` | Customers | Customer directory with full service history |
| `/invoices` | Invoices | Revenue tracking and invoice listing |
| `/followups` | Follow-ups | Scheduled follow-ups with overdue alerts |
| `/ai-ops` | AI Operations | Natural language chat interface |
| `/settings` | Settings | Business profile (stub) |

---

## 🔧 API Endpoints

### Agent
- `POST /api/agent/chat` - Send message to AI agent

### Dashboard
- `GET /api/data/dashboard` - Complete dashboard data with metrics

### Appointments
- `GET /api/data/appointments` - List with filters
- `GET /api/data/appointments/{id}` - Detail with related data
- `PATCH /api/data/appointments/{id}/status` - Update status
- `POST /api/data/appointments/{id}/invoice` - Generate invoice
- `POST /api/data/appointments/{id}/followup` - Schedule follow-up

### Technicians
- `GET /api/data/technicians` - List with availability status
- `GET /api/data/technicians/{id}` - Detail with schedule
- `POST /api/data/technicians` - Create new
- `PATCH /api/data/technicians/{id}` - Update
- `POST /api/data/technicians/{id}/unavailable` - Add off day
- `DELETE /api/data/technicians/{id}/unavailable/{date}` - Remove off day

### Customers
- `GET /api/data/customers` - List with job stats
- `GET /api/data/customers/{phone}` - Detail with service history
- `POST /api/data/customers` - Create new
- `PATCH /api/data/customers/{phone}` - Update

### Invoices & Follow-ups
- `GET /api/data/invoices` - List all invoices
- `GET /api/data/followups` - List all follow-ups

### Activity
- `GET /api/data/activity` - Recent AI operations

---

## 🧪 Testing the AI Agent

Open the AI Operations page (`/ai-ops`) and try these prompts:

**Customer Lookup**
```
"Check if we have a customer with phone number 9876543210"
```

**Booking**
```
"Book an AC repair service for Rahul Sharma (9876543210) 
tomorrow at 10 AM with technician Amit Kumar"
```

**Status Update**
```
"Mark job 67890abc as completed"
```

**Invoice Generation**
```
"Generate invoice for appointment 67890abc"
```

**Follow-up Scheduling**
```
"Schedule a follow-up for appointment 67890abc on September 20 
for post-service quality check"
```

---

## 🎯 Key Features

### Real-Time Operations
- Live status updates across all pages
- Automatic data refresh after mutations
- No manual browser refresh needed

### Attention-Based Alerts
- Unassigned appointments
- Overdue follow-ups
- Completed jobs without invoices
- Due-today notifications

### Smart Validation
- Duplicate prevention (customers, invoices, follow-ups)
- Status transition guards
- Technician double-booking prevention
- Required field validation

### Professional UX
- Loading states for all async operations
- Human-readable error messages
- Confirmation dialogs for destructive actions
- Empty states with helpful guidance
- Responsive design (mobile-ready)

---

## 🔒 Security Notes

**Current State (Development)**
- CORS allows localhost origins
- No authentication/authorization
- MongoDB ObjectIds exposed in URLs (technicians only)
- Error sanitization prevents Python traceback leakage

**Before Production**
- Add user authentication (JWT/OAuth)
- Implement role-based access control
- Tighten CORS to specific domain
- Use UUIDs or slugs instead of ObjectIds
- Add rate limiting
- Enable HTTPS
- Secure environment variables

---

## 📝 Development Principles

1. **Real Backend Integration** - No fake success responses; all operations wait for actual API confirmation
2. **User-Friendly Errors** - Raw Python exceptions are sanitized to readable messages
3. **Data Consistency** - Related data refreshes automatically after mutations
4. **Professional UI** - Operations-first design, not marketing fluff
5. **Accessible** - Semantic HTML, proper labels, keyboard navigation

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend Framework | FastAPI (Python) |
| AI Agent | Strands + Groq (Qwen 2.5) |
| Database | MongoDB |
| Frontend Framework | React 18 |
| Routing | React Router v7 |
| Styling | Tailwind CSS 3 |
| Build Tool | Vite |
| HTTP Client | Fetch API |

---

## 📈 Next Steps (Future Enhancements)

- [ ] Authentication system
- [ ] SMS/WhatsApp integration for customer notifications
- [ ] Parts inventory management
- [ ] Payment gateway integration
- [ ] Technician mobile app
- [ ] Customer portal
- [ ] Advanced analytics and reporting
- [ ] Multi-location support
- [ ] Recurring service packages

---

## 📄 License

Proprietary - All rights reserved

---

## 👥 Support

For questions or issues, contact the development team.

---

**Built with ❤️ for local service businesses in India**