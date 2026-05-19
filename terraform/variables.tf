variable "app_name" {
  description = "Nombre base para los recursos"
  type        = string
  default     = "inventory-api"
}

variable "environment" {
  description = "Entorno (dev, stage,prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "stage", "prod"], var.environment)
    error_message = "El entorno debe ser 'dev', 'stage' o 'prod'"
  }
}

variable "aws_region" {
  description = "Región de AWS"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR de la VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_password_secret" {
  description = "Base de datos password secret"
  type        = string
  sensitive   = true
  # En PoC dev, puede ser hardcoded; en prod, fetch de externa
}

variable "public_subnet_cidrs" {
  description = "CIDR de las subredes publicas"
  type        = list(string)
  default     = ["10.0.0.0/24", "10.0.1.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR de las subredes privadas"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "image_tag" {
  description = "Etiqueta de la imagen"
  type        = string
}

variable "min_capacity" {
  description = "Cantidad minima de instancias"
  type        = number
  default     = 1
}

variable "github_org" {
  description = "Owner u organización de GitHub"
  type        = string
}

variable "github_repo" {
  description = "Nombre del repositorio"
  type        = string
}


#variable "acm_certificate_arn" {
#  description = "ARN del certificado ACM"
 # type        = string
#}

variable "terraform_lock_table"{
  description = "Nombre de la tabla DynamoDB para el bloqueo de estado de Terraform"
  type        = string
  default     = "TF_STATE_LOCK_TABLE"

}

variable "terraform_bucket"{
  description = "Nombre del bucket de Terraform"
  type        = string
  default     = "serverexamplenode-tfstated-dev-257746103804-us-east-1-an"

}


