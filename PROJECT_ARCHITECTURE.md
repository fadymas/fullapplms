# Full-Stack LMS Application - Architecture Overview

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Diagram](#architecture-diagram)
4. [Service Breakdown](#service-breakdown)
5. [Backend Architecture](#backend-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Deployment & Infrastructure](#deployment--infrastructure)
8. [Data Flow](#data-flow)
9. [Key Features](#key-features)

---

## 🎯 Project Overview

This is a **Learning Management System (LMS)** built as a full-stack web application with:
- **Backend**: Django REST Framework (Python)
- **Frontend**: Two separate React applications (Admin & Student)
- **Database**: PostgreSQL
- **Reverse Proxy**: Nginx
- **Containerization**: Docker & Docker Compose

The application supports three user roles:
- **Students**: Browse courses, purchase with wallet, watch lectures, take quizzes
- **Teachers**: Create and manage courses, lectures, and quizzes
- **Admins**: Full system management including users, courses, wallets, and purchases

---

## 🛠 Technology Stack

### Backend
- **Framework**: Django 6.0.1 with Python 3.12
- **API**: Django REST Framework 3.16.1
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: PostgreSQL 15
- **Web Server**: Gunicorn
- **API Documentation**: drf-yasg (Swagger/ReDoc)

### Frontend
- **Admin App**: React 19.2.3 with Create React App
- **Student App**: React 19.2.3 with Create React App
- **State Management**: Zustand
- **HTTP Client**: Axios
- **UI Framework**: React Bootstrap 5.3.8
- **Routing**: React Router DOM v7
- **Charts**: Chart.js & Recharts

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Reverse Proxy**: Nginx (Alpine)
- **Database**: PostgreSQL 15 (Alpine)

---

## 🏗 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         NGINX (Port 80)                         │
│                    Reverse Proxy & Static Files                 │
└────────┬──────────────────────────┬─────────────────────────────┘
         │                          │
         │                          │
    ┌────▼─────┐              ┌────▼──────┐
    │  Admin   │              │  Student  │
    │  React   │              │   React   │
    │   App    │              │    App    │
    └────┬─────┘              └────┬──────┘
         │                          │
         │         ┌────────────────┘
         │         │
         └─────────▼────────────────────────┐
                   │                        │
            ┌──────▼──────┐         ┌──────▼──────┐
            │   Backend   │         │  PostgreSQL │
            │   Django    │◄────────┤   Database  │
            │ (Port 8000) │         │             │
            └─────────────┘         └─────────────┘
                   │
                   │
            ┌──────▼──────┐
            │    Media    │
            │    Files    │
            └─────────────┘
```

---

## 📦 Service Breakdown

### 1. **Postgres Service**
- **Image**: `postgres:15-alpine`
- **Container**: `postgres`
- **Network**: `lms_net`
- **Volumes**: `postgres_data:/var/lib/postgresql/data`
- **Environment**:
  - Database: `lmsdb`
  - User: `lmsuser`
  - Password: Configurable via `.env`

### 2. **Backend Service**
- **Build**: `./backend/Dockerfile`
- **Container**: `backend`
- **Port**: `8000:8000`
- **Network**: `lms_net`
- **Volumes**:
  - `./backend/media:/app/media` (User uploads)
  - `./backend/staticfiles:/app/staticfiles` (Django static files)
  - `./backend/logs:/app/logs` (Application logs)
- **Dependencies**: postgres
- **Entrypoint**: Runs migrations, collects static files, starts Gunicorn

### 3. **React Admin Service**
- **Build**: `./admin/`
- **Container**: `react-admin`
- **Network**: `lms_net`
- **Build Args**:
  - `REACT_APP_API_URL`: Backend API URL
- **Purpose**: Admin/Teacher dashboard for course management

### 4. **React Student Service**
- **Build**: `./student/`
- **Container**: `react-student`
- **Network**: `lms_net`
- **Build Args**:
  - `REACT_APP_API_URL`: Backend API URL
  - `PUBLIC_URL`: `/student` (for subdirectory routing)
- **Purpose**: Student portal for browsing and consuming courses

### 5. **Nginx Service**
- **Image**: `nginx:alpine`
- **Container**: `nginx`
- **Port**: `80:80`
- **Network**: `lms_net`
- **Volumes**:
  - `./nginx/conf.d:/etc/nginx/conf.d:ro` (Configuration)
  - `./nginx/html:/usr/share/nginx/html:ro` (Static HTML)
  - `./backend/media:/usr/share/nginx/html/media:ro` (Media files)
- **Dependencies**: react-admin, react-student, backend

---

## 🔧 Backend Architecture

### Django Project Structure
```
backend/
├── lms_backend/          # Main Django project
│   ├── settings.py       # Configuration
│   ├── urls.py          # URL routing
│   └── wsgi.py          # WSGI application
├── users/               # User management & authentication
├── courses/             # Course, Section, Lecture models
├── payments/            # Wallet, Transaction, Purchase, RechargeCode
├── quizzes/             # Quiz & Question models
├── notifications/       # Notification system
├── dashboard/           # Dashboard analytics
├── reports/             # Reporting functionality
├── utils/               # Shared utilities
├── media/               # User-uploaded files
├── staticfiles/         # Collected static files
└── logs/                # Application logs
```

### Django Apps

#### **1. Users App**
- **Models**:
  - `CustomUser`: Email-based authentication with roles (student, teacher, admin)
  - `StudentProfile`: Student-specific profile data
  - `TeacherAdminProfile`: Teacher/Admin profile data
  - `WalletReference`: Reference to payment wallet
  - `AuditLog`: System-wide audit trail

#### **2. Courses App**
- **Models**:
  - `Course`: Course with lifecycle (draft → pending → published)
  - `Section`: Course sections containing lectures
  - `Lecture`: Individual lecture content (video, article, quiz, assignment)
- **Features**:
  - Soft delete support
  - Ownership transfer
  - Price locking after first purchase
  - Purchase verification

#### **3. Payments App**
- **Models**:
  - `Wallet`: Student wallet (balance calculated from transactions)
  - `Transaction`: Immutable transaction records
  - `Purchase`: Course purchase linking student, course, and transaction
  - `RechargeCode`: Single-use wallet top-up codes
- **Transaction Types**: Deposit, Withdrawal, Purchase, Refund, Recharge Code, Manual Deposit
- **Payment Methods**: Wallet, Fawry, Manual, Recharge Code

#### **4. Quizzes App**
- Quiz creation and management
- Question bank
- Student attempts and grading

#### **5. Notifications App**
- In-app notifications
- Email notifications (configurable)

#### **6. Dashboard App**
- Analytics and statistics
- Course performance metrics

#### **7. Reports App**
- Financial reports
- User activity reports
- Export functionality (JSON, CSV, Excel)

### API Endpoints
```
/api/users/          # User management & authentication
/api/courses/        # Course CRUD operations
/api/payments/       # Wallet, transactions, purchases
/api/quizzes/        # Quiz management
/api/dashboard/      # Dashboard analytics
/api/notifications/  # Notification management
/api/reports/        # Report generation

/admin/              # Django admin panel
/swagger/            # API documentation (Swagger UI)
/redoc/              # API documentation (ReDoc)
/health/             # Health check endpoint
```

### Authentication & Authorization
- **JWT Tokens**: Access token (1 day), Refresh token (7 days)
- **Token Rotation**: Enabled with blacklisting
- **CORS**: Configured for frontend origins
- **Permissions**: Role-based access control (Student, Teacher, Admin)

---

## 🎨 Frontend Architecture

### Admin Application (`/admin`)

#### Structure
```
admin/src/
├── api/                 # API service layer
│   ├── axiosConfig.js   # Axios instance with interceptors
│   ├── auth.service.js  # Authentication API
│   ├── profiles.service.js
│   └── quiz.service.js
├── components/          # Reusable components
├── pages/               # Page components
│   ├── Dashboard.js
│   ├── Users.js
│   ├── Courses.js
│   ├── Lectures.js
│   ├── ExamList.js
│   ├── Wallets.js
│   └── Purchases.js
├── store/               # Zustand state management
│   └── authStore.js
├── styles/              # CSS modules
└── utils/               # Utility functions
```

#### Features
- **Admin Routes**: `/admin/*` - Full system management
- **Teacher Routes**: `/teacher/*` - Course and content management
- **Protected Routes**: Role-based route guards
- **State Management**: Zustand for auth state
- **API Integration**: Axios with JWT interceptors

### Student Application (`/student`)

#### Structure
```
student/src/
├── api/                 # API service layer
│   ├── axiosConfig.js
│   ├── auth.service.js
│   ├── course.service.js
│   ├── payment.service.js
│   ├── quiz.service.js
│   └── student.service.js
├── components/          # Reusable components
│   └── guards/          # Route guards
│       ├── AuthGuard.js
│       └── GuestGuard.js
├── pages/               # Page components
│   ├── HomePage.js
│   ├── LoginPage.js
│   ├── RegisterPage.js
│   ├── CoursesPage.js
│   ├── CourseDetailsPage.js
│   ├── CoursePlayerPage.js
│   ├── DashboardPage.js
│   ├── MyCoursesPage.js
│   ├── ExamsPage.js
│   └── FawryPage.js
├── store/               # Zustand state management
├── styles/              # CSS modules
└── features/            # Feature modules
```

#### Features
- **Public Routes**: Home, Login, Register
- **Protected Routes**: Dashboard, Courses, Profile, Wallet
- **Course Player**: Video player with lecture navigation
- **Quiz System**: Attempt quizzes and view results
- **Wallet Management**: Recharge and purchase courses

### Shared Frontend Patterns

#### API Configuration
Both apps use a centralized Axios configuration:
```javascript
// axiosConfig.js
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor: Add JWT token
apiClient.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor: Handle 401 errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)
```

#### State Management (Zustand)
```javascript
// authStore.js
const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  login: (user, token) => set({ user, accessToken: token, isAuthenticated: true }),
  logout: () => set({ user: null, accessToken: null, isAuthenticated: false })
}))
```

---

## 🚀 Deployment & Infrastructure

### Docker Compose Configuration

#### Network
- **Name**: `lms_net`
- **Driver**: Bridge
- **Purpose**: Isolated network for all services

#### Volumes
- **postgres_data**: Persistent PostgreSQL data
- **Backend volumes**: Media files, static files, logs

### Nginx Routing

The Nginx configuration handles three routing scenarios:

#### 1. **IP-Based Access** (`http://72.62.232.8/`)
```nginx
location / {
  proxy_pass http://react-admin:80;  # Admin app at root
}

location /student/ {
  proxy_pass http://react-student:80/;  # Student app at /student
}

location /api/ {
  proxy_pass http://backend:8000;  # Backend API
}

location /media/ {
  alias /usr/share/nginx/html/media/;  # Media files
}
```

#### 2. **Admin Subdomain** (`admin.mohamedghanem.cloud`)
```nginx
server {
  listen 80;
  server_name admin.mohamedghanem.cloud;
  
  location / {
    proxy_pass http://react-admin:80;
  }
  
  location /api/ {
    proxy_pass http://backend:8000;
  }
  
  location /media/ {
    alias /usr/share/nginx/html/media/;
  }
}
```

#### 3. **Student Subdomain** (`student.mohamedghanem.cloud`)
```nginx
server {
  listen 80;
  server_name student.mohamedghanem.cloud;
  
  location / {
    proxy_pass http://react-student:80;
  }
  
  location /api/ {
    proxy_pass http://backend:8000;
  }
  
  location /media/ {
    alias /usr/share/nginx/html/media/;
  }
}
```

### Backend Entrypoint Process
```bash
#!/bin/sh
# 1. Wait for database and run migrations
python manage.py migrate --noinput

# 2. Collect static files
python manage.py collectstatic --noinput

# 3. Start Gunicorn
gunicorn --bind 0.0.0.0:8000 lms_backend.wsgi:application
```

### Environment Variables
```env
# Database
POSTGRES_DB=lmsdb
POSTGRES_USER=lmsuser
POSTGRES_PASSWORD=changeme

# Django
SECRET_KEY=django-insecure-key-change-in-production
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,72.62.232.8,admin.mohamedghanem.cloud,student.mohamedghanem.cloud

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://72.62.232.8

# Payment Limits
MAX_WALLET_BALANCE=10000
MAX_DAILY_PURCHASES=10
MAX_RECHARGE_AMOUNT=5000
```

---

## 🔄 Data Flow

### 1. **User Authentication Flow**
```
Student/Teacher/Admin
    ↓
Login Request → Backend API (/api/users/login/)
    ↓
JWT Token Generated
    ↓
Token Stored in Zustand + LocalStorage
    ↓
All API Requests Include Token in Authorization Header
    ↓
Backend Validates Token & Returns Data
```

### 2. **Course Purchase Flow**
```
Student Views Course
    ↓
Clicks "Purchase" → Frontend checks wallet balance
    ↓
API Request: POST /api/payments/purchase/
    ↓
Backend:
  - Validates student has sufficient balance
  - Creates Transaction (type: purchase)
  - Creates Purchase record
  - Links student to course
  - Locks course price (if first purchase)
    ↓
Returns success → Frontend redirects to "My Courses"
```

### 3. **Course Content Access Flow**
```
Student Clicks "Watch Course"
    ↓
Frontend: GET /api/courses/{id}/
    ↓
Backend checks:
  - Is course purchased by student?
  - Is course published?
    ↓
If authorized:
  - Returns course with sections & lectures
  - Student can watch videos, read articles, take quizzes
```

### 4. **Wallet Recharge Flow**
```
Student Enters Recharge Code
    ↓
API Request: POST /api/payments/recharge/
    ↓
Backend:
  - Validates code exists and is unused
  - Creates Transaction (type: recharge_code)
  - Marks code as used
  - Updates wallet balance
    ↓
Returns new balance → Frontend updates UI
```

---

## ✨ Key Features

### For Students
- ✅ Browse and search courses
- ✅ Purchase courses with wallet balance
- ✅ Recharge wallet with codes or Fawry
- ✅ Watch video lectures
- ✅ Take quizzes and view results
- ✅ Track course progress
- ✅ View purchase history

### For Teachers
- ✅ Create and manage courses
- ✅ Organize content into sections and lectures
- ✅ Upload video content
- ✅ Create quizzes and questions
- ✅ View course analytics
- ✅ Manage student enrollments

### For Admins
- ✅ Full user management (CRUD)
- ✅ Approve/reject course submissions
- ✅ Generate recharge codes
- ✅ Manual wallet deposits
- ✅ View all transactions and purchases
- ✅ System-wide analytics and reports
- ✅ Audit logs for all critical actions

### System Features
- 🔒 **Security**: JWT authentication, role-based access control
- 📊 **Analytics**: Dashboard with course stats, revenue tracking
- 💰 **Payment System**: Wallet-based with transaction history
- 🔄 **Soft Deletes**: Courses, sections, and lectures can be restored
- 📝 **Audit Trail**: All critical actions logged
- 🎯 **Price Locking**: Course prices locked after first purchase
- 🔍 **API Documentation**: Swagger/ReDoc for all endpoints
- 🐳 **Containerized**: Easy deployment with Docker Compose

---

## 🔐 Security Considerations

### Backend
- ✅ JWT token expiration and rotation
- ✅ Token blacklisting on logout
- ✅ CORS configuration
- ✅ CSRF protection
- ✅ SQL injection prevention (Django ORM)
- ✅ XSS protection (Django templates)
- ✅ Rate limiting (DRF throttling)
- ✅ Audit logging for critical actions

### Frontend
- ✅ Protected routes with role guards
- ✅ Token stored securely (httpOnly cookies recommended)
- ✅ Automatic logout on 401 errors
- ✅ Input validation
- ✅ Secure API communication (HTTPS in production)

---

## 📈 Scalability Considerations

### Current Architecture
- **Monolithic Django backend**: Single container
- **Separate React apps**: Independently deployable
- **PostgreSQL**: Single database instance
- **Nginx**: Single reverse proxy

### Future Improvements
1. **Backend Scaling**:
   - Add load balancer for multiple backend instances
   - Implement Redis for caching and session storage
   - Use Celery for async tasks (email, reports)

2. **Database Scaling**:
   - Read replicas for analytics queries
   - Connection pooling (PgBouncer)

3. **Frontend Scaling**:
   - CDN for static assets
   - Server-side rendering (Next.js)

4. **Media Storage**:
   - Move to S3/CloudFront for video content
   - Implement video streaming (HLS/DASH)

---

## 🧪 Development Workflow

### Local Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Access services
# - Admin App: http://localhost/ or http://admin.mohamedghanem.cloud
# - Student App: http://localhost/student or http://student.mohamedghanem.cloud
# - Backend API: http://localhost:8000
# - Swagger Docs: http://localhost:8000/swagger/
```

### Frontend Development (without Docker)
```bash
# Admin app
cd admin
npm install
npm start  # Runs on http://localhost:3000

# Student app
cd student
npm install
npm start  # Runs on http://localhost:3001
```

---

## 📚 Documentation References

- **Backend API**: `/swagger/` or `/redoc/`
- **Student App Docs**: `student/API_DOCUMENTATION.md`
- **Student Architecture**: `student/ARCHITECTURE_REFACTOR_PLAN.md`
- **Student Integration**: `student/INTEGRATION_GUIDE.md`
- **Student Flow**: `student/FLOW_DOCUMENTATION.md`

---

## 🎯 Conclusion

This LMS application demonstrates a modern, production-ready architecture with:
- **Separation of Concerns**: Backend API, Admin UI, Student UI
- **Containerization**: Easy deployment and scaling
- **Security**: JWT authentication, role-based access
- **Scalability**: Microservices-ready architecture
- **Maintainability**: Clean code structure, comprehensive documentation

The system is designed to handle real-world LMS requirements including course management, payment processing, quiz systems, and analytics, while maintaining security and performance standards.
