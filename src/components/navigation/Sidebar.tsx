import React from 'react'
import Link from 'next/link'

interface SidebarItem {
  href: string
  label: string
  children?: SidebarItem[]
}

interface SidebarProps {
  items: SidebarItem[]
  currentPath?: string
}

const Sidebar: React.FC<SidebarProps> = ({ items, currentPath }) => {
  return (
    <aside className="w-64 bg-gray-50 min-h-screen p-4">
      <nav>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index}>
              <Link
                href={item.href}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  currentPath === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
              {item.children && (
                <ul className="ml-4 mt-2 space-y-1">
                  {item.children.map((child, childIndex) => (
                    <li key={childIndex}>
                      <Link
                        href={child.href}
                        className={`block px-3 py-1 rounded-md text-sm ${
                          currentPath === child.href
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar