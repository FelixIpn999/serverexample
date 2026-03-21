resource "aws_ecr_repository" "app_repo" {
  name                 = "${var.app_name}-repo-${var.environment}"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}