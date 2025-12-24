'use client';

import React, { useState } from 'react';
import { FeedbackType, FeedbackCategory, FeedbackPriority } from '@/types/feedback';
import { FeedbackUtils } from '@/lib/feedback';

interface FeedbackFormProps {
  pageId: string;
  sectionId?: string;
  onSubmit: (data: {
    type: FeedbackType;
    category: FeedbackCategory;
    title: string;
    description: string;
    priority: FeedbackPriority;
    tags: string[];
    attachments: File[];
  }) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export function FeedbackForm({
  pageId,
  sectionId,
  onSubmit,
  onCancel,
  className = '',
}: FeedbackFormProps) {
  const [formData, setFormData] = useState({
    type: 'improvement' as FeedbackType,
    category: 'content_clarity' as FeedbackCategory,
    title: '',
    description: '',
    priority: 'medium' as FeedbackPriority,
    tags: [] as string[],
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const feedbackTypes: { value: FeedbackType; label: string; description: string }[] = [
    { value: 'bug', label: 'Bug Report', description: 'Something is broken or not working correctly' },
    { value: 'improvement', label: 'Improvement', description: 'Suggestion to make something better' },
    { value: 'content_gap', label: 'Content Gap', description: 'Missing information or documentation' },
    { value: 'technical_error', label: 'Technical Error', description: 'Code examples or technical content is incorrect' },
    { value: 'clarity', label: 'Clarity Issue', description: 'Content is confusing or unclear' },
    { value: 'suggestion', label: 'General Suggestion', description: 'General feedback or idea' },
  ];

  const categories: { value: FeedbackCategory; label: string }[] = [
    { value: 'content_accuracy', label: 'Content Accuracy' },
    { value: 'content_completeness', label: 'Content Completeness' },
    { value: 'content_clarity', label: 'Content Clarity' },
    { value: 'technical_issue', label: 'Technical Issue' },
    { value: 'navigation', label: 'Navigation' },
    { value: 'search', label: 'Search' },
    { value: 'performance', label: 'Performance' },
    { value: 'accessibility', label: 'Accessibility' },
    { value: 'design', label: 'Design' },
    { value: 'other', label: 'Other' },
  ];

  const priorities: { value: FeedbackPriority; label: string; description: string }[] = [
    { value: 'low', label: 'Low', description: 'Minor issue, nice to have' },
    { value: 'medium', label: 'Medium', description: 'Moderate impact, should be addressed' },
    { value: 'high', label: 'High', description: 'Significant impact, needs attention' },
    { value: 'critical', label: 'Critical', description: 'Blocking issue, urgent fix needed' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        attachments,
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`feedback-form ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Submit Feedback
          </h3>
          <p className="text-sm text-gray-600">
            Help us improve the documentation by sharing your feedback.
          </p>
        </div>

        {/* Feedback Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Feedback Type *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {feedbackTypes.map((type) => (
              <label
                key={type.value}
                className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                  formData.type === type.value
                    ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={type.value}
                  checked={formData.type === type.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as FeedbackType }))}
                  className="sr-only"
                />
                <div className="flex items-start">
                  <div className="text-lg mr-3">
                    {FeedbackUtils.getTypeIcon(type.value)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {type.description}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as FeedbackCategory }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Brief summary of your feedback"
            maxLength={100}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.title.length}/100 characters
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={6}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Provide detailed information about your feedback. Include steps to reproduce if reporting a bug."
            maxLength={2000}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.description.length}/2000 characters
          </p>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {priorities.map((priority) => (
              <label
                key={priority.value}
                className={`relative flex cursor-pointer rounded-lg border p-3 focus:outline-none ${
                  formData.priority === priority.value
                    ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={priority.value}
                  checked={formData.priority === priority.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as FeedbackPriority }))}
                  className="sr-only"
                />
                <div className="text-center w-full">
                  <div className={`text-sm font-medium px-2 py-1 rounded-full ${FeedbackUtils.getPriorityColor(priority.value)}`}>
                    {priority.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {priority.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagAdd}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add tags (press Enter to add)"
          />
          {formData.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Attachments */}
        <div>
          <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-2">
            Attachments
          </label>
          <input
            type="file"
            id="attachments"
            multiple
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <p className="mt-1 text-xs text-gray-500">
            Maximum file size: 10MB. Supported formats: images, PDF, Word documents, text files.
          </p>
          
          {attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
}