# Rol de ejecución para la Tarea de ECS (El orquestador)
resource "aws_iam_role" "ecs_execution_role" {
  name = "${var.app_name}-ecs-execution-role-${var.environment}"

  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# Política gestionada básica para que ECS pueda hacer pull de ECR y escribir logs
resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Política para permitir que el orquestador lea el secreto (Patrón 2)
resource "aws_iam_policy" "secrets_policy" {
  name        = "${var.app_name}-secretspolicy-${var.environment}"
  description = "Policy to allow ECS tasks to read secrets from Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = ["secretsmanager:GetSecretValue"]
        Effect   = "Allow"
        Resource = aws_secretsmanager_secret.db_password.arn
    }]
  })

}

resource "aws_iam_role_policy_attachment" "ecs_execution_secrets_attach" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = aws_iam_policy.secrets_policy.arn
}

# Política para permitir que ECS acceda a DynamoDB
resource "aws_iam_policy" "dynamodb_policy" {
  name        = "${var.app_name}-dynamodb-policy-${var.environment}"
  description = "Policy to allow ECS tasks to read/write to DynamoDB"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Effect   = "Allow"
        Resource = aws_dynamodb_table.products.arn
      }
    ]
  })
}

# Adjuntar la política de DynamoDB al rol de ejecución
resource "aws_iam_role_policy_attachment" "ecs_execution_dynamodb_attach" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = aws_iam_policy.dynamodb_policy.arn
}

