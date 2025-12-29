#!/bin/bash

# GEZY OS Deployment Script
# Dieses Skript deployt GEZY OS auf den VPS

set -e  # Exit on error

VPS_HOST="147.93.58.99"
VPS_USER="root"
DEPLOY_PATH="/var/www/gezy_os"
DOMAIN="system.gezy.org"

echo "========================================="
echo "GEZY OS Deployment Script"
echo "========================================="
echo ""

# Check SSH connection
echo "[1/7] Checking SSH connection to VPS..."
if ! ssh -o ConnectTimeout=5 ${VPS_USER}@${VPS_HOST} "echo 'SSH connection successful'"; then
    echo "Error: Cannot connect to VPS via SSH"
    echo "Please check your SSH key configuration"
    exit 1
fi
echo "✓ SSH connection OK"
echo ""

# Install Docker if not present
echo "[2/7] Checking Docker installation on VPS..."
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl start docker
    systemctl enable docker
else
    echo "Docker is already installed"
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    apt-get update
    apt-get install -y docker-compose-plugin
else
    echo "Docker Compose is already installed"
fi
ENDSSH
echo "✓ Docker OK"
echo ""

# Clone or update repository
echo "[3/7] Deploying code to VPS..."
ssh ${VPS_USER}@${VPS_HOST} << ENDSSH
if [ -d "${DEPLOY_PATH}" ]; then
    echo "Updating existing repository..."
    cd ${DEPLOY_PATH}
    git pull origin main
else
    echo "Cloning repository..."
    mkdir -p /var/www
    cd /var/www
    git clone https://github.com/MrYueHang/gez-os.git gezy_os
    cd gezy_os
fi
ENDSSH
echo "✓ Code deployed"
echo ""

# Setup environment variables
echo "[4/7] Setting up environment variables..."
echo "Please ensure you have configured the .env file on the VPS!"
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
cd /var/www/gezy_os
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.production .env
    echo ""
    echo "⚠️  IMPORTANT: Edit /var/www/gezy_os/.env and set your secure values!"
    echo "   - MYSQL_ROOT_PASSWORD"
    echo "   - JWT_SECRET"
    echo "   - VITE_APP_ID"
    echo ""
fi
ENDSSH
echo "✓ Environment setup complete"
echo ""

# Start Docker containers
echo "[5/7] Starting Docker containers..."
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
cd /var/www/gezy_os
docker-compose down || true
docker-compose up -d --build
echo "Waiting for containers to start..."
sleep 10
docker-compose ps
ENDSSH
echo "✓ Containers started"
echo ""

# Initialize database
echo "[6/7] Initializing database..."
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
cd /var/www/gezy_os
echo "Running database migrations..."
docker-compose exec -T app pnpm db:push || true
ENDSSH
echo "✓ Database initialized"
echo ""

# Setup Nginx and SSL
echo "[7/7] Setting up Nginx and SSL..."
ssh ${VPS_USER}@${VPS_HOST} << ENDSSH
# Install Nginx if not present
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    apt-get update
    apt-get install -y nginx
fi

# Copy Nginx config
cp ${DEPLOY_PATH}/nginx.conf /etc/nginx/sites-available/gezy_os
ln -sf /etc/nginx/sites-available/gezy_os /etc/nginx/sites-enabled/

# Install Certbot if not present
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Test Nginx config
nginx -t

# Get SSL certificate
if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    echo "Obtaining SSL certificate..."
    certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email admin@gezy.org || echo "SSL setup needs manual intervention"
fi

# Reload Nginx
systemctl reload nginx
ENDSSH
echo "✓ Nginx and SSL configured"
echo ""

echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
echo "Your app should now be available at:"
echo "https://${DOMAIN}"
echo ""
echo "Useful commands:"
echo "  ssh ${VPS_USER}@${VPS_HOST}"
echo "  cd ${DEPLOY_PATH}"
echo "  docker-compose logs -f app"
echo "  docker-compose ps"
echo ""
