output "public_ip" {
  description = "Elastic IP of the server — point your domain here"
  value       = aws_eip.app.public_ip
}

output "public_dns" {
  description = "Public DNS (use this to access the app before you have a domain)"
  value       = "http://${aws_eip.app.public_ip}"
}

output "s3_bucket" {
  description = "S3 bucket name for image uploads"
  value       = aws_s3_bucket.uploads.bucket
}

output "ssh_command" {
  description = "SSH into the server"
  value       = "ssh -i ~/.ssh/${var.key_pair_name}.pem ubuntu@${aws_eip.app.public_ip}"
}
