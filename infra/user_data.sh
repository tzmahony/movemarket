#!/bin/bash
set -euxo pipefail

APP_NAME="${app_name}"
S3_BUCKET="${s3_bucket}"
AWS_REGION="${aws_region}"
SECRET_KEY="${secret_key}"

# ── System packages ──────────────────────────────────────────────────────────
apt-get update -y
apt-get install -y python3-pip python3-venv nginx git awscli

# ── App directory ────────────────────────────────────────────────────────────
mkdir -p /opt/$APP_NAME
chown ubuntu:ubuntu /opt/$APP_NAME

# ── Environment file ─────────────────────────────────────────────────────────
# You'll push your code via git or scp after provisioning.
# This file is written now so it's ready when the app starts.
cat > /opt/$APP_NAME/.env <<EOF
SECRET_KEY=$SECRET_KEY
S3_BUCKET=$S3_BUCKET
AWS_REGION=$AWS_REGION
DATABASE_URL=sqlite:////data/$APP_NAME/movemarket.db
EOF
chmod 600 /opt/$APP_NAME/.env

# ── Persistent data directory (on the root EBS volume) ──────────────────────
mkdir -p /data/$APP_NAME
chown ubuntu:ubuntu /data/$APP_NAME

# ── systemd service for uvicorn ──────────────────────────────────────────────
cat > /etc/systemd/system/$APP_NAME.service <<EOF
[Unit]
Description=MoveMarket FastAPI backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/$APP_NAME/backend
EnvironmentFile=/opt/$APP_NAME/.env
ExecStart=/opt/$APP_NAME/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
# Service won't start until you deploy the code — that's fine.

# ── nginx ────────────────────────────────────────────────────────────────────
# Serves the React build as static files and proxies /api to uvicorn.
cat > /etc/nginx/sites-available/$APP_NAME <<'NGINX'
server {
    listen 80;
    server_name _;

    # React build (upload via scp or CI)
    root /opt/movemarket/frontend/dist;
    index index.html;

    # All frontend routes fall back to index.html (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API — proxy to uvicorn
    location /api/ {
        proxy_pass         http://127.0.0.1:8000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Uploaded images — proxy to uvicorn (which serves /uploads from S3 or disk)
    location /uploads/ {
        proxy_pass http://127.0.0.1:8000;
    }

    client_max_body_size 20M;
}
NGINX

ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
systemctl enable nginx
