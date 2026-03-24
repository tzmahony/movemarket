# MoveMarket — AWS Infrastructure

Terraform for a single EC2 instance deployment. Free-tier eligible.

## Architecture

```
Browser → Elastic IP → nginx (port 80)
                         ├── /* → React build (static files on disk)
                         ├── /api/* → uvicorn (port 8000, loopback)
                         └── /uploads/* → uvicorn → S3
```

- **EC2 t3.micro** — runs nginx + uvicorn via systemd
- **EBS 20 GB** — SQLite database lives here at `/data/movemarket/movemarket.db`
- **S3 bucket** — image uploads (EC2 accesses it via IAM role, no credentials needed)
- **Elastic IP** — static address that survives reboots

## Prerequisites

1. [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5
2. AWS CLI configured (`aws configure`)
3. An EC2 key pair already created in your target region (EC2 console → Key Pairs)

## Two code changes needed before deploying

The app currently writes images to local disk and uses a hardcoded JWT secret. Before deploying:

**1. Read `SECRET_KEY` from the environment in `backend/auth.py`:**
```python
import os
SECRET_KEY = os.environ.get("SECRET_KEY", "dev-only-change-me")
```

**2. Move image uploads to S3 in `backend/routes/uploads.py`:**
Instead of saving to `backend/uploads/`, write to S3 using `boto3` and return the S3 URL. The IAM role provisioned by Terraform gives the EC2 instance permission to do this without any credentials in the code.

## Deploy

```bash
cd infra

# 1. Copy and fill in your values
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars

# 2. Init and apply
terraform init
terraform plan
terraform apply
```

Terraform outputs the server IP and an SSH command when done.

## Deploy your code

After `terraform apply`, push your code to the server:

```bash
# From the project root
rsync -avz --exclude node_modules --exclude .git --exclude backend/movemarket.db \
  . ubuntu@<your-ip>:/opt/movemarket/

# On the server:
ssh ubuntu@<your-ip>
cd /opt/movemarket/backend
python3 -m venv /opt/movemarket/venv
/opt/movemarket/venv/bin/pip install -r requirements.txt

cd /opt/movemarket/frontend
npm install && npm run build

sudo systemctl enable movemarket
sudo systemctl start movemarket
sudo systemctl reload nginx
```

## Tear down

```bash
terraform destroy
```

## Next steps (when you need them)

- **HTTPS** — install Certbot: `sudo apt install certbot python3-certbot-nginx && sudo certbot --nginx`
- **Custom domain** — point an A record at the Elastic IP, then run Certbot
- **Postgres** — add an RDS instance to `main.tf` and change `DATABASE_URL` if SQLite becomes a bottleneck
- **CI/CD** — a simple GitHub Actions workflow can rsync + restart systemd on push
