# Alarma si la tabla está siendo throttled
resource "aws_cloudwatch_metric_alarm" "dynamodb_throttle_alert"{
  alarm_name = "${var.app_name}-dynamodb-throttle-alert-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods = "2"
  metric_name = "ConsumedWriteCapacityUnits"
  namespace = "AWS/DynamoDB"
  period = "300"
  statistic = "Sum"
  threshold = "100"

  dimensions = {
    TableName = aws_dynamodb_table.products.name
  }
}


# Alarma si hay errores de sistema
resource "aws_cloudwatch_metric_alarm" "dynamodb_system_errors" {
  alarm_name          = "${var.app_name}-dynamodb-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "SystemErrors"
  namespace           = "AWS/DynamoDB"
  period              = "60"
  statistic           = "Sum"
  threshold           = "0"

  dimensions = {
    TableName = aws_dynamodb_table.products.name
  }
}

  resource "aws_cloudwatch_metric_alarm" "dynamodb_throttle" {
    alarm_name          = "${var.app_name}-dynamodb-throttle-${var.environment}"
    comparison_operator = "GreaterThanThreshold"
    evaluation_periods  = "2"
    metric_name         = "UserErrors"
    namespace           = "AWS/DynamoDB"
    period              = "300"
    statistic           = "Sum"
    threshold           = "1"

    dimensions = {
      TableName = aws_dynamodb_table.products.name
    }

    alarm_actions = []  # Conectar a SNS luego
  }
