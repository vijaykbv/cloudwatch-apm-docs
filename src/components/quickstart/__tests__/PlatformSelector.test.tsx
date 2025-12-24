import { render, screen, fireEvent } from '@testing-library/react'
import PlatformSelector from '../PlatformSelector'
import { Platform } from '../../../types/quickstart'

const mockPlatforms: Platform[] = [
  {
    id: 'java',
    name: 'Java',
    description: 'Java applications with Spring Boot, Tomcat, or standalone',
    icon: '☕',
    category: 'language',
    prerequisites: ['Java 8 or higher', 'Maven or Gradle'],
    installationSteps: [
      {
        id: 'add-dependency',
        title: 'Add dependency',
        description: 'Add CloudWatch APM to your project'
      }
    ],
    verificationSteps: [
      {
        id: 'check-agent',
        title: 'Check agent',
        description: 'Verify agent is running'
      }
    ]
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    description: 'Node.js applications with Express, Fastify, or other frameworks',
    icon: '🟢',
    category: 'language',
    prerequisites: ['Node.js 14 or higher', 'npm or yarn'],
    installationSteps: [
      {
        id: 'install-package',
        title: 'Install package',
        description: 'Install CloudWatch APM package'
      }
    ],
    verificationSteps: [
      {
        id: 'check-import',
        title: 'Check import',
        description: 'Verify package can be imported'
      }
    ]
  },
  {
    id: 'docker',
    name: 'Docker',
    description: 'Containerized applications with Docker',
    icon: '🐳',
    category: 'infrastructure',
    prerequisites: ['Docker installed'],
    installationSteps: [
      {
        id: 'modify-dockerfile',
        title: 'Modify Dockerfile',
        description: 'Add APM agent to Docker image'
      }
    ],
    verificationSteps: [
      {
        id: 'check-container',
        title: 'Check container',
        description: 'Verify agent in container'
      }
    ]
  }
]

describe('PlatformSelector', () => {
  const mockOnSelectionChange = jest.fn()

  beforeEach(() => {
    mockOnSelectionChange.mockClear()
  })

  it('renders all platforms grouped by category', () => {
    render(
      <PlatformSelector
        platforms={mockPlatforms}
        selectedPlatforms={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    expect(screen.getByText('Programming Languages')).toBeInTheDocument()
    expect(screen.getByText('Infrastructure & Deployment')).toBeInTheDocument()
    
    expect(screen.getByText('Java')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
    expect(screen.getByText('Docker')).toBeInTheDocument()
  })

  it('shows platform descriptions and prerequisites', () => {
    render(
      <PlatformSelector
        platforms={mockPlatforms}
        selectedPlatforms={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    expect(screen.getByText('Java applications with Spring Boot, Tomcat, or standalone')).toBeInTheDocument()
    expect(screen.getByText('Prerequisites: Java 8 or higher, Maven or Gradle')).toBeInTheDocument()
  })

  it('allows selecting platforms', () => {
    render(
      <PlatformSelector
        platforms={mockPlatforms}
        selectedPlatforms={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    const javaButton = screen.getByText('Java').closest('button')
    fireEvent.click(javaButton!)

    expect(mockOnSelectionChange).toHaveBeenCalledWith(['java'])
  })

  it('allows selecting multiple platforms', () => {
    render(
      <PlatformSelector
        platforms={mockPlatforms}
        selectedPlatforms={['java']}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    const nodejsButton = screen.getByText('Node.js').closest('button')
    fireEvent.click(nodejsButton!)

    expect(mockOnSelectionChange).toHaveBeenCalledWith(['java', 'nodejs'])
  })

  it('allows deselecting platforms', () => {
    render(
      <PlatformSelector
        platforms={mockPlatforms}
        selectedPlatforms={['java', 'nodejs']}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    const javaButton = screen.getByText('Java').closest('button')
    fireEvent.click(javaButton!)

    expect(mockOnSelectionChange).toHaveBeenCalledWith(['nodejs'])
  })

  it('shows visual feedback for selected platforms', () => {
    render(
      <PlatformSelector
        platforms={mockPlatforms}
        selectedPlatforms={['java']}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    const javaButton = screen.getByText('Java').closest('button')
    expect(javaButton).toHaveClass('border-blue-500', 'bg-blue-50')
    
    // Check for checkmark icon
    const checkmark = javaButton?.querySelector('svg')
    expect(checkmark).toBeInTheDocument()
  })

  it('shows success message when platforms are selected', () => {
    render(
      <PlatformSelector
        platforms={mockPlatforms}
        selectedPlatforms={['java', 'nodejs']}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    expect(screen.getByText("Great! You've selected 2 platforms.")).toBeInTheDocument()
    expect(screen.getByText("We'll customize the installation guide for your selection.")).toBeInTheDocument()
  })

  it('truncates long prerequisite lists', () => {
    const platformWithManyPrereqs: Platform = {
      ...mockPlatforms[0],
      prerequisites: ['Prereq 1', 'Prereq 2', 'Prereq 3', 'Prereq 4', 'Prereq 5']
    }

    render(
      <PlatformSelector
        platforms={[platformWithManyPrereqs]}
        selectedPlatforms={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    expect(screen.getByText('Prerequisites: Prereq 1, Prereq 2...')).toBeInTheDocument()
  })

  it('handles empty platform list', () => {
    render(
      <PlatformSelector
        platforms={[]}
        selectedPlatforms={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    expect(screen.getByText('Select the platforms and technologies you\'re using.')).toBeInTheDocument()
  })

  it('shows platform icons', () => {
    render(
      <PlatformSelector
        platforms={mockPlatforms}
        selectedPlatforms={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    expect(screen.getByText('☕')).toBeInTheDocument() // Java icon
    expect(screen.getByText('🟢')).toBeInTheDocument() // Node.js icon
    expect(screen.getByText('🐳')).toBeInTheDocument() // Docker icon
  })
})