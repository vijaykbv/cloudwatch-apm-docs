# CloudWatch APM Documentation Content Structure

This directory contains all the documentation content organized by user journey stages and content types.

## Directory Structure

```
content/
├── getting-started/          # New user onboarding content
├── implementation/           # Integration and setup guides
├── configuration/           # Configuration reference and examples
├── troubleshooting/         # Problem-solving guides
├── examples/               # Code examples and use cases
├── api-reference/          # API and SDK documentation
├── monitoring/             # Alerting and dashboard guides
├── security/               # Security and compliance docs
├── performance/            # Scaling and optimization guides
└── templates/              # Content templates for consistency
```

## Content Format

All content files use Markdown with YAML frontmatter for metadata:

```yaml
---
title: "Page Title"
description: "Brief description for search and navigation"
audience: ["developer", "operations", "architect"]
difficulty: "beginner" | "intermediate" | "advanced"
category: "getting-started" | "implementation" | "troubleshooting" | "reference"
tags: ["cloudwatch", "apm", "monitoring"]
estimatedReadTime: 5
lastUpdated: "2024-01-15"
relatedPages: ["page-id-1", "page-id-2"]
---

# Content goes here...
```

## Getting Started

1. Create content in the appropriate directory
2. Use the templates in `templates/` for consistency
3. Follow the metadata schema for proper categorization
4. Cross-reference related content using page IDs