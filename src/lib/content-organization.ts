import { DocumentationPage, UserAudience, UserJourney, ContentCategory } from '@/types';

export interface JourneyStageConfig {
  id: string;
  name: string;
  description: string;
  order: number;
  categories: ContentCategory[];
  audienceWeights: Record<string, number>;
}

export interface ContentFilter {
  audience?: UserAudience;
  difficulty?: string;
  category?: ContentCategory;
  tags?: string[];
}

export interface OrganizedContent {
  journeyStages: JourneyStageContent[];
  audienceSpecificContent: Record<string, DocumentationPage[]>;
  progressiveDisclosure: ProgressiveContent[];
}

export interface JourneyStageContent {
  stage: JourneyStageConfig;
  content: DocumentationPage[];
  estimatedDuration: number;
  completionCriteria: string[];
}

export interface ProgressiveContent {
  level: 'basic' | 'intermediate' | 'advanced';
  content: DocumentationPage[];
  prerequisites: string[];
}

// Journey stage configurations
export const JOURNEY_STAGES: JourneyStageConfig[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Initial setup and basic configuration',
    order: 1,
    categories: ['getting-started'],
    audienceWeights: {
      'developer': 1.0,
      'operations': 1.0,
      'architect': 0.8,
      'security': 0.6
    }
  },
  {
    id: 'implementation',
    name: 'Implementation',
    description: 'Core implementation and integration',
    order: 2,
    categories: ['implementation', 'configuration', 'examples'],
    audienceWeights: {
      'developer': 1.0,
      'operations': 0.9,
      'architect': 0.8,
      'security': 0.7
    }
  },
  {
    id: 'optimization',
    name: 'Optimization',
    description: 'Performance tuning and advanced configuration',
    order: 3,
    categories: ['performance', 'monitoring'],
    audienceWeights: {
      'developer': 0.8,
      'operations': 1.0,
      'architect': 1.0,
      'security': 0.6
    }
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Problem resolution and maintenance',
    order: 4,
    categories: ['troubleshooting'],
    audienceWeights: {
      'developer': 0.9,
      'operations': 1.0,
      'architect': 0.7,
      'security': 0.8
    }
  },
  {
    id: 'advanced',
    name: 'Advanced Topics',
    description: 'Security, compliance, and enterprise features',
    order: 5,
    categories: ['security', 'api-reference'],
    audienceWeights: {
      'developer': 0.7,
      'operations': 0.8,
      'architect': 1.0,
      'security': 1.0
    }
  }
];

export class ContentOrganizer {
  private journeyStages: JourneyStageConfig[];

  constructor(stages: JourneyStageConfig[] = JOURNEY_STAGES) {
    this.journeyStages = stages.sort((a, b) => a.order - b.order);
  }

  /**
   * Organize content by journey stages
   */
  organizeByJourneyStages(pages: DocumentationPage[]): JourneyStageContent[] {
    return this.journeyStages.map(stage => {
      const stageContent = pages.filter(page => 
        stage.categories.includes(page.category)
      );

      const estimatedDuration = stageContent.reduce(
        (total, page) => total + page.estimatedReadTime, 
        0
      );

      return {
        stage,
        content: this.sortContentByRelevance(stageContent, stage),
        estimatedDuration,
        completionCriteria: this.generateCompletionCriteria(stage, stageContent)
      };
    });
  }

  /**
   * Filter content by audience
   */
  filterByAudience(pages: DocumentationPage[], targetAudience: UserAudience): DocumentationPage[] {
    return pages
      .filter(page => 
        page.audience.some(audience => 
          audience.type === targetAudience.type &&
          this.isExperienceLevelAppropriate(audience.experience, targetAudience.experience)
        )
      )
      .sort((a, b) => this.calculateAudienceRelevance(b, targetAudience) - 
                      this.calculateAudienceRelevance(a, targetAudience));
  }

  /**
   * Create progressive disclosure of content complexity
   */
  createProgressiveDisclosure(pages: DocumentationPage[]): ProgressiveContent[] {
    const levels: Array<'basic' | 'intermediate' | 'advanced'> = ['basic', 'intermediate', 'advanced'];
    
    return levels.map(level => {
      const levelContent = pages.filter(page => {
        switch (level) {
          case 'basic':
            return page.difficulty === 'beginner';
          case 'intermediate':
            return page.difficulty === 'intermediate';
          case 'advanced':
            return page.difficulty === 'advanced';
          default:
            return false;
        }
      });

      return {
        level,
        content: levelContent,
        prerequisites: this.generatePrerequisites(level, levelContent)
      };
    });
  }

  /**
   * Apply content filters
   */
  applyFilters(pages: DocumentationPage[], filters: ContentFilter): DocumentationPage[] {
    let filteredPages = [...pages];

    if (filters.audience) {
      filteredPages = this.filterByAudience(filteredPages, filters.audience);
    }

    if (filters.difficulty) {
      filteredPages = filteredPages.filter(page => page.difficulty === filters.difficulty);
    }

    if (filters.category) {
      filteredPages = filteredPages.filter(page => page.category === filters.category);
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredPages = filteredPages.filter(page =>
        filters.tags!.some(tag => page.tags.includes(tag))
      );
    }

    return filteredPages;
  }

