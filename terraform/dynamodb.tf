resource "aws_dynamodb_table" "products" {
  name         = "${var.app_name}-products-table-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  deletion_protection_enabled =  var.environment == "prod" ? true : false
  attribute {
    name = "id"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = "${var.app_name}-products-table-${var.environment}"
  }

}