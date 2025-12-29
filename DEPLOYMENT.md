# GEZY OS - Deployment Anleitung

## Voraussetzungen auf VPS (147.93.58.99)

1. Docker & Docker Compose installiert
2. Nginx installiert
3. SSH-Zugang eingerichtet
4. Domain system.gezy.org zeigt auf Server-IP

## Deployment Schritte

### 1. Code auf VPS hochladen

```bash
# Auf lokalem Rechner
cd ~/Downloads/gezy_os

# Repository auf GitHub pushen (falls noch nicht gemacht)
git add .
git commit -m "Add deployment configuration"
git push origin main

# Auf VPS
ssh root@147.93.58.99
cd /var/www
git clone https://github.com/MrYueHang/gez-os.git gezy_os
cd gezy_os
```

### 2. Umgebungsvariablen einrichten

```bash
# .env Datei erstellen
cp .env.production .env

# .env Datei bearbeiten und sichere Werte eintragen:
nano .env
```

Wichtige Werte ändern:
- `MYSQL_ROOT_PASSWORD`: Sicheres Passwort
- `JWT_SECRET`: Sicherer zufälliger String
- `VITE_APP_ID`: Deine Manus App ID
- `OWNER_OPEN_ID`: Deine OpenID

### 3. Docker Container starten

```bash
# Docker Compose starten
docker-compose up -d

# Logs überprüfen
docker-compose logs -f app

# Container Status prüfen
docker-compose ps
```

### 4. Datenbank initialisieren

```bash
# In den App Container
docker-compose exec app sh

# Datenbank Migrationen ausführen
pnpm db:push

# Container verlassen
exit
```

### 5. Nginx einrichten

```bash
# Nginx Konfiguration kopieren
cp nginx.conf /etc/nginx/sites-available/gezy_os

# Symlink erstellen
ln -s /etc/nginx/sites-available/gezy_os /etc/nginx/sites-enabled/

# SSL Zertifikat mit Let's Encrypt erstellen
apt-get update
apt-get install -y certbot python3-certbot-nginx

certbot --nginx -d system.gezy.org

# Nginx testen und neuladen
nginx -t
systemctl reload nginx
```

### 6. Firewall Regeln (falls UFW aktiv)

```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload
```

## Wartung & Nützliche Befehle

### Container Management

```bash
# Container stoppen
docker-compose down

# Container neu starten
docker-compose restart

# Logs anzeigen
docker-compose logs -f app

# Container neu bauen
docker-compose build --no-cache
docker-compose up -d
```

### Updates deployen

```bash
cd /var/www/gezy_os
git pull origin main
docker-compose build
docker-compose up -d
```

### Datenbank Backup

```bash
# Backup erstellen
docker-compose exec mysql mysqldump -u root -pgezy123 gezy_os > backup_$(date +%Y%m%d).sql

# Backup wiederherstellen
docker-compose exec -T mysql mysql -u root -pgezy123 gezy_os < backup_YYYYMMDD.sql
```

### Troubleshooting

```bash
# App Logs
docker-compose logs -f app

# MySQL Logs
docker-compose logs -f mysql

# Container Shell
docker-compose exec app sh

# Alle Container Status
docker ps -a

# Nginx Fehler
tail -f /var/log/nginx/error.log
```

## Zugriff

Nach erfolgreichem Deployment ist die App erreichbar unter:
- **https://system.gezy.org**

## Sicherheit Checklist

- [ ] Starke Passwörter in .env gesetzt
- [ ] JWT_SECRET ist zufällig und sicher
- [ ] SSL Zertifikat ist installiert
- [ ] Firewall ist konfiguriert
- [ ] Regelmäßige Backups eingerichtet
- [ ] Nginx Security Headers aktiv
- [ ] SSH Key-basierte Authentifizierung
- [ ] Root Login deaktiviert (empfohlen)

## Support

Bei Problemen:
1. Logs überprüfen
2. Container Status prüfen
3. Nginx Konfiguration testen
4. Datenbank Verbindung testen
