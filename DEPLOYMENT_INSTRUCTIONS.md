# CloudWatch APM Documentation - Deployment Instructions

## Quick Deployment Options

### Option 1: AWS Amplify (Recommended)
AWS Amplify provides seamless integration with your existing AWS infrastructure and automatic CI/CD.

#### Prerequisites
- AWS CLI configured with appropriate permissions
- GitHub repository: https://github.com/vijaykbv/cloudwatch-apm-docs.git

#### Steps
1. **Install AWS Amplify CLI**
   ```bash
   npm install -g @aws-amplify/cli
   ```

2. **Initialize Amplify**
   ```bash
   amplify init
   ```
   - Project name: `cloudwatch-apm-docs`
   - Environment: `production`
   - Default editor: Your preferred editor
   - App type: `javascript`
   - Framework: `react`
   - Source directory: `src`
   - Build directory: `.next`
   - Build command: `npm run build`
   - Start command: `npm run start`

3. **Add Hosting**
   ```bash
   amplify add hosting
   ```
   - Select: `Amazon CloudFront and S3`
   - Hosting bucket name: Accept default or customize

4. **Deploy**
   ```bash
   amplify publish
   ```

5. **Connect to GitHub (Optional for CI/CD)**
   - Go to AWS Amplify Console
   - Connect your GitHub repository
   - Configure automatic deployments

### Option 2: Vercel (Fastest)
Vercel offers the quickest deployment with excellent Next.js optimization.

#### Steps
1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```
   - Follow the prompts to connect your GitHub repository
   - Vercel will automatically detect Next.js and configure build settings

3. **Custom Domain (Optional)**
   ```bash
   vercel domains add your-domain.com
   ```

### Option 3: Netlify
Great for static sites with excellent performance optimization.

#### Steps
1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**
   ```bash
   npm run build
   npm run export
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=out
   ```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# AWS Cognito Configuration (for authentication)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=your_client_id
NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=your_identity_pool_id
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_COGNITO_DOMAIN=your_cognito_domain

# Analytics (optional)
NEXT_PUBLIC_GA_TRACKING_ID=your_ga_id
```

## Build Verification

Before deployment, ensure the build is successful:

```bash
npm run build
npm run start
```

Visit `http://localhost:3000` to verify everything works correctly.

## Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test search functionality
- [ ] Check cost optimization calculator
- [ ] Verify navigation works
- [ ] Test responsive design on mobile
- [ ] Confirm all links work
- [ ] Test authentication flow (if configured)

## Performance Optimization

The application includes several performance optimizations:
- Static site generation for fast loading
- Image optimization
- Code splitting
- Lazy loading of components
- Optimized bundle sizes

## Monitoring and Analytics

Consider setting up:
- Google Analytics for usage tracking
- AWS CloudWatch for performance monitoring
- Error tracking with Sentry or similar service

## Custom Domain Setup

### AWS Amplify
1. Go to Amplify Console → Domain Management
2. Add your custom domain
3. Configure DNS records as instructed

### Vercel
```bash
vercel domains add your-domain.com
vercel alias set your-deployment-url.vercel.app your-domain.com
```

### Netlify
1. Go to Netlify Dashboard → Domain Settings
2. Add custom domain
3. Configure DNS records

## Troubleshooting

### Build Issues
- Ensure all dependencies are installed: `npm install`
- Clear cache: `rm -rf .next node_modules && npm install`
- Check Node.js version compatibility (Node 18+ recommended)

### Deployment Issues
- Verify environment variables are set correctly
- Check build logs for specific errors
- Ensure all required files are committed to Git

### Performance Issues
- Enable compression in your hosting platform
- Configure CDN settings
- Optimize images and assets

## Security Considerations

- All sensitive configuration is handled via environment variables
- Authentication is configured for AWS SSO integration
- HTTPS is enforced on all platforms
- Content Security Policy headers are configured

## Support

For deployment issues:
1. Check the platform-specific documentation
2. Review build logs for errors
3. Contact the team via the GitHub repository issues

---

**Estimated Deployment Time:** 5-15 minutes depending on platform choice
**Recommended Platform:** AWS Amplify for AWS integration, Vercel for simplicity