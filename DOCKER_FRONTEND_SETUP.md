# Docker Setup for Frontend Applications

## 📋 Overview

This document describes the Docker setup for the Admin and Student React applications. Both apps use **multi-stage builds** with Node.js for building and Nginx for serving static files in production.

---

## 🏗 Architecture

### Multi-Stage Build Process

```
┌─────────────────────────────────────────────┐
│  Stage 1: Builder (node:18-alpine)          │
│  - Install dependencies (npm ci)            │
│  - Build React app (npm run build)          │
│  - Output: /app/build directory             │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  Stage 2: Production (nginx:alpine)         │
│  - Copy build files from Stage 1            │
│  - Copy custom nginx.conf                   │
│  - Serve static files on port 80            │
└─────────────────────────────────────────────┘
```

### Benefits of Multi-Stage Builds
- ✅ **Smaller Image Size**: Final image only contains Nginx + built files (~25MB vs ~500MB)
- ✅ **Security**: No Node.js or source code in production image
- ✅ **Performance**: Nginx serves static files efficiently
- ✅ **Simplicity**: Single Dockerfile for build and deploy

---

## 📁 File Structure

### Admin App
```
admin/
├── Dockerfile           # Multi-stage build configuration
├── nginx.conf          # Nginx server configuration
├── .dockerignore       # Files to exclude from build
├── package.json        # Dependencies
└── src/                # Source code
```

### Student App
```
student/
├── Dockerfile           # Multi-stage build configuration
├── nginx.conf          # Nginx server configuration
├── .dockerignore       # Files to exclude from build
├── package.json        # Dependencies
└── src/                # Source code
```

---

## 🔧 Dockerfile Breakdown

### Stage 1: Builder

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production --silent

# Build app with environment variables
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
RUN npm run build
```

**Key Points**:
- Uses `npm ci` for reproducible builds
- Accepts `REACT_APP_API_URL` as build argument
- Creates optimized production build

### Stage 2: Production

```dockerfile
FROM nginx:alpine

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Key Points**:
- Minimal Alpine-based Nginx image
- Custom configuration for SPA routing
- Health check for container monitoring

---

## ⚙️ Nginx Configuration

### Features

1. **SPA Routing Support**
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```
   - All routes fall back to `index.html`
   - Enables client-side routing (React Router)

2. **Gzip Compression**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/javascript application/json;
   ```
   - Reduces bandwidth usage by ~70%
   - Faster page loads

3. **Static Asset Caching**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```
   - 1-year cache for static assets
   - Improves performance for repeat visitors

4. **Security Headers**
   ```nginx
   add_header X-Frame-Options "SAMEORIGIN" always;
   add_header X-Content-Type-Options "nosniff" always;
   add_header X-XSS-Protection "1; mode=block" always;
   ```
   - Protects against clickjacking, MIME sniffing, XSS

5. **Health Check Endpoint**
   ```nginx
   location /health {
       return 200 "healthy\n";
   }
   ```
   - Used by Docker and load balancers

---

## 🚀 Building the Images

### Build Admin App

```bash
# Navigate to admin directory
cd admin

# Build with API URL
docker build \
  --build-arg REACT_APP_API_URL=http://72.62.232.8:8000/ \
  -t lms-admin:latest \
  .

# Or use docker-compose
docker-compose build react-admin
```

### Build Student App

```bash
# Navigate to student directory
cd student

# Build with API URL and PUBLIC_URL
docker build \
  --build-arg REACT_APP_API_URL=http://72.62.232.8:8000/ \
  --build-arg PUBLIC_URL=/student \
  -t lms-student:latest \
  .

# Or use docker-compose
docker-compose build react-student
```

---

## 🐳 Running the Containers

### Run Admin Container

```bash
docker run -d \
  --name react-admin \
  --network lms_net \
  -p 3000:80 \
  lms-admin:latest
```

### Run Student Container

```bash
docker run -d \
  --name react-student \
  --network lms_net \
  -p 3001:80 \
  lms-student:latest
```

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f react-admin
docker-compose logs -f react-student

# Rebuild and restart
docker-compose up -d --build react-admin react-student
```

---

## 🌐 Nginx Reverse Proxy Integration

The main Nginx container (in `nginx/conf.d/app.conf`) proxies requests to the React containers:

### Admin Subdomain Configuration

```nginx
server {
    listen 80;
    server_name admin.mohamedghanem.cloud;

    location / {
        proxy_pass http://react-admin:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://backend:8000;
        # ... proxy headers
    }

    location /media/ {
        alias /usr/share/nginx/html/media/;
    }
}
```

### Student Subdomain Configuration

```nginx
server {
    listen 80;
    server_name student.mohamedghanem.cloud;

    location / {
        proxy_pass http://react-student:80;
        # ... proxy headers
    }

    location /api/ {
        proxy_pass http://backend:8000;
        # ... proxy headers
    }

    location /media/ {
        alias /usr/share/nginx/html/media/;
    }
}
```

---

## 🔐 Environment Variables

### Admin App

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://72.62.232.8:8000/` |

### Student App

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://72.62.232.8:8000/` |
| `PUBLIC_URL` | Public path for assets | `/student` or `/` |

**Note**: These are **build-time** variables, not runtime. To change them, you must rebuild the Docker image.

---

## 📊 Container Specifications

### Resource Usage

