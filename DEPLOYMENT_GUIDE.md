# Quick Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Backend running at `http://72.62.232.8:8000`
- Domain names configured: `admin.mohamedghanem.cloud`, `student.mohamedghanem.cloud`

---

## 📦 Build and Deploy

### Option 1: Using Docker Compose (Recommended)

```bash
# Navigate to project root
cd "c:\Users\fadyb\OneDrive\Desktop\projects\final front"

# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Option 2: Build Individual Containers

#### Admin App
```bash
cd admin

# Build
docker build \
  --build-arg REACT_APP_API_URL=http://72.62.232.8:8000/ \
  -t lms-admin:latest \
  .

# Run
docker run -d \
  --name react-admin \
  --network lms_net \
  lms-admin:latest
```

#### Student App
```bash
cd student

# Build
docker build \
  --build-arg REACT_APP_API_URL=http://72.62.232.8:8000/ \
  --build-arg PUBLIC_URL=/student \
  -t lms-student:latest \
  .

# Run
docker run -d \
  --name react-student \
  --network lms_net \
  lms-student:latest
```

---

## ✅ Verify Deployment

### Check Containers
```bash
# List running containers
docker ps

# Expected output:
# - postgres
# - backend
# - react-admin
# - react-student
# - nginx
```

### Test Endpoints

```bash
# Test Admin app
curl http://admin.mohamedghanem.cloud

# Test Student app
curl http://student.mohamedghanem.cloud

# Test Backend API
curl http://72.62.232.8:8000/health/

# Test Nginx
curl http://72.62.232.8/
```

### Check Logs

```bash
# Admin logs
docker logs react-admin

# Student logs
docker logs react-student

# Nginx logs
docker logs nginx

# Backend logs
docker logs backend
```

---

## 🔄 Update and Rebuild

### Update Frontend Code

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build react-admin react-student

# Or rebuild specific service
docker-compose build react-admin
docker-compose up -d react-admin
```

### Force Rebuild (No Cache)

```bash
# Rebuild without cache
docker-compose build --no-cache react-admin react-student

# Restart
docker-compose up -d
```

---

## 🛑 Stop and Remove

### Stop Services

```bash
# Stop all
docker-compose down

# Stop specific service
docker-compose stop react-admin
```

### Remove Containers

```bash
# Remove all containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Remove specific container
docker rm -f react-admin
```

### Clean Up Images

```bash
# Remove unused images
docker image prune

# Remove specific image
docker rmi lms-admin:latest
```

---

## 🐛 Common Issues

### Issue: Port already in use

```bash
# Find process using port
netstat -ano | findstr :80

# Stop conflicting service or change port in docker-compose.yml
```

### Issue: Network not found

```bash
# Create network manually
docker network create lms_net

# Or let docker-compose create it
docker-compose up -d
```

### Issue: Build fails

```bash
# Clear Docker cache
docker builder prune

# Rebuild without cache
docker-compose build --no-cache
```

### Issue: Container keeps restarting

```bash
# Check logs
docker logs react-admin

# Check if build files exist
docker exec -it react-admin ls -la /usr/share/nginx/html

# Verify nginx config
docker exec -it react-admin nginx -t
```

---

## 📊 Monitoring

### View Resource Usage

```bash
# All containers
docker stats

# Specific container
docker stats react-admin
```

### Health Checks

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' react-admin

# Test health endpoint
curl http://localhost:3000/health
```

---

## 🔐 Production Checklist

Before deploying to production:

- [ ] Set `REACT_APP_API_URL` to production backend URL
- [ ] Configure HTTPS with SSL certificates
- [ ] Update CORS settings in backend
- [ ] Set up monitoring and logging
- [ ] Configure backups for database
- [ ] Test all user flows (login, purchase, etc.)
- [ ] Verify media files are accessible
- [ ] Check security headers
- [ ] Enable rate limiting in Nginx
- [ ] Set up automated deployments (CI/CD)

---

## 📞 Support

For detailed documentation, see:
- `DOCKER_FRONTEND_SETUP.md` - Complete Docker setup guide
- `PROJECT_ARCHITECTURE.md` - Full architecture overview
- `student/API_DOCUMENTATION.md` - API reference

---

## 🎯 Summary

```bash
# Complete deployment in 3 commands:
cd "c:\Users\fadyb\OneDrive\Desktop\projects\final front"
docker-compose build
docker-compose up -d
```

Your LMS application is now running! 🎉

- **Admin**: http://admin.mohamedghanem.cloud
- **Student**: http://student.mohamedghanem.cloud
- **API**: http://72.62.232.8:8000
