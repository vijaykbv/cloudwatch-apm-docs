'use client'

import React, { useState } from 'react'
import { CodeExample, ProgrammingLanguage } from '../../types/examples'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface MultiLanguageCodeExampleProps {
  title: string
  description: string
  examples: CodeExample[]
  className?: string
}

const languageLabels: Record<ProgrammingLanguage, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  csharp: 'C#',
  go: 'Go',
  rust: 'Rust',
  php: 'PHP',
  ruby: 'Ruby',
  shell: 'Shell',
  yaml: 'YAML',
  json: 'JSON',
  dockerfile: 'Dockerfile'
}

const languageColors: Record<ProgrammingLanguage, string> = {
  javascript: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  typescript: 'bg-blue-100 text-blue-800 border-blue-200',
  python: 'bg-green-100 text-green-800 border-green-200',
  java: 'bg-orange-100 text-orange-800 border-orange-200',
  csharp: 'bg-purple-100 text-purple-800 border-purple-200',
  go: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  rust: 'bg-red-100 text-red-800 border-red-200',
  php: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  ruby: 'bg-pink-100 text-pink-800 border-pink-200',
  shell: 'bg-gray-100 text-gray-800 border-gray-200',
  yaml: 'bg-teal-100 text-teal-800 border-teal-200',
  json: 'bg-amber-100 text-amber-800 border-amber-200',
  dockerfile: 'bg-slate-100 text-slate-800 border-slate-200'
}

export function MultiLanguageCodeExample({ 
  title, 
  description, 
  examples, 
  className = '' 
}: MultiLanguageCodeExampleProps) {
  const [activeLanguage, setActiveLanguage] = useState<ProgrammingLanguage>(
    examples[0]?.language || 'javascript'
  )
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

  const activeExample = examples.find(ex => ex.language === activeLanguage) || examples[0]

  const copyToClipboard = async (code: string, exampleId: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedStates(prev => ({ ...prev, [exampleId]: true }))
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [exampleId]: false }))
      }, 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const downloadCode = (example: CodeExample) => {
    const blob = new Blob([example.code], { type: 'text/plain' })
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
    <Card className={`p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Language Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200">
        {examples.map((example) => (
          <button
            key={example.language}
            onClick={() => setActiveLanguage(example.language)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              activeLanguage === example.language
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className={`inline-block px-2 py-1 rounded text-xs mr-2 ${languageColors[example.language]}`}>
              {languageLabels[example.language]}
            </span>
            {example.title}
          </button>
        ))}
      </div>

      {/* Active Example */}
      {activeExample && (
        <div className="space-y-4">
          {/* Example Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${languageColors[activeExample.language]}`}>
                {languageLabels[activeExample.language]}
              </span>
              <span className="text-sm text-gray-500">
                Difficulty: {activeExample.difficulty}
              </span>
              {activeExample.metadata.framework && (
                <span className="text-sm text-gray-500">
                  Framework: {activeExample.metadata.framework}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(activeExample.code, activeExample.id)}
              >
                {copiedStates[activeExample.id] ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCode(activeExample)}
              >
                Download
              </Button>
            </div>
          </div>

          {/* Code Block */}
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{activeExample.code}</code>
            </pre>
          </div>

          {/* Dependencies */}
          {activeExample.dependencies && activeExample.dependencies.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Dependencies:</h4>
              <div className="flex flex-wrap gap-2">
                {activeExample.dependencies.map((dep, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono"
                  >
                    {dep}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {activeExample.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {activeExample.tags.map((tag, index) => (
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

          {/* Metadata */}
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span>Last updated: {activeExample.lastUpdated.toLocaleDateString()}</span>
              <div className="flex space-x-4">
                {activeExample.metadata.runnable && (
                  <span className="text-green-600">✓ Runnable</span>
                )}
                {activeExample.metadata.testable && (
                  <span className="text-blue-600">✓ Testable</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}