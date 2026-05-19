#vpc_id     = "vpc-0123456789abcdef0"
#subnet_ids = ["subnet-0aaa1111bbb2222cc", "subnet-0ddd3333eee4444ff"]

app_name    = "inventory-api"
environment = "dev"
aws_region  = "us-east-1"
github_org  = "FelixIpn999"
github_repo = "serverexample"

image_tag = "latest"

#acm_certificate_arn = "arn:aws:acm:us-east-1:257746103804:certificate/5ff547ce-b0ef-49d3-86d3-ff8c0f90a8ec"

db_password_secret = "poc-dev-password-123" # ⚠️ Solo dev, después externalize

