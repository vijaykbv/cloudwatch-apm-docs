import React from 'react'
import Link from 'next/link'

const MainNavigation: React.FC = () => {
  const navigationItems = [
    { href: '/', label: 'Home' },
    { href: '/getting-started', label: 'Getting Started' },
    { href: '/configuration', label: 'Configuration' },
    { href: '/examples', label: 'Examples' },
    { href: '/api', label: 'API Reference' },
    { href: '/troubleshooting', label: 'Troubleshooting' },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                CloudWatch APM
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default MainNavigation