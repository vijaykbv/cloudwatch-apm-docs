'use client'

import React, { useState, useRef, useEffect } from 'react'
import { CodeExample, ProgrammingLanguage } from '../../types/examples'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface LiveCodeEditorProps {
  example: CodeExample
  className?: string
  onCodeChange?: (code: string) => void
}

interface ExecutionResult {
  output: string
  error?: string
  executionTime: number
}

export function LiveCodeEditor({ 
  example, 
  className = '',
  onCodeChange 
}: LiveCodeEditorProps) {
  const [code, setCode] = useState(example.code)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [isModified, setIsModified] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setCode(example.code)
    setIsModified(false)
    setExecutionResult(null)
  }, [example])

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
    setIsModified(newCode !== example.code)
    onCodeChange?.(newCode)
  }

  const resetCode = () => {
    setCode(example.code)
    setIsModified(false)
    setExecutionResult(null)
  }

  const executeCode = async () => {
    if (!isExecutable(example.language)) {
      setExecutionResult({
        output: '',
        error: `Code execution not supported for ${example.language}`,
        executionTime: 0
      })
      return
    }

    setIsExecuting(true)
    const startTime = Date.now()

    try {
      const result = await simulateCodeExecution(code, example.language)
      const executionTime = Date.now() - startTime

      setExecutionResult({
        output: result.output,
        error: result.error,
        executionTime
      })
    } catch (error) {
      setExecutionResult({
        output: '',
        error: error instanceof Error ? error.message : 'Unknown execution error',
        executionTime: Date.now() - startTime
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const isExecutable = (language: ProgrammingLanguage): boolean => {
    // For demo purposes, we'll simulate execution for certain languages
    return ['javascript', 'typescript', 'python'].includes(language)
  }

  const simulateCodeExecution = async (
    code: string, 
    language: ProgrammingLanguage
  ): Promise<{ output: string; error?: string }> => {
    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Simple simulation based on language
    switch (language) {
      case 'javascript':
      case 'typescript':
        return simulateJavaScriptExecution(code)
      case 'python':
        return simulatePythonExecution(code)
      default:
        return {
          output: '',
          error: `Execution not implemented for ${language}`
        }
    }
  }

  const simulateJavaScriptExecution = (code: string): { output: string; error?: string } => {
    try {
      // Very basic simulation - look for console.log statements
      const consoleOutputs: string[] = []
      const lines = code.split('\n')
      
      lines.forEach((line, index) => {
        if (line.includes('console.log')) {
          const match = line.match(/console\.log\(['"`]([^'"`]*)['"`]\)/)
          if (match) {
            consoleOutputs.push(`Line ${index + 1}: ${match[1]}`)
          }
        }
      })

      if (consoleOutputs.length === 0) {
        consoleOutputs.push('Server started successfully')
        consoleOutputs.push('Listening on port 3000')
        consoleOutputs.push('OpenTelemetry SDK initialized')
      }

      return {
        output: consoleOutputs.join('\n')
      }
    } catch (error) {
      return {
        output: '',
        error: error instanceof Error ? error.message : 'Execution error'
      }
    }
  }

  const simulatePythonExecution = (code: string): { output: string; error?: string } => {
    try {
      const outputs: string[] = []
      const lines = code.split('\n')
      
      lines.forEach((line, index) => {
        if (line.includes('print(')) {
          const match = line.match(/print\(['"`]([^'"`]*)['"`]\)/)
          if (match) {
            outputs.push(`${match[1]}`)
          }
        }
      })

      if (outputs.length === 0) {
        outputs.push('Flask application started')
        outputs.push('* Running on http://0.0.0.0:5000')
        outputs.push('OpenTelemetry initialized successfully')
      }

      return {
        output: outputs.join('\n')
      }
    } catch (error) {
      return {
        output: '',
        error: error instanceof Error ? error.message : 'Execution error'
      }
    }
  }

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = example.metadata.filename || `${example.id}.${getFileExtension(example.language)}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getFileExtension = (language: ProgrammingLanguage): string => {
    const extensions: Record<ProgrammingLanguage, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      csharp: 'cs',
      go: 'go',
      rust: 'rs',
      php: 'php',
      ruby: 'rb',
      shell: 'sh',
      yaml: 'yml',
      json: 'json',
      dockerfile: 'dockerfile'
    }
    return extensions[language] || 'txt'
  }

  return (
    <Card className={`${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{example.title}</h3>
            <p className="text-sm text-gray-600">{example.description}</p>
          </div>
          <div className="flex space-x-2">
            {isModified && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetCode}
              >
                Reset
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={downloadCode}
            >
              Download
            </Button>
            {isExecutable(example.language) && (
              <Button
                size="sm"
                onClick={executeCode}
                disabled={isExecuting}
              >
                {isExecuting ? 'Running...' : 'Run Code'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Code Editor */}
        <div className="relative">
          <div className="p-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-600">
            <span className="font-medium">{example.language}</span>
            {isModified && <span className="ml-2 text-orange-600">• Modified</span>}
          </div>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="w-full h-96 p-4 font-mono text-sm bg-gray-900 text-gray-100 border-none resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            spellCheck={false}
            style={{
              tabSize: 2,
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
            }}
          />
        </div>

        {/* Output Panel */}
        <div className="border-l border-gray-200">
          <div className="p-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-600">
            <span className="font-medium">Output</span>
            {executionResult && (
              <span className="ml-2">
                ({executionResult.executionTime}ms)
              </span>
            )}
          </div>
          <div className="h-96 p-4 bg-black text-green-400 font-mono text-sm overflow-auto">
            {!executionResult && (
              <div className="text-gray-500">
                {isExecutable(example.language) 
                  ? 'Click "Run Code" to execute the example'
                  : `Code execution not available for ${example.language}`
                }
              </div>
            )}
            {executionResult && (
              <div>
                {executionResult.error ? (
                  <div className="text-red-400">
                    <div className="font-bold">Error:</div>
                    <div>{executionResult.error}</div>
                  </div>
                ) : (
                  <div>
                    {executionResult.output.split('\n').map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Example Metadata */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Difficulty:</span>
            <span className="ml-2 text-gray-600 capitalize">{example.difficulty}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Category:</span>
            <span className="ml-2 text-gray-600">{example.category}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Last Updated:</span>
            <span className="ml-2 text-gray-600">{example.lastUpdated.toLocaleDateString()}</span>
          </div>
        </div>
        
        {example.tags.length > 0 && (
          <div className="mt-3">
            <span className="font-medium text-gray-700 text-sm">Tags:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {example.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}