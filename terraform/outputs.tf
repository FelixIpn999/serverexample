output "ecr_repository_url" {
  description = "La URL del repositorio de ECR para hacer push de la imagen Docker"
  value       = aws_ecr_repository.app_repo.repository_url
}

output "ecs_cluster_name" {
  description = "El nombre del clúster de ECS"
  value       = aws_ecs_cluster.app_cluster.name
}

output "alb_dns_name" {
  description = "El nombre del ALB"
  value       = aws_lb.app_alb.dns_name
}