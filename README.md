# LMS Full-Stack Application

A comprehensive Learning Management System built with Django REST Framework (backend) and React (frontend), containerized with Docker.

## 🎯 Overview

This LMS platform supports three user roles:
- **Students**: Browse courses, purchase with wallet, watch lectures, take quizzes
- **Teachers**: Create and manage courses, lectures, and quizzes
- **Admins**: Full system management including users, courses, wallets, and purchases

## 🛠 Technology Stack

### Backend
- Django 6.0.1 + Django REST Framework
- PostgreSQL 15
- JWT Authentication
- Gunicorn WSGI Server

### Frontend
- React 19.2.3
- Zustand (State Management)
- React Router v7
- Axios (HTTP Client)
- Bootstrap 5

### Infrastructure
- Docker & Docker Compose
- Nginx (Reverse Proxy)
- Multi-stage builds for optimization

## 📁 Project Structure

```
.
├── backend/              # Django REST API
│   ├── users/           # User management & auth
│   ├── courses/         # Course management
│   ├── payments/        # Wallet & transactions
│   ├── quizzes/         # Quiz system
│   ├── notifications/   # Notification system
│   ├── dashboard/       # Analytics
│   └── reports/         # Reporting
│
├── admin/               # React Admin Dashboard
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
│
├── student/             # React Student Portal
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
│
├── nginx/               # Nginx reverse proxy
│   └── conf.d/
│       └── app.conf
│
├── postgres/            # PostgreSQL data
│
├── docker-compose.yml   # Container orchestration
└── .env                 # Environment variables
```

## 🚀 Quick Start

### Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "final front"
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
# Database
POSTGRES_DB=lmsdb
POSTGRES_USER=lmsuser
POSTGRES_PASSWORD=your_secure_password

# Django
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,72.62.232.8,admin.mohamedghanem.cloud,student.mohamedghanem.cloud

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://72.62.232.8,http://admin.mohamedghanem.cloud,http://student.mohamedghanem.cloud
```

### 3. Build and Run

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Initialize Database

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# (Optional) Load sample data
docker-compose exec backend python manage.py loaddata sample_data.json
```

### 5. Access the Application

- **Admin Dashboard**: http://admin.mohamedghanem.cloud or http://localhost/
- **Student Portal**: http://student.mohamedghanem.cloud or http://localhost/student
- **Backend API**: http://72.62.232.8:8000
- **API Docs (Swagger)**: http://72.62.232.8:8000/swagger/
- **Django Admin**: http://72.62.232.8:8000/admin/

## 📚 Documentation

- **[PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)** - Complete architecture overview
- **[DOCKER_FRONTEND_SETUP.md](./DOCKER_FRONTEND_SETUP.md)** - Docker setup for frontends
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Quick deployment guide
- **[student/API_DOCUMENTATION.md](./student/API_DOCUMENTATION.md)** - API reference

## 🔧 Development

### Backend Development

```bash
# Access backend shell
docker-compose exec backend bash

# Run Django commands
docker-compose exec backend python manage.py <command>

# View backend logs
docker-compose logs -f backend

# Run tests
docker-compose exec backend python manage.py test
```

### Frontend Development

#### Option 1: With Docker (Production-like)

```bash
# Rebuild frontend
docker-compose up -d --build react-admin

# View logs
docker-compose logs -f react-admin
```

#### Option 2: Without Docker (Hot Reload)

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

### Database Management

```bash
# Access PostgreSQL
docker-compose exec postgres psql -U lmsuser -d lmsdb

# Backup database
docker-compose exec postgres pg_dump -U lmsuser lmsdb > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U lmsuser -d lmsdb
```

## 🐳 Docker Commands

### Container Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart backend

# View running containers
docker-compose ps

# View logs
docker-compose logs -f [service_name]
```

### Rebuilding

```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build react-admin

# Rebuild without cache
docker-compose build --no-cache

