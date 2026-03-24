variable "app_name" {
  description = "Used to name all resources"
  type        = string
  default     = "movemarket"
}

variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type (t3.micro is free-tier eligible)"
  type        = string
  default     = "t3.micro"
}

variable "key_pair_name" {
  description = "Name of an existing EC2 key pair to use for SSH access"
  type        = string
}

variable "ssh_allowed_cidr" {
  description = "CIDR block allowed to SSH in. Use your IP: curl ifconfig.me/ip"
  type        = string
  default     = "0.0.0.0/0" # Restrict this to your own IP in terraform.tfvars
}

variable "secret_key" {
  description = "JWT signing secret — use a long random string (e.g. openssl rand -hex 32)"
  type        = string
  sensitive   = true
}
