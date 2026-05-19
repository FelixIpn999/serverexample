terraform {
  backend "s3" {
    bucket = "serverexamplenode-tfstated-dev-257746103804-us-east-1-an"
    key = "state/dev/terraform.tfstate"
    region = "us-east-1"
    dynamodb_table = "TF_STATE_LOCK_TABLE"
    encrypt = true
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}


