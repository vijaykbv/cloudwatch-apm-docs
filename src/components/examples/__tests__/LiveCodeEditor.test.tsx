/**
 * Unit tests for LiveCodeEditor component
 * **Validates: Requirements 6.1, 6.2**
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LiveCodeEditor } from '../LiveCodeEditor'
import { CodeExample } from '../../../types/examples'

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve())
  }
})

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

const mockExample: CodeExample = {
  id: 'test-example',
  title: 'Test JavaScript Example',
  description: 'A test example for unit testing',
  language: 'javascript',
  code: 'console.log("Hello World");\nconst app = express();\napp.listen(3000);',
  category: 'getting-started',
  difficulty: 'beginner',
  tags: ['javascript', 'test'],
  dependencies: ['express'],
  relatedExamples: [],
  lastUpdated: new Date('2024-01-15'),
  metadata: {
    filename: 'test.js',
    runnable: true,
    testable: true,
    framework: 'express'
  }
}

describe('LiveCodeEditor', () => {
  const defaultProps = {
    example: mockExample
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('renders component with example title and description', () => {
    render(<LiveCodeEditor {...defaultProps} />)
    
    expect(screen.getByText('Test JavaScript Example')).toBeInTheDocument()
    expect(screen.getByText('A test example for unit testing')).toBeInTheDocument()
  })

  test('displays code in textarea', () => {
    render(<LiveCodeEditor {...defaultProps} />)
    
    const textarea = screen.getByDisplayValue(/console\.log\("Hello World"\)/)
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveValue(mockExample.code)
  })

  test('shows language indicator', () => {
    render(<LiveCodeEditor {...defaultProps} />)
    
    expect(screen.getByText('javascript')).toBeInTheDocument()
  })

  test('allows code editing', () => {
    const onCodeChange = jest.fn()
    render(<LiveCodeEditor {...defaultProps} onCodeChange={onCodeChange} />)
    
    const textarea = screen.getByDisplayValue(/console\.log\("Hello World"\)/)
    const newCode = 'console.log("Modified code");'
    
    fireEvent.change(textarea, { target: { value: newCode } })
    
    expect(textarea).toHaveValue(newCode)
    expect(onCodeChange).toHaveBeenCalledWith(newCode)
  })

  test('shows modified indicator when code is changed', () => {
    render(<LiveCodeEditor {...defaultProps} />)
    
    const textarea = screen.getByDisplayValue(/console\.log\("Hello World"\)/)
    
    // Initially no modified indicator
    expect(screen.queryByText('• Modified')).not.toBeInTheDocument()
    
    // Change code
    fireEvent.change(textarea, { target: { value: 'modified code' } })
    
    // Should show modified indicator
    expect(screen.getByText('• Modified')).toBeInTheDocument()
  })

  test('reset button restores original code', () => {
    render(<LiveCodeEditor {...defaultProps} />)
    
    const textarea = screen.getByDisplayValue(/console\.log\("Hello World"\)/)
    
    // Modify code
    fireEvent.change(textarea, { target: { value: 'modified code' } })
    expect(textarea).toHaveValue('modified code')
    
    // Reset code
    const resetButton = screen.getByText('Reset')
    fireEvent.click(resetButton)
    
    expect(textarea).toHaveValue(mockExample.code)
    expect(screen.queryByText('• Modified')).not.toBeInTheDocument()
  })

  test('download button creates and clicks download link', () => {
    // Mock document methods
    const mockClick = jest.fn()
    const mockAppendChild = jest.fn()
    const mockRemoveChild = jest.fn()
    
    const mockAnchor = {
      href: '',
      download: '',
      click: mockClick
    }
    
    jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any)
    jest.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild)
    jest.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild)
    
    render(<LiveCodeEditor {...defaultProps} />)
    
    const downloadButton = screen.getByText('Download')
    fireEvent.click(downloadButton)
    
    expect(document.createElement).toHaveBeenCalledWith('a')
    expect(mockAnchor.download).toBe('test.js')
    expect(mockClick).toHaveBeenCalled()
    expect(mockAppendChild).toHaveBeenCalledWith(mockAnchor)
    expect(mockRemoveChild).toHaveBeenCalledWith(mockAnchor)
  })

  test('run code button executes JavaScript code', async () => {
    render(<LiveCodeEditor {...defaultProps} />)
    
    const runButton = screen.getByText('Run Code')
    expect(runButton).toBeInTheDocument()
    expect(runButton).not.toBeDisabled()
    
    fireEvent.click(runButton)
    
    // Should show running state
    expect(screen.getByText('Running...')).toBeInTheDocument()
    expect(screen.getByText('Running...')).toBeDisabled()
    
    // Fast-forward timers to complete execution
    jest.advanceTimersByTime(3000)
    
    await waitFor(() => {
      expect(screen.getByText('Run Code')).toBeInTheDocument()
      expect(screen.getByText('Run Code')).not.toBeDisabled()
    })
  })

  test('shows execution output after running code', async () => {
    render(<LiveCodeEditor {...defaultProps} />)
    
    const runButton = screen.getByText('Run Code')
    fireEvent.click(runButton)
    
    // Fast-forward timers
    jest.advanceTimersByTime(3000)
    
    await waitFor(() => {
      // Should show some output (mocked execution results)
      expect(screen.getByText(/Server started successfully|OpenTelemetry SDK initialized/)).toBeInTheDocument()
    })
  })

  test('shows execution time in output panel', async () => {
    render(<LiveCodeEditor {...defaultProps} />)
    
    const runButton = screen.getByText('Run Code')
    fireEvent.click(runButton)
    
    jest.advanceTimersByTime(3000)
    
    await waitFor(() => {
      expect(screen.getByText(/\(\d+ms\)/)).toBeInTheDocument()
    })
  })

  test('handles non-executable languages', () => {
    const nonExecutableExample = {
      ...mockExample,
      language: 'yaml' as const
    }
    
    render(<LiveCodeEditor example={nonExecutableExample} />)
    
    expect(screen.queryByText('Run Code')).not.toBeInTheDocument()
    expect(screen.getByText(/Code execution not available for yaml/)).toBeInTheDocument()
  })

  test('displays example metadata', () => {
    render(<LiveCodeEditor {...defaultProps} />)
    
    expect(screen.getByText('Difficulty:')).toBeInTheDocument()
    expect(screen.getByText('beginner')).toBeInTheDocument()
    expect(screen.getByText('Category:')).toBeInTheDocument()
    expect(screen.getByText('getting-started')).toBeInTheDocument()
    expect(screen.getByText('Last Updated:')).toBeInTheDocument()
  })

  test('displays tags', () => {
    render(<LiveCodeEditor {...defaultProps} />)
    
    expect(screen.getByText('Tags:')).toBeInTheDocument()
    expect(screen.getByText('javascript')).toBeInTheDocument()
    expect(screen.getByText('test')).toBeInTheDocument()
  })

  test('resets state when example changes', () => {
    const { rerender } = render(<LiveCodeEditor {...defaultProps} />)
    
    // Modify code
    const textarea = screen.getByDisplayValue(/console\.log\("Hello World"\)/)
    fireEvent.change(textarea, { target: { value: 'modified code' } })
    expect(screen.getByText('• Modified')).toBeInTheDocument()
    
    // Change example
    const newExample = {
      ...mockExample,
      id: 'new-example',
      code: 'console.log("New example");'
    }
    
    rerender(<LiveCodeEditor example={newExample} />)
    
    // Should reset to new example code
    expect(screen.getByDisplayValue('console.log("New example");')).toBeInTheDocument()
    expect(screen.queryByText('• Modified')).not.toBeInTheDocument()
  })

  test('applies custom className', () => {
    const { container } = render(
      <LiveCodeEditor {...defaultProps} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  test('handles Python code execution simulation', async () => {
    const pythonExample = {
      ...mockExample,
      language: 'python' as const,
      code: 'print("Hello Python")\napp.run(debug=True)'
    }
    
    render(<LiveCodeEditor example={pythonExample} />)
    
    const runButton = screen.getByText('Run Code')
    fireEvent.click(runButton)
    
    jest.advanceTimersByTime(3000)
    
    await waitFor(() => {
      expect(screen.getByText(/Flask application started|Running on http:\/\/0\.0\.0\.0:5000/)).toBeInTheDocument()
    })
  })

  test('shows initial output panel message', () => {
    render(<LiveCodeEditor {...defaultProps} />)
    
    expect(screen.getByText('Click "Run Code" to execute the example')).toBeInTheDocument()
  })

  test('shows non-executable language message', () => {
    const yamlExample = {
      ...mockExample,
      language: 'yaml' as const
    }
    
    render(<LiveCodeEditor example={yamlExample} />)
    
    expect(screen.getByText('Code execution not available for yaml')).toBeInTheDocument()
  })
})