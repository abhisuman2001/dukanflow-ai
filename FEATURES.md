# DukaanFlow AI - Feature Overview

## 🎯 Core Features

### 1. AI-Powered Operations
**Natural Language Interface** - Talk to the system like a team member

**Sample Conversations:**
```
User: "Do we have a customer with phone 9876543210?"
AI:   "Yes, customer Rahul Sharma is registered with email rahul@example.com"

User: "Book AC repair for him tomorrow at 10 AM with Amit"
AI:   "Appointment booked successfully! Amit Kumar will visit Rahul Sharma 
       on September 12 at 10:00 AM for AC service."

User: "Mark that job as completed"
AI:   "Job status updated to completed."

User: "Generate the invoice"
AI:   "Invoice INV-1052 generated. Total: ₹1,679 (incl. 18% GST)"
```

**10 Automated Tools:**
- Customer lookup and registration
- Technician availability checking
- Appointment booking
- Technician assignment
- Status updates
- Invoice generation
- Follow-up scheduling
- Customer messaging

---

### 2. Operations Dashboard

**At-a-Glance Metrics**
- Today's appointments count
- Jobs in progress
- Completed today
- Pending follow-ups

**Today's Schedule**
- Time-sorted appointment list
- Customer details
- Assigned technician
- Service type
- Current status

**Attention Alerts** (Real-time)
- Unassigned appointments
- Overdue follow-ups
- Completed jobs without invoices
- Follow-ups due today

**Activity Feed**
- AI operations log
- Customer lookups
- Technician assignments
- Invoice generation
- Status updates

**AI Operations Summary**
- Total automated actions
- Breakdown by operation type

---

### 3. Appointment Management

**Full Job Lifecycle**
- Create → Schedule → Assign → In Progress → Complete → Invoice → Follow-up

**Advanced Filtering**
- Search by customer/phone/technician/service
- Filter by status (scheduled, assigned, in progress, completed, cancelled)
- Filter by date
- Filter by technician
- Filter by service type

**Detail Drawer** (Click any appointment)
- Customer information (name, phone, email, address)
- Service details (type, date, time, notes)
- Assigned technician
- Current status with quick actions
- Timeline of all status changes
- Related invoice (if generated)
- Related follow-up (if scheduled)
- Activity history for this job

**Status Management**
- Visual status badges
- One-click status transitions
- Confirmation for destructive actions (cancellation)
- Validation (e.g., can't generate invoice if not completed)

**Operations**
- Update status (6 possible states)
- Generate invoice (with GST)
- Schedule follow-up
- View activity log

---

### 4. Technician Management

**Team Roster**
- Name, phone, skills
- Availability status (available/busy/unavailable)
- Today's job count
- Experience and rating

**Availability Tracking**
- Real-time status: Available, Busy, Unavailable
- Derived from: Today's assignments + Off-day calendar
- Visual indicators (color-coded badges)

**Detail View** (Click any technician)
- Profile header with contact info
- Stats: Experience years, rating, today's job count
- **Today's Schedule** - Visual timeline
  - Time slot blocks (9 AM - 6 PM)
  - Appointments shown as color-coded blocks
  - Status-based colors (scheduled, in progress, completed)
- Upcoming jobs list (next 5)
- Unavailable dates calendar
- Quick actions: Edit profile, Set off day

**Skills Management**
- Each technician has multiple skills
- Skills shown as tags (AC, Washing Machine, Refrigerator, etc.)
- Availability check respects required skills

**Off-Day Management**
- Add unavailable dates (one-time or recurring)
- Remove dates from unavailable list
- Automatic availability status update

---

### 5. Customer Management

**Customer Directory**
- Name, phone, email, address
- Total jobs count
- Last service date and type
- Search by name/phone/email

**Service History** (Click any customer)
- All past and upcoming appointments
- Date, time, service type
- Assigned technician
- Invoice number and amount
- Job status
- Pagination for long histories

**Customer Profile**
- Contact information
- Total jobs badge
- Upcoming appointments highlighted
- Quick actions: Edit customer, New appointment, View appointments

**Customer Creation**
- Duplicate phone number prevention
- Required fields: name, phone
- Optional: email, address, preferred time

---

### 6. Invoice Management

**Revenue Tracking**
- Total revenue (all invoices)
- Subtotal (before tax)
- GST collected (18%)

**Invoice List**
- Invoice number (auto-generated: INV-1001, INV-1002...)
- Customer name
- Service type
- Service date
- Amount breakdown (subtotal + GST + total)
- Status (generated/paid/cancelled)

**Invoice Generation**
- Automatic calculation:
  - Base service charge: ₹500
  - Skill-based charge (AC: ₹999, Refrigerator: ₹799, etc.)
  - GST: 18%
- Duplicate prevention (one invoice per job)
- Status validation (job must be completed)

**Footer Totals**
- Shows aggregate subtotal, GST, total across filtered invoices

---

### 7. Follow-Up Management

**Scheduled Follow-Ups**
- Follow-up number (auto-generated: FUP-1001...)
- Customer name
- Service type
- Scheduled date
- Reason (e.g., "Post-service quality check")
- Status (scheduled/completed/cancelled)

**Overdue Alerts**
- Red badge count on "Scheduled" status pill
- Banner alert for overdue follow-ups
- Row highlighting (red for overdue, amber for due today)
- Visual indicators in date column

**Follow-Up Scheduling**
- Link to parent appointment
- Required fields: date, reason
- Duplicate prevention (one follow-up per job)
- Auto-populated customer info

---

### 8. AI Operations Page

**Day 1-3 Chat Interface** (Preserved)
- Natural language input
- Streaming responses
- Conversation history
- Quick prompt buttons

**Workflow Reference Panel**
- Day 4 operational workflows
- Example queries
- Best practices

**Quick Prompts Sidebar**
- Pre-built queries for common tasks
- One-click to insert

---

### 9. Settings Page

**Business Profile** (Stub)
- Company name
- Contact information
- Service hours
- Tax information

*(Full settings implementation planned for future)*

---

## 🔧 Technical Features

### Real-Time Data Synchronization
- All mutations wait for backend confirmation
- Automatic UI refresh after operations
- No manual browser refresh needed

### Professional Error Handling
- Python exceptions sanitized (never shown to user)
- HTTP status codes mapped to friendly messages
- Validation errors shown inline
- Network failures handled gracefully

### Loading States
- Button spinners during operations
- Skeleton loaders for initial page load
- Disabled states prevent double-submission

### Empty States
- Helpful messaging when no data
- Call-to-action buttons
- Visual icons for context

### Responsive Design
- Mobile-first layout
- Hamburger menu for mobile
- Touch-friendly tap targets
- Readable on all screen sizes

### Keyboard Navigation
- Tab through interactive elements
- Enter to submit forms
- Escape to close modals

---

## 🎨 Design System

### Color Palette
**Surface (Neutral)**
- Backgrounds, borders, text
- 100, 200, 300, 400, 500, 600, 700, 800, 900

**Brand (Orange)**
- Primary actions, highlights
- 50, 100, 200, 500, 600, 700

**Status Colors**
- Green: Completed, available
- Amber: In progress, busy, warnings
- Red: Cancelled, overdue, errors
- Blue: Scheduled, info
- Violet: Assigned, special states

### Typography
- **Font**: Inter (system font fallback)
- **Scales**: 2xs, xs, sm, base, lg, xl, 2xl
- **Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)

