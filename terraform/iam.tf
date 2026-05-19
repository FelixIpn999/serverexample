# Rol de ejecución para la Tarea de ECS (El orquestador)
locals {
  github_sub = "repo:${var.github_org}/${var.github_repo}:environment:${var.environment}"
}

############################################
# 1) RUNTIME ROLES (ECS)
############################################

# Rol de ejecución de ECS (pull ECR, logs, inyección de secretos)
resource "aws_iam_role" "ecs_execution_role" {
  name = "${var.app_name}-ecs-execution-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Permite a ECS leer el secreto usado en TaskDefinition.secrets
resource "aws_iam_policy" "secrets_policy" {
  name        = "${var.app_name}-secrets-policy-${var.environment}"
  description = "Allow ECS execution role to read Secrets Manager secret"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
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

# Rol runtime de la app (Node.js dentro del contenedor)
resource "aws_iam_role" "ecs_task_role" {
  name = "${var.app_name}-ecs-task-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_policy" "dynamodb_policy" {
  name        = "${var.app_name}-dynamodb-policy-${var.environment}"
  description = "Allow app runtime to read/write DynamoDB table"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
      ]
      Effect   = "Allow"
      Resource = aws_dynamodb_table.products.arn
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_dynamodb_attach" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.dynamodb_policy.arn
}

############################################
# 2) OIDC PROVIDER (GitHub Actions)
############################################

# Si ya existe en tu cuenta, no lo dupliques; impórtalo al estado de Terraform.
#resource "aws_iam_openid_connect_provider" "github" {
# url             = "https://token.actions.githubusercontent.com"
#client_id_list  = ["sts.amazonaws.com"]
#thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
#}
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}
############################################
# 3) CI/CD ROLES (GitHub Actions)
############################################

resource "aws_iam_role" "github_actions_app_role" {
  name = "github-actions-app-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid    = "GitHubActionsAssumeRoleApp"
      Effect = "Allow"
      Principal = {
        Federated = data.aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:sub" = local.github_sub
        }
        StringLike = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })
}

resource "aws_iam_role" "github_actions_infra_role" {
  name = "github-actions-infra-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid    = "GitHubActionsAssumeRoleInfra"
      Effect = "Allow"
      Principal = {
        Federated = data.aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:sub" = local.github_sub
        }
        StringLike = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })
}

############################################
# 4) CI/CD POLICIES
############################################

