'use client'

import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import ErrorMessageDatabase from './ErrorMessageDatabase'
import FAQSystem from './FAQSystem'
import DiagnosticValidator from './DiagnosticValidator'
import DiagnosticRunner from './DiagnosticRunner'

interface TroubleshootingSystemProps {
  className?: string
}

export default function TroubleshootingSystem({ className = '' }: TroubleshootingSystemProps) {
  const [activeTab, setActiveTab] = useState<'errors' | 'faq' | 'validator' | 'runner'>('errors')
  const [globalSearch, setGlobalSearch] = useState('')

  const tabs = [
    { key: 'errors', label: 'Error Messages', icon: '🚨', component: ErrorMessageDatabase },
    { key: 'faq', label: 'FAQ', icon: '❓', component: FAQSystem },
    { key: 'validator', label: 'Validator', icon: '✅', component: DiagnosticValidator },
    { key: 'runner', label: 'Command Runner', icon: '💻', component: DiagnosticRunner }
  ]

  const ActiveComponent = tabs.find(tab => tab.key === activeTab)?.component || ErrorMessageDatabase

  return (
    <div className={`troubleshooting-system ${className}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Troubleshooting & Support System
        </h1>
        <p className="text-lg text-gray-600">
          Comprehensive tools for diagnosing, validating, and resolving CloudWatch APM issues.
        </p>
      </div>

      {/* Global Search */}
      <Card className="p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search across all troubleshooting resources..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <Button>
            🔍 Search All
          </Button>
        </div>
        {globalSearch && (
          <div className="mt-4 text-sm text-gray-600">
            Searching for "{globalSearch}" across error messages, FAQs, and validation rules...
          </div>
        )}
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-2 text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-2xl mb-2">🔍</div>
          <h3 className="font-semibold text-gray-900 mb-1">Find Error</h3>
          <p className="text-sm text-gray-600">Search error messages by code or description</p>
        </Card>
        <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-2xl mb-2">❓</div>
          <h3 className="font-semibold text-gray-900 mb-1">Browse FAQ</h3>
          <p className="text-sm text-gray-600">Find answers to common questions</p>
        </Card>
        <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-2xl mb-2">✅</div>
          <h3 className="font-semibold text-gray-900 mb-1">Validate Config</h3>
          <p className="text-sm text-gray-600">Check configuration files and settings</p>
        </Card>
        <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-2xl mb-2">💻</div>
          <h3 className="font-semibold text-gray-900 mb-1">Run Diagnostics</h3>
          <p className="text-sm text-gray-600">Execute diagnostic commands</p>
        </Card>
      </div>

      {/* Active Component */}
      <div>
        <ActiveComponent />
      </div>

      {/* Help Section */}
      <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="text-4xl">💡</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need More Help?</h3>
            <p className="text-gray-700 mb-4">
              If you can't find what you're looking for in our troubleshooting resources, 
              here are additional ways to get help:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl mb-2">📖</div>
                <h4 className="font-medium text-gray-900 mb-1">Documentation</h4>
                <p className="text-sm text-gray-600">Browse comprehensive guides</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl mb-2">💬</div>
                <h4 className="font-medium text-gray-900 mb-1">Community</h4>
                <p className="text-sm text-gray-600">Ask the community</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl mb-2">🎫</div>
                <h4 className="font-medium text-gray-900 mb-1">Support</h4>
                <p className="text-sm text-gray-600">Contact AWS Support</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}