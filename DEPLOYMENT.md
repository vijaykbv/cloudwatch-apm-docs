# CloudWatch APM Documentation - Deployment Guide

This document describes the automated deployment pipeline and rollback capabilities for the CloudWatch APM documentation system.

## Overview

The deployment pipeline is built using GitHub Actions and provides:

- **Automated deployment** from Git repository
- **Preview deployments** for pull requests
- **Content validation** and link checking in CI/CD
- **Rollback capabilities** for quick fixes
- **Multi-environment support** (staging and production)

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│  GitHub Actions │───▶│   AWS S3 +      │
│                 │    │                 │    │   CloudFront    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Validation    │
                       │   - Links       │
                       │   - Content     │
                       │   - Tests       │
                       └─────────────────┘
```

## Environments

### Staging Environment
- **URL**: https://staging-docs.cloudwatch-apm.aws.amazon.com
- **Trigger**: Push to `staging` branch or Pull Requests
- **Purpose**: Testing and preview deployments

### Production Environment
- **URL**: https://docs.cloudwatch-apm.aws.amazon.com
- **Trigger**: Push to `main` branch
- **Purpose**: Live documentation site

## Deployment Workflow

### 1. Content Validation
Every deployment runs comprehensive validation:

```bash
# Markdown syntax validation
npm run validate:markdown

# Internal link checking
npm run validate:links

# Content structure validation
npm run validate:content-structure

# Accessibility validation
npm run validate:accessibility

# Code example validation
npm run validate:code-examples
```

### 2. Build Process
- **Environment-specific builds** with proper configuration
- **Static asset optimization** with long-term caching
- **Build artifact storage** for rollback capability

### 3. Deployment Process
- **S3 versioning enabled** for rollback support
- **Metadata tagging** for deployment tracking
- **CloudFront invalidation** for immediate updates
- **Comprehensive smoke tests** post-deployment

### 4. Verification
- **Endpoint testing** for all critical pages
- **Static asset validation**
- **Content accessibility checks**
- **Performance monitoring**

## Rollback Capabilities

### Automatic Rollback
If a deployment fails, the system automatically:
1. Identifies the previous successful deployment
2. Restores files from S3 versioning
3. Invalidates CloudFront cache
4. Verifies rollback success
5. Notifies stakeholders

### Manual Rollback
Use the rollback script for manual rollbacks:

```bash
# Rollback staging to previous version
npm run rollback:staging

# Rollback production to previous version
npm run rollback:production

# Rollback to specific version
node scripts/rollback.js production --version <version-id>

# List available deployments
node scripts/rollback.js production --list
```

### Rollback Script Features
- **Version history tracking** via S3 object versions
- **Deployment metadata** (commit, build number, timestamp)
- **Backup creation** before rollback
- **Verification testing** after rollback
- **Notification system** for rollback events

## Preview Deployments

### Pull Request Previews
Every pull request automatically gets a preview deployment:
- **Staging environment** deployment
- **Comment on PR** with preview URL
- **Validation results** in PR comments
- **Rollback information** for quick fixes

### Preview Features
- Full staging environment deployment
- All validation checks
- Performance testing
- Accessibility validation
- Link checking

## Configuration

### Required Secrets
Set these secrets in GitHub repository settings:

#### Staging Environment
- `AWS_ACCESS_KEY_ID_STAGING`
- `AWS_SECRET_ACCESS_KEY_STAGING`
- `S3_BUCKET_STAGING`
- `CLOUDFRONT_DISTRIBUTION_ID_STAGING`
- `COGNITO_USER_POOL_ID_STAGING`
- `COGNITO_USER_POOL_CLIENT_ID_STAGING`
- `COGNITO_IDENTITY_POOL_ID_STAGING`
- `COGNITO_DOMAIN_STAGING`

#### Production Environment
- `AWS_ACCESS_KEY_ID_PRODUCTION`
- `AWS_SECRET_ACCESS_KEY_PRODUCTION`
- `S3_BUCKET_PRODUCTION`
- `CLOUDFRONT_DISTRIBUTION_ID_PRODUCTION`
- `COGNITO_USER_POOL_ID_PRODUCTION`
- `COGNITO_USER_POOL_CLIENT_ID_PRODUCTION`
- `COGNITO_IDENTITY_POOL_ID_PRODUCTION`
- `COGNITO_DOMAIN_PRODUCTION`

### Environment Variables
Configure these in your deployment environment:

```bash
# AWS Configuration
AWS_REGION=us-east-1

