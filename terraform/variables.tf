variable "app_name" {
  description = "Nombre base para los recursos"
  type        = string
  default     = "inventory-api"
}

variable "environment" {
  description = "Entorno (dev, stage,prod)"
  type        = string
  default     = "dev"
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

variable "public_subnet_cidrs" {
  description = "CIDR de las subredes publicas"
  type        = list(string)
  default     = ["10.0.0.0/24", "10.0.1.0/24"]
}

variable "image_tag" {
  description = "Etiqueta de la imagen"
  type        = string
  default     = "latest"
}