# Rol de APP: push ECR + passrole restringido a roles ECS
resource "aws_iam_policy" "github_actions_app_policy" {
  name        = "${var.app_name}-gha-app-policy-${var.environment}"
  description = "Permissions for app pipeline in GitHub Actions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "EcrAuth"
        Effect   = "Allow"
        Action   = ["ecr:GetAuthorizationToken"]
        Resource = "*"
      },
      {
        Sid    = "EcrPushPullRepo"
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage",
          "ecr:BatchGetImage",
          "ecr:DescribeRepositories"
        ]
        Resource = aws_ecr_repository.app_repo.arn
      },
      {
        Sid    = "EcsDeployActions"
        Effect = "Allow"
        Action = [
          "ecs:DescribeTaskDefinition",
          "ecs:RegisterTaskDefinition",
          "ecs:DescribeServices",
          "ecs:UpdateService",
          "ecs:ListTaskDefinitions"
        ]
        Resource = "*"
      },
      {
        Sid    = "AlbDescribeForSmoke"
        Effect = "Allow"
        Action = [
          "elasticloadbalancing:DescribeLoadBalancers",
          "elasticloadbalancing:DescribeTargetGroups",
          "elasticloadbalancing:DescribeTargetHealth"
        ]
        Resource = "*"
      },
      {
        Sid    = "PassOnlyEcsRoles"
        Effect = "Allow"
        Action = ["iam:PassRole"]
        Resource = [
          aws_iam_role.ecs_execution_role.arn,
          aws_iam_role.ecs_task_role.arn
        ]
        Condition = {
          StringEquals = {
            "iam:PassedToService" = "ecs-tasks.amazonaws.com"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "github_actions_app_attach" {
  role       = aws_iam_role.github_actions_app_role.name
  policy_arn = aws_iam_policy.github_actions_app_policy.arn
}

resource "aws_iam_policy" "github_actions_infra_policy" {
  name        = "${var.app_name}-gha-infra-policy-${var.environment}"
  description = "Permissions for terraform pipeline in GitHub Actions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "TerraformStateBackend"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::${var.terraform_bucket}",
          "arn:aws:s3:::${var.terraform_bucket}/*"
        ]
      },
      {
        Sid    = "DynamoDbStateBackend"
        Effect = "Allow"
        Action = [
          "dynamodb:DescribeTable",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem"
        ]
        Resource = "arn:aws:dynamodb:${var.aws_region}:*:table/${var.terraform_lock_table}"
      },
      {
        Sid    = "NetworkResources"
        Effect = "Allow"
        Action = [
          "ec2:CreateVpc",
          "ec2:DescribeVpcs",
          "ec2:DescribeSubnets",
          "ec2:DescribeSecurityGroups",
          "ec2:CreateSecurityGroup",
          "ec2:AuthorizeSecurityGroupIngress",
          "ec2:AuthorizeSecurityGroupEgress",
          "ec2:ModifySecurityGroupRules",
          "ec2:CreateInternetGateway",
          "ec2:AttachInternetGateway",
          "ec2:CreateRouteTable",
          "ec2:CreateRoute",
          "ec2:AssociateRouteTable",
          "ec2:AllocateAddress",
          "ec2:CreateNatGateway",
          "ec2:CreateSubnet"
        ]
        Resource = "*"
      },
      {
        Sid    = "EcsResources"
        Effect = "Allow"
        Action = [
          "ecs:CreateCluster",
          "ecs:DescribeCluster",
          "ecs:CreateService",
          "ecs:UpdateService",
          "ecs:RegisterTaskDefinition",
          "ecs:DescribeTaskDefinition",
          "ecs:ListTaskDefinitions",
          "ecs:DescribeServices"
        ]
        Resource = "*"
      },
      {
        Sid    = "EcrResources"
        Effect = "Allow"
        Action = [
          "ecr:CreateRepository",
          "ecr:DescribeRepositories",
          "ecr:DescribeImages",
          "ecr:GetImageScanningConfiguration"
        ]
        Resource = "arn:aws:ecr:${var.aws_region}:*:repository/${var.app_name}-*"
      },
      {
        Sid    = "IamResources"
        Effect = "Allow"
        Action = [
          "iam:CreateRole",
          "iam:GetRole",
          "iam:PassRole",
          "iam:CreatePolicy",
          "iam:AttachRolePolicy",
          "iam:PutRolePolicy",
          "iam:GetRolePolicy"
        ]
        Resource = [
          "arn:aws:iam::*:role/${var.app_name}-*",
          "arn:aws:iam::*:policy/${var.app_name}-*"
        ]
      },
      {
        Sid    = "ALBResources"
        Effect = "Allow"
        Action = [
          "elasticloadbalancing:CreateLoadBalancer",
          "elasticloadbalancing:DescribeLoadBalancers",
          "elasticloadbalancing:CreateTargetGroup",
          "elasticloadbalancing:CreateListener",
          "elasticloadbalancing:DescribeTargetGroups",
          "elasticloadbalancing:DescribeListeners"
        ]
        Resource = "arn:aws:elasticloadbalancing:${var.aws_region}:*:*"
      },
      {
        Sid    = "DynamoDbTableResources"
        Effect = "Allow"
        Action = [
          "dynamodb:CreateTable",
          "dynamodb:DescribeTable",
          "dynamodb:UpdateTable",
          "dynamodb:ListTables"
        ]
        Resource = "arn:aws:dynamodb:${var.aws_region}:*:table/${var.app_name}-*"
      },
      {
        Sid    = "SecretsManagerResources"
        Effect = "Allow"
        Action = [
          "secretsmanager:CreateSecret",
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "arn:aws:secretsmanager:${var.aws_region}:*:secret:${var.app_name}-*"
      },
      {
        Sid    = "CloudWatchLogsResources"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:DescribeLogGroups"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:*:*"
      },
      {
        Sid    = "CloudWatchAlarms"
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricAlarm",
          "cloudwatch:DeleteAlarms",
          "cloudwatch:DescribeAlarms"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "github_actions_infra_attach" {
  role       = aws_iam_role.github_actions_infra_role.name
  policy_arn = aws_iam_policy.github_actions_infra_policy.arn
}