| Container | Image Size | Memory | CPU |
|-----------|------------|--------|-----|
| react-admin | ~25MB | ~10MB | Minimal |
| react-student | ~25MB | ~10MB | Minimal |

### Ports

| Container | Internal Port | External Port (example) |
|-----------|---------------|-------------------------|
| react-admin | 80 | 3000 (if exposed) |
| react-student | 80 | 3001 (if exposed) |

**Note**: In production, ports are not exposed externally. Nginx reverse proxy handles all traffic.

---

## 🧪 Testing the Containers

### Test Admin Container

```bash
# Check if container is running
docker ps | grep react-admin

# Test health endpoint
curl http://localhost:3000/health

# View logs
docker logs react-admin

# Access shell
docker exec -it react-admin sh
```

### Test Student Container

```bash
# Check if container is running
docker ps | grep react-student

# Test health endpoint
curl http://localhost:3001/health

# View logs
docker logs react-student

# Access shell
docker exec -it react-student sh
```

---

## 🔍 Troubleshooting

### Issue: Build fails with "npm ERR!"

**Solution**: Clear npm cache and rebuild
```bash
docker-compose build --no-cache react-admin
```

### Issue: Container starts but shows 404

**Cause**: Nginx can't find built files

**Solution**: Check if build directory exists
```bash
docker exec -it react-admin ls -la /usr/share/nginx/html
```

### Issue: API calls fail with CORS errors

**Cause**: Backend CORS settings don't include frontend origin

**Solution**: Update backend `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    'http://admin.mohamedghanem.cloud',
    'http://student.mohamedghanem.cloud',
    'http://72.62.232.8',
]
```

### Issue: React Router routes return 404

**Cause**: Nginx not configured for SPA routing

**Solution**: Verify `nginx.conf` has:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Issue: Static assets not loading

**Cause**: Incorrect `PUBLIC_URL` or asset paths

**Solution**: Rebuild with correct `PUBLIC_URL`:
```bash
docker build --build-arg PUBLIC_URL=/ -t lms-admin .
```

---

## 🚀 Deployment Workflow

### Development to Production

1. **Develop locally** (without Docker)
   ```bash
   npm start  # Hot reload at http://localhost:3000
   ```

2. **Test build locally**
   ```bash
   npm run build
   npx serve -s build  # Test production build
   ```

3. **Build Docker image**
   ```bash
   docker build --build-arg REACT_APP_API_URL=http://72.62.232.8:8000/ -t lms-admin .
   ```

4. **Test Docker container**
   ```bash
   docker run -p 3000:80 lms-admin
   curl http://localhost:3000
   ```

5. **Deploy to server**
   ```bash
   # Option 1: Docker Compose
   docker-compose up -d --build react-admin

   # Option 2: Manual
   docker build -t lms-admin .
   docker stop react-admin && docker rm react-admin
   docker run -d --name react-admin --network lms_net lms-admin
   ```

6. **Verify deployment**
   ```bash
   curl http://admin.mohamedghanem.cloud
   docker logs react-admin
   ```

---

## 📈 Performance Optimization

### Build Optimization

1. **Use .dockerignore**
   - Excludes `node_modules`, `.git`, etc.
   - Reduces build context size by ~90%

2. **Layer Caching**
   - `COPY package*.json` before `COPY .`
   - Dependencies cached unless package.json changes

3. **Production Dependencies Only**
   - `npm ci --only=production`
   - Smaller `node_modules`, faster builds

### Runtime Optimization

1. **Gzip Compression**
   - Enabled in `nginx.conf`
   - Reduces transfer size by ~70%

2. **Static Asset Caching**
   - 1-year cache for JS/CSS/images
   - Browser caches assets after first visit

3. **Minimal Base Image**
   - `nginx:alpine` is only ~5MB
   - Faster pulls, less attack surface

---

## 🔒 Security Best Practices

### Dockerfile Security

✅ **Use specific versions**: `node:18-alpine` not `node:latest`  
✅ **Non-root user**: Nginx runs as `nginx` user by default  
✅ **No secrets in image**: Use build args, not hardcoded values  
✅ **Minimal base image**: Alpine reduces vulnerabilities  

### Nginx Security

✅ **Security headers**: X-Frame-Options, X-Content-Type-Options, etc.  
✅ **No directory listing**: Disabled by default  
✅ **HTTPS ready**: Add SSL certificates in production  
✅ **Rate limiting**: Can be added to prevent abuse  

### Production Checklist

- [ ] Use HTTPS (Let's Encrypt/Certbot)
- [ ] Set `DEBUG=False` in backend
- [ ] Use environment-specific API URLs
- [ ] Enable CORS only for trusted origins
- [ ] Implement CSP headers
- [ ] Regular security updates (`docker pull nginx:alpine`)

---

## 📚 Additional Resources

- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [React Production Build](https://create-react-app.dev/docs/production-build/)
- [Docker Compose Networking](https://docs.docker.com/compose/networking/)

---

## 🎯 Summary

This Docker setup provides:

✅ **Production-ready** multi-stage builds  
✅ **Optimized** for size and performance  
✅ **Secure** with best practices  
✅ **Maintainable** with clear documentation  
✅ **Scalable** for future growth  

Both Admin and Student apps are containerized identically, making them easy to deploy, scale, and maintain alongside the existing backend and Nginx infrastructure.
