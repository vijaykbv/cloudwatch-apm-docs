'use client';

import React from 'react';
import { useAuth } from './AuthProvider';

interface LoginButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LoginButton({ className = '', children }: LoginButtonProps) {
  const { isAuthenticated, user, login, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded px-4 py-2 ${className}`}>
        <div className="h-4 bg-gray-300 rounded w-16"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user.given_name.charAt(0)}{user.family_name.charAt(0)}
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-gray-900">
              {user.given_name} {user.family_name}
            </div>
            <div className="text-xs text-gray-500">
              {user.department || 'AWS Employee'}
            </div>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded border border-gray-300 hover:border-gray-400 transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => login()}
      className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors ${className}`}
    >
      {children || 'Sign In with AWS SSO'}
    </button>
  );
}

export function UserProfile() {
  const { user, hasRole } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-medium">
          {user.given_name.charAt(0)}{user.family_name.charAt(0)}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {user.given_name} {user.family_name}
          </h2>
          <p className="text-gray-600">{user.email}</p>
          {user.department && (
            <p className="text-sm text-gray-500">{user.department}</p>
          )}
          {user.employee_id && (
            <p className="text-xs text-gray-400">ID: {user.employee_id}</p>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Roles & Permissions</h3>
        <div className="flex flex-wrap gap-2">
          {user.roles.map((role) => (
            <span
              key={role}
              className={`px-2 py-1 text-xs rounded-full ${
                role === 'admin'
                  ? 'bg-red-100 text-red-800'
                  : role === 'editor'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <h3 className="font-medium mb-2">Permissions</h3>
        <ul className="space-y-1">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            View documentation
          </li>
          {hasRole('editor') && (
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Edit content and leave comments
            </li>
          )}
          {hasRole('admin') && (
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Manage users and approve changes
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}