# El clúster lógico donde vivirá nuestro servicio

resource "aws_ecs_cluster" "app_cluster" {
  name = "${var.app_name}-cluster-${var.environment}"
}

# El secreto simulado en AWS (En la vida real, lo creas manualmente o en otro módulo)
resource "aws_secretsmanager_secret" "db_password" {
  name = "${var.app_name}--db-password-${var.environment}"
}

# Definición de la "Caja Fuerte" (Task Definition)
resource "aws_ecs_task_definition" "app_task" {
  family                   = "${var.app_name}-task-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256" # 0.25 vCPU
  memory                   = "512" # 512 MB RAM

  execution_role_arn = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "${var.app_name}-container"
      image     = "${aws_ecr_repository.app_repo.repository_url}:${var.image_tag}"
      essential = true

      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]

      # Variables de entorno normales
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "3000" },
        { name = "LOG_LEVEL", value = "info" }
      ]

      # ¡La inyección del secreto desde AWS directamente a Node.js!
      secrets = [
        {
          name      = "DB_PASSWORD"
          valueFrom = aws_secretsmanager_secret.db_password.arn
        }
      ]
    }
  ])
}

# El Servicio que mantiene la tarea corriendo
resource "aws_ecs_service" "app_service" {
  name            = "${var.app_name}-service-${var.environment}"
  cluster         = aws_ecs_cluster.app_cluster.id
  task_definition = aws_ecs_task_definition.app_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  load_balancer {
    target_group_arn = aws_lb_target_group.app_tg.arn
    container_name   = "${var.app_name}-container"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.http]

  network_configuration {
    subnets          = [aws_subnet.public_a.id, aws_subnet.public_b.id]
    security_groups  = [aws_security_group.fargate_sg.id]
    assign_public_ip = false
  }
}