### Components
- Buttons: Primary, ghost, outline variants
- Badges: Status, skill, count
- Cards: Surface with shadow
- Tables: Striped, hover states
- Forms: Labeled inputs, validation
- Modals: Overlay with animations
- Drawers: Slide-in panels

---

## 📊 Business Logic

### Validation Rules
1. **Customers**: Phone must be unique
2. **Technicians**: Phone must be unique
3. **Appointments**: Technician can't be double-booked on same date
4. **Invoices**: One invoice per completed job
5. **Follow-ups**: One follow-up per job
6. **Status Transitions**: Must be logical (can't go from cancelled to completed)

### Calculated Fields
1. **Availability Status** = f(today's jobs, off-day calendar)
   - Unavailable: if today is in off-day list
   - Busy: if has 1+ jobs today
   - Available: otherwise

2. **Invoice Total** = f(base charge, skill charge, GST)
   - Base: ₹500
   - Skill: AC ₹999, Refrigerator ₹799, Washing Machine ₹699, etc.
   - GST: 18% of subtotal

3. **Attention Items** = f(unassigned appointments, overdue follow-ups, uninvoiced completed jobs)
   - Real-time derivation
   - No fake alerts

### Auto-Numbering
- Invoices: INV-1001, INV-1002, ... (sequential)
- Follow-ups: FUP-1001, FUP-1002, ... (sequential)

---

## 🔐 Security Features

### Current Implementation
- ✅ Error sanitization (no Python tracebacks)
- ✅ Input validation on all endpoints
- ✅ Duplicate prevention
- ✅ CORS restricted to localhost
- ✅ Environment variable configuration

### Required for Production
- ⚠️ User authentication
- ⚠️ Role-based access control
- ⚠️ HTTPS/TLS encryption
- ⚠️ Rate limiting
- ⚠️ API key rotation
- ⚠️ Audit logging

---

## 📱 Supported Browsers

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ⚠️ Mobile browsers (functional but not optimized)

---

## 🚀 Performance

### Optimizations
- Tailwind CSS purge (production)
- Vite code splitting
- MongoDB indexes (planned)
- React memo for expensive renders
- Debounced search inputs

### Benchmarks (Development)
- Page load: 1-2 seconds
- API response: 50-200ms
- AI agent: 2-5 seconds
- Dashboard refresh: <500ms

---

## 🎓 User Roles (Planned)

### Admin
- Full access
- Manage technicians
- View all data
- System settings

### Manager
- View all appointments
- Assign technicians
- Generate invoices
- Run reports

### Technician
- View own schedule
- Update job status
- View customer details
- Limited access

### Customer (Self-Service Portal)
- Book appointments
- View own service history
- Make payments
- Rate service

*(Currently: No authentication, single admin-level access)*

---

**Ready to use! 🚀**