# Application Configuration
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_API_URL=https://api.cloudwatch-apm-docs.aws.amazon.com

# Rollback Configuration
WAIT_FOR_INVALIDATION=true  # Wait for CloudFront invalidation
```

## Monitoring and Alerts

### Deployment Monitoring
- **Build status** tracking in GitHub Actions
- **Deployment success/failure** notifications
- **Performance metrics** collection
- **Error tracking** and alerting

### Health Checks
Continuous monitoring includes:
- **Endpoint availability** testing
- **Response time** monitoring
- **Content integrity** validation
- **SSL certificate** monitoring

### Alert Channels
Configure alerts for:
- Deployment failures
- Rollback events
- Performance degradation
- Security issues

## Troubleshooting

### Common Issues

#### Deployment Failures
1. **Check build logs** in GitHub Actions
2. **Verify AWS credentials** and permissions
3. **Check S3 bucket** configuration
4. **Validate CloudFront** distribution settings

#### Rollback Issues
1. **Verify S3 versioning** is enabled
2. **Check deployment history** availability
3. **Validate AWS permissions** for rollback operations
4. **Review CloudFront** invalidation status

#### Content Validation Failures
1. **Review validation logs** for specific errors
2. **Check markdown syntax** and structure
3. **Validate internal links** and references
4. **Test accessibility** compliance

### Emergency Procedures

#### Emergency Rollback
For critical production issues:

```bash
# Immediate rollback to previous version
node scripts/rollback.js production --force

# Rollback to specific known-good version
node scripts/rollback.js production --version <version-id> --force
```

#### Manual Deployment
If automated deployment fails:

```bash
# Build locally
npm run build

# Deploy to staging
npm run deploy:staging

# Deploy to production (after testing)
npm run deploy:production
```

## Performance Optimization

### Caching Strategy
- **Static assets**: 1 year cache (immutable)
- **HTML pages**: No cache (immediate updates)
- **API responses**: 24 hours cache
- **Images**: 24 hours cache

### CDN Configuration
- **Global distribution** via CloudFront
- **Compression** enabled for all text content
- **HTTP/2** support for improved performance
- **Security headers** for enhanced security

## Security Considerations

### Access Control
- **IAM roles** with minimal required permissions
- **Environment separation** between staging and production
- **Secrets management** via GitHub Secrets
- **Audit logging** for all deployment activities

### Content Security
- **Input validation** for all content
- **XSS protection** via Content Security Policy
- **HTTPS enforcement** for all connections
- **Regular security** updates and patches

## Maintenance

### Regular Tasks
- **Review deployment logs** weekly
- **Update dependencies** monthly
- **Test rollback procedures** quarterly
- **Review security settings** quarterly

### Backup Strategy
- **S3 versioning** for automatic backups
- **Cross-region replication** for disaster recovery
- **Deployment history** retention (90 days)
- **Configuration backups** in version control

## Support

### Getting Help
- **GitHub Issues** for bug reports and feature requests
- **Documentation** in this repository
- **AWS Support** for infrastructure issues
- **Team contacts** for urgent issues

### Escalation Path
1. **Developer** - Initial troubleshooting
2. **Team Lead** - Complex issues and decisions
3. **DevOps Team** - Infrastructure and deployment issues
4. **AWS Support** - Platform-specific problems

---

For more information, see:
- [GitHub Actions Workflows](.github/workflows/)
- [Deployment Scripts](scripts/)
- [Infrastructure Configuration](infrastructure/)