# Rebuild and restart
docker-compose up -d --build
```

### Cleanup

```bash
# Remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Remove unused images
docker image prune

# Remove everything
docker system prune -a
```

## 🔐 Security

### Production Checklist

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Set `DEBUG=False` in production
- [ ] Update `ALLOWED_HOSTS` with your domain
- [ ] Configure HTTPS with SSL certificates (Let's Encrypt)
- [ ] Update CORS settings to only allow trusted origins
- [ ] Use strong database passwords
- [ ] Enable rate limiting in Nginx
- [ ] Regular security updates (`docker-compose pull`)
- [ ] Set up automated backups
- [ ] Configure monitoring and logging

### SSL/HTTPS Setup

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d admin.mohamedghanem.cloud -d student.mohamedghanem.cloud

# Auto-renewal (cron job)
sudo crontab -e
# Add: 0 0 * * * certbot renew --quiet
```

## 📊 Monitoring

### Health Checks

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' backend

# Test endpoints
curl http://72.62.232.8:8000/health/
curl http://admin.mohamedghanem.cloud/health
curl http://student.mohamedghanem.cloud/health
```

### Resource Usage

```bash
# View resource usage
docker stats

# View specific container
docker stats backend
```

### Logs

```bash
# View all logs
docker-compose logs

# Follow logs
docker-compose logs -f

# View specific service
docker-compose logs backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port 80
netstat -ano | findstr :80

# Stop the process or change port in docker-compose.yml
```

#### Database Connection Error

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

#### Frontend Not Loading

```bash
# Check if containers are running
docker-compose ps

# Rebuild frontend
docker-compose up -d --build react-admin

# Check Nginx logs
docker-compose logs nginx
```

#### API CORS Errors

Update `backend/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    'http://admin.mohamedghanem.cloud',
    'http://student.mohamedghanem.cloud',
]
```

### Reset Everything

```bash
# Stop and remove all containers
docker-compose down -v

# Remove all images
docker rmi $(docker images -q)

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
docker-compose exec backend python manage.py test

# Run specific app tests
docker-compose exec backend python manage.py test users

# Run with coverage
docker-compose exec backend coverage run --source='.' manage.py test
docker-compose exec backend coverage report
```

### Frontend Tests

```bash
# Admin tests
cd admin
npm test

# Student tests
cd student
npm test
```

## 📈 Performance Optimization

### Backend
- Enable Django caching (Redis)
- Use database connection pooling
- Optimize database queries (select_related, prefetch_related)
- Enable Gunicorn workers: `gunicorn --workers 4`

### Frontend
- Code splitting with React.lazy()
- Image optimization
- CDN for static assets
- Service worker for offline support

### Database
- Add database indexes
- Regular VACUUM and ANALYZE
- Connection pooling with PgBouncer

### Nginx
- Enable gzip compression ✅ (already configured)
- Browser caching ✅ (already configured)
- HTTP/2 support
- Load balancing for multiple backend instances

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Backend**: Django REST Framework
- **Frontend**: React Development Team
- **DevOps**: Docker & Nginx Configuration

## 📞 Support

For issues and questions:
- Check the [Documentation](./PROJECT_ARCHITECTURE.md)
- Review [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- Open an issue on GitHub

## 🎯 Roadmap

### Current Features
- ✅ User authentication (JWT)
- ✅ Role-based access control
- ✅ Course management
- ✅ Wallet & payment system
- ✅ Quiz system
- ✅ Video lectures
- ✅ Docker deployment

### Planned Features
- [ ] Real-time notifications (WebSockets)
- [ ] Video streaming (HLS/DASH)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Certificate generation
- [ ] Discussion forums
- [ ] Live classes (WebRTC)

## 🌟 Acknowledgments

- Django REST Framework team
- React team
- Docker community
- Nginx developers
- All contributors

---

**Built with ❤️ using Django, React, and Docker**
