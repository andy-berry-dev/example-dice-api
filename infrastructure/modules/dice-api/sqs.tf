module "stats_queue" {
    source  = "terraform-aws-modules/sqs/aws"
    version = "~> 4.0"

    name = "${var.service_name}-stats-queue"

    redrive_policy = jsonencode({
        deadLetterTargetArn = module.stats_dlq.queue_arn
        maxReceiveCount     = 3
    })

    create_queue_policy = true
    queue_policy_statements = {
        sns = {
            sid     = "AllowSNSPublish"
            actions = ["sqs:SendMessage"]
            principals = [
                {
                    type        = "Service"
                    identifiers = ["sns.amazonaws.com"]
                }
            ]
            conditions = [
                {
                    test     = "ArnEquals"
                    variable = "aws:SourceArn"
                    values   = [module.sns_topic.topic_arn]
                }
            ]
        }
    }

    tags = {
        Name = "${var.service_name}-stats-queue"
    }
}

module "stats_dlq" {
    source  = "terraform-aws-modules/sqs/aws"
    version = "~> 4.0"

    name = "${var.service_name}-stats-dlq"

    tags = {
        Name = "${var.service_name}-stats-dlq"
    }
}

resource "aws_sns_topic_subscription" "stats_queue" {
    topic_arn = module.sns_topic.topic_arn
    protocol  = "sqs"
    endpoint  = module.stats_queue.queue_arn
}

# DLQ for the DynamoDB Stream processor
module "stream_dlq" {
    source  = "terraform-aws-modules/sqs/aws"
    version = "~> 4.0"

    name = "${var.service_name}-stream-dlq"

    tags = {
        Name = "${var.service_name}-stream-dlq"
    }
}
