'use client';

import React, { useState } from 'react';
import { FeedbackAnalytics, FeedbackExport } from '@/types/feedback';
import { FeedbackService, FeedbackUtils } from '@/lib/feedback';

interface FeedbackAnalyticsDashboardProps {
  analytics: FeedbackAnalytics;
  className?: string;
}

export function FeedbackAnalyticsDashboard({ analytics, className = '' }: FeedbackAnalyticsDashboardProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [feedbackService] = useState(() => new FeedbackService());

  const handleExport = async (format: 'csv' | 'json' | 'xlsx') => {
    try {
      setIsExporting(true);
      
      const exportConfig: FeedbackExport = {
        format,
        includeComments: true,
        includeAttachments: false,
      };
      
      const blob = await feedbackService.exportFeedback(exportConfig);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `feedback-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatResolutionTime = (milliseconds: number): string => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
      return `${minutes}m`;
    }
  };

  return (
    <div className={`feedback-analytics-dashboard ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Feedback Analytics
        </h2>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Export:</span>
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={isExporting}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            JSON
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            disabled={isExporting}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Feedback</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalFeedback}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Issues</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.byStatus.open || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.byStatus.resolved || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatResolutionTime(analytics.averageResolutionTime)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Feedback by Type */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback by Type</h3>
          <div className="space-y-3">
            {Object.entries(analytics.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{FeedbackUtils.getTypeIcon(type as any)}</span>
                  <span className="text-sm text-gray-700 capitalize">{type.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / analytics.totalFeedback) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback by Priority */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback by Priority</h3>
          <div className="space-y-3">
            {Object.entries(analytics.byPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${FeedbackUtils.getPriorityColor(priority as any)}`}>
                    {priority}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className={`h-2 rounded-full ${
                        priority === 'critical' ? 'bg-red-600' :
                        priority === 'high' ? 'bg-orange-600' :
                        priority === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${(count / analytics.totalFeedback) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages and Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Pages */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Pages with Feedback</h3>
          <div className="space-y-3">
            {analytics.topPages.slice(0, 5).map((page, index) => (
              <div key={page.pageId} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 mr-3">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {page.title}
                    </p>
                    <p className="text-xs text-gray-500">{page.pageId}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">{page.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Issues */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Issue Categories</h3>
          <div className="space-y-3">
            {analytics.topIssues.slice(0, 5).map((issue, index) => (
              <div key={issue.category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 mr-3">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {issue.category.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      Avg Priority: {issue.averagePriority.toFixed(1)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">{issue.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trends Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback Trends (Last 30 Days)</h3>
        <div className="h-64 flex items-end justify-between space-x-1">
          {analytics.trends.slice(-30).map((trend, index) => {
            const maxCount = Math.max(...analytics.trends.map(t => t.count));
            const height = maxCount > 0 ? (trend.count / maxCount) * 100 : 0;
            
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="w-full flex flex-col items-end space-y-1">
                  <div
                    className="w-full bg-blue-600 rounded-t"
                    style={{ height: `${height}%` }}
                    title={`${trend.date.toLocaleDateString()}: ${trend.count} new, ${trend.resolved} resolved`}
                  ></div>
                  <div
                    className="w-full bg-green-600 rounded-b"
                    style={{ height: `${maxCount > 0 ? (trend.resolved / maxCount) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                  {trend.date.getDate()}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
            <span className="text-gray-600">New Feedback</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-600 rounded mr-2"></div>
            <span className="text-gray-600">Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
}