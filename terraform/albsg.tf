resource "aws_lb" "app_alb" {
  name               = "${var.app_name}-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]

  tags = {
    Name = "${var.app_name}-alb-${var.environment}"
  }
}

resource "aws_lb_target_group" "app_tg" {
  name        = "${var.app_name}-tg-${var.environment}"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.app_vpc.id
  target_type = "ip"
  health_check {
    path                = "/health"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
  tags = {
    Name = "${var.app_name}-tg-${var.environment}"
  }
}


resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app_alb.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }
  tags = {
    Name = "${var.app_name}-http-${var.environment}"
  }
}


resource "aws_security_group" "alb_sg" {
  name   = "${var.app_name}-alb-sg-${var.environment}"
  vpc_id = aws_vpc.app_vpc.id

  ingress {
    description = "Allow http from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "Allow http from ALB"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all out going traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "fargate_sg" {
  name   = "${var.app_name}-fargate-sg-${var.environment}"
  vpc_id = aws_vpc.app_vpc.id

  ingress {
    description     = "Allow http from ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    description = "Allow all out going traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}