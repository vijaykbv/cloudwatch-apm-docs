# CloudWatch APM Documentation

This is a comprehensive documentation system for CloudWatch Application Performance Monitoring (APM) built with Next.js, TypeScript, and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── ui/             # Basic UI components
│   └── navigation/     # Navigation components
├── content/            # Documentation content
├── lib/                # Utility functions and constants
└── types/              # TypeScript type definitions
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### Code Quality

This project uses:
- ESLint for code linting
- Prettier for code formatting
- Jest and React Testing Library for testing
- TypeScript for type safety

## Deployment

The project includes deployment scripts and GitHub Actions workflows for automated CI/CD.

## Contributing

1. Follow the existing code style and conventions
2. Write tests for new functionality
3. Update documentation as needed
4. Ensure all tests pass before submitting PRs

## License

This project is licensed under the MIT License.