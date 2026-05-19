resource "aws_s3_bucket_policy" "terraform_state_bucket_policy" {
  bucket = var.terraform_bucket

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowGitHubActionsInfraRole"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_role.github_actions_infra_role.arn
        }
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::${var.terraform_bucket}",
          "arn:aws:s3:::${var.terraform_bucket}/*"
        ]
      }
    ]
  })
}