  /**
   * Generate audience-specific content organization
   */
  organizeByAudience(pages: DocumentationPage[]): Record<string, DocumentationPage[]> {
    const audienceTypes = ['developer', 'operations', 'architect', 'security'];
    const result: Record<string, DocumentationPage[]> = {};

    audienceTypes.forEach(audienceType => {
      const audienceContent = pages.filter(page =>
        page.audience.some(audience => audience.type === audienceType)
      );

      result[audienceType] = audienceContent.sort((a, b) => {
        const aRelevance = this.calculateAudienceRelevance(a, { type: audienceType as any, experience: 'intermediate' });
        const bRelevance = this.calculateAudienceRelevance(b, { type: audienceType as any, experience: 'intermediate' });
        return bRelevance - aRelevance;
      });
    });

    return result;
  }

  /**
   * Get recommended content based on current page
   */
  getRecommendedContent(currentPage: DocumentationPage, allPages: DocumentationPage[], limit: number = 5): DocumentationPage[] {
    const recommendations = allPages
      .filter(page => page.id !== currentPage.id)
      .map(page => ({
        page,
        score: this.calculateRecommendationScore(currentPage, page)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.page);

    return recommendations;
  }

  private sortContentByRelevance(content: DocumentationPage[], stage: JourneyStageConfig): DocumentationPage[] {
    return content.sort((a, b) => {
      // Sort by difficulty (beginner first for early stages)
      const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
      const aDifficulty = difficultyOrder[a.difficulty];
      const bDifficulty = difficultyOrder[b.difficulty];
      
      if (stage.order <= 2) {
        // Early stages: prefer beginner content
        return aDifficulty - bDifficulty;
      } else {
        // Later stages: prefer advanced content
        return bDifficulty - aDifficulty;
      }
    });
  }

  private generateCompletionCriteria(stage: JourneyStageConfig, content: DocumentationPage[]): string[] {
    const criteria: string[] = [];
    
    switch (stage.id) {
      case 'getting-started':
        criteria.push('Complete initial setup and configuration');
        criteria.push('Verify CloudWatch APM is collecting data');
        break;
      case 'implementation':
        criteria.push('Integrate APM with your application');
        criteria.push('Configure custom metrics and traces');
        break;
      case 'optimization':
        criteria.push('Optimize performance monitoring setup');
        criteria.push('Configure alerting and dashboards');
        break;
      case 'troubleshooting':
        criteria.push('Understand common issues and solutions');
        criteria.push('Know escalation procedures');
        break;
      case 'advanced':
        criteria.push('Implement security best practices');
        criteria.push('Configure enterprise features');
        break;
    }

    return criteria;
  }

  private isExperienceLevelAppropriate(contentLevel: string, userLevel: string): boolean {
    const levels = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
    const contentLevelNum = levels[contentLevel as keyof typeof levels];
    const userLevelNum = levels[userLevel as keyof typeof levels];
    
    // Content should be at or slightly above user level
    return contentLevelNum <= userLevelNum + 1;
  }

  private calculateAudienceRelevance(page: DocumentationPage, targetAudience: UserAudience): number {
    let score = 0;

    // Check if page targets this audience type
    const matchingAudience = page.audience.find(audience => audience.type === targetAudience.type);
    if (matchingAudience) {
      score += 10;
      
      // Bonus for matching experience level
      if (matchingAudience.experience === targetAudience.experience) {
        score += 5;
      }
    }

    // Check category relevance for audience
    const stage = this.journeyStages.find(s => s.categories.includes(page.category));
    if (stage) {
      const audienceWeight = stage.audienceWeights[targetAudience.type] || 0.5;
      score += audienceWeight * 5;
    }

    return score;
  }

  private generatePrerequisites(level: 'basic' | 'intermediate' | 'advanced', content: DocumentationPage[]): string[] {
    const prerequisites: string[] = [];

    switch (level) {
      case 'basic':
        prerequisites.push('Basic understanding of application monitoring concepts');
        break;
      case 'intermediate':
        prerequisites.push('Completed basic setup and configuration');
        prerequisites.push('Familiarity with CloudWatch APM interface');
        break;
      case 'advanced':
        prerequisites.push('Experience with intermediate CloudWatch APM features');
        prerequisites.push('Understanding of enterprise monitoring requirements');
        break;
    }

    return prerequisites;
  }

  private calculateRecommendationScore(currentPage: DocumentationPage, candidatePage: DocumentationPage): number {
    let score = 0;

    // Same category bonus
    if (currentPage.category === candidatePage.category) {
      score += 5;
    }

    // Related pages bonus
    if (currentPage.relatedPages.includes(candidatePage.id)) {
      score += 10;
    }

    // Tag overlap bonus
    const commonTags = currentPage.tags.filter(tag => candidatePage.tags.includes(tag));
    score += commonTags.length * 2;

    // Audience overlap bonus
    const audienceOverlap = currentPage.audience.filter(audience =>
      candidatePage.audience.some(candAudience => 
        candAudience.type === audience.type && candAudience.experience === audience.experience
      )
    );
    score += audienceOverlap.length * 3;

    // Difficulty progression bonus (prefer next level up)
    const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
    const currentDifficulty = difficultyOrder[currentPage.difficulty];
    const candidateDifficulty = difficultyOrder[candidatePage.difficulty];
    
    if (candidateDifficulty === currentDifficulty + 1) {
      score += 3;
    } else if (candidateDifficulty === currentDifficulty) {
      score += 1;
    }

    return score;
  }
}