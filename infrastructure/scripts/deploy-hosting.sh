#!/bin/bash

# CloudWatch APM Documentation - Hosting Infrastructure Deployment Script

set -e

# Configuration
STACK_NAME_PREFIX="cloudwatch-apm-docs-hosting"
TEMPLATE_FILE="infrastructure/cloudformation/hosting-stack.yaml"
REGION=${AWS_REGION:-us-east-1}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment    Environment (staging|production) [default: staging]"
    echo "  -d, --domain         Custom domain name (optional)"
    echo "  -c, --certificate    ACM Certificate ARN (optional)"
    echo "  -r, --region         AWS Region [default: us-east-1]"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --environment staging"
    echo "  $0 --environment production --domain docs.example.com --certificate arn:aws:acm:..."
}

# Parse command line arguments
ENVIRONMENT="staging"
DOMAIN_NAME=""
CERTIFICATE_ARN=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -d|--domain)
            DOMAIN_NAME="$2"
            shift 2
            ;;
        -c|--certificate)
            CERTIFICATE_ARN="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    print_error "Environment must be 'staging' or 'production'"
    exit 1
fi

# Set stack name
STACK_NAME="${STACK_NAME_PREFIX}-${ENVIRONMENT}"

print_status "Deploying CloudWatch APM Documentation hosting infrastructure..."
print_status "Environment: $ENVIRONMENT"
print_status "Region: $REGION"
print_status "Stack Name: $STACK_NAME"

if [[ -n "$DOMAIN_NAME" ]]; then
    print_status "Custom Domain: $DOMAIN_NAME"
fi

if [[ -n "$CERTIFICATE_ARN" ]]; then
    print_status "Certificate ARN: $CERTIFICATE_ARN"
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

# Prepare CloudFormation parameters
PARAMETERS="ParameterKey=Environment,ParameterValue=$ENVIRONMENT"

if [[ -n "$DOMAIN_NAME" ]]; then
    PARAMETERS="$PARAMETERS ParameterKey=DomainName,ParameterValue=$DOMAIN_NAME"
fi

if [[ -n "$CERTIFICATE_ARN" ]]; then
    PARAMETERS="$PARAMETERS ParameterKey=CertificateArn,ParameterValue=$CERTIFICATE_ARN"
fi

# Check if stack exists
if aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" &> /dev/null; then
    print_status "Stack exists. Updating..."
    OPERATION="update-stack"
else
    print_status "Stack does not exist. Creating..."
    OPERATION="create-stack"
fi

# Deploy the stack
print_status "Executing CloudFormation $OPERATION..."

aws cloudformation $OPERATION \
    --stack-name "$STACK_NAME" \
    --template-body file://"$TEMPLATE_FILE" \
    --parameters $PARAMETERS \
    --capabilities CAPABILITY_IAM \
    --region "$REGION" \
    --tags Key=Project,Value=CloudWatchAPMDocs Key=Environment,Value="$ENVIRONMENT"

# Wait for stack operation to complete
print_status "Waiting for stack operation to complete..."

if [[ "$OPERATION" == "create-stack" ]]; then
    aws cloudformation wait stack-create-complete --stack-name "$STACK_NAME" --region "$REGION"
else
    aws cloudformation wait stack-update-complete --stack-name "$STACK_NAME" --region "$REGION"
fi

# Get stack outputs
print_status "Retrieving stack outputs..."

OUTPUTS=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs' \
    --output table)

print_status "Stack deployment completed successfully!"
echo ""
echo "Stack Outputs:"
echo "$OUTPUTS"

# Save outputs to file for CI/CD
OUTPUT_FILE="infrastructure/outputs/${ENVIRONMENT}-outputs.json"
mkdir -p "$(dirname "$OUTPUT_FILE")"

aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs' \
    --output json > "$OUTPUT_FILE"

print_status "Outputs saved to: $OUTPUT_FILE"

# Display next steps
echo ""
print_status "Next Steps:"
echo "1. Configure your deployment pipeline to use the S3 bucket and CloudFront distribution"
echo "2. Set up DNS records if using a custom domain"
echo "3. Configure SSL certificate if not already done"
echo "4. Test the deployment by uploading your static site files"