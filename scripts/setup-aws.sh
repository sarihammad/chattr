#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env

# Create DynamoDB tables
echo "Creating DynamoDB tables..."
aws dynamodb create-table \
  --table-name $DYNAMODB_MESSAGES_TABLE \
  --attribute-definitions \
    AttributeName=messageId,AttributeType=S \
    AttributeName=roomId,AttributeType=S \
    AttributeName=timestamp,AttributeType=N \
  --key-schema \
    AttributeName=messageId,KeyType=HASH \
  --global-secondary-indexes \
    "[
      {
        \"IndexName\": \"RoomIndex\",
        \"KeySchema\": [
          {\"AttributeName\":\"roomId\",\"KeyType\":\"HASH\"},
          {\"AttributeName\":\"timestamp\",\"KeyType\":\"RANGE\"}
        ],
        \"Projection\": {\"ProjectionType\":\"ALL\"},
        \"ProvisionedThroughput\": {
          \"ReadCapacityUnits\": 5,
          \"WriteCapacityUnits\": 5
        }
      }
    ]" \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

aws dynamodb create-table \
  --table-name $DYNAMODB_ROOMS_TABLE \
  --attribute-definitions \
    AttributeName=roomId,AttributeType=S \
  --key-schema \
    AttributeName=roomId,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

# Create ECR repository
echo "Creating ECR repository..."
aws ecr create-repository --repository-name chattr

# Create ECS cluster
echo "Creating ECS cluster..."
aws ecs create-cluster --cluster-name $ECS_CLUSTER_NAME

# Create Lambda functions
echo "Creating Lambda functions..."
# Message processor
aws lambda create-function \
  --function-name message-processor \
  --runtime nodejs18.x \
  --handler messageProcessor.handler \
  --role $LAMBDA_EXECUTION_ROLE \
  --code S3Bucket=$LAMBDA_CODE_BUCKET,S3Key=message-processor.zip

# Matchmaker
aws lambda create-function \
  --function-name matchmaker \
  --runtime nodejs18.x \
  --handler matchmaker.handler \
  --role $LAMBDA_EXECUTION_ROLE \
  --code S3Bucket=$LAMBDA_CODE_BUCKET,S3Key=matchmaker.zip

# Create Application Load Balancer
echo "Creating Application Load Balancer..."
aws elbv2 create-load-balancer \
  --name chattr-alb \
  --subnets $SUBNET_IDS \
  --security-groups $SECURITY_GROUP_IDS

# Create target group
aws elbv2 create-target-group \
  --name chattr-tg \
  --protocol HTTP \
  --port 80 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --health-check-path /api/health

# Create ECS task definition
echo "Creating ECS task definition..."
aws ecs register-task-definition \
  --cli-input-json file://deployment/task-definition.json

# Create ECS service
echo "Creating ECS service..."
aws ecs create-service \
  --cluster $ECS_CLUSTER_NAME \
  --service-name $ECS_SERVICE_NAME \
  --task-definition $ECS_TASK_DEFINITION \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_IDS],securityGroups=[$SECURITY_GROUP_IDS],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$TARGET_GROUP_ARN,containerName=chattr-app,containerPort=3000"

# Create auto scaling
echo "Setting up auto scaling..."
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/$ECS_CLUSTER_NAME/$ECS_SERVICE_NAME \
  --min-capacity $MIN_CAPACITY \
  --max-capacity $MAX_CAPACITY

aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/$ECS_CLUSTER_NAME/$ECS_SERVICE_NAME \
  --policy-name cpu-tracking \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration "{ \
    \"TargetValue\": $TARGET_CPU_UTILIZATION, \
    \"PredefinedMetricSpecification\": { \
      \"PredefinedMetricType\": \"ECSServiceAverageCPUUtilization\" \
    } \
  }"

echo "AWS resources setup complete!" 