import React from 'react';
import Link from 'next/link';
import { BreadcrumbItem } from '@/types';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = ''
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className={`breadcrumbs ${className}`} aria-label="Breadcrumb navigation">
      <ol className="breadcrumb-list">
        {items.map((item, index) => (
          <li key={item.id || index} className="breadcrumb-item">
            {index < items.length - 1 ? (
              <>
                <Link href={item.href} className="breadcrumb-link">
                  {item.title}
                </Link>
                <span className="breadcrumb-separator" aria-hidden="true">
                  /
                </span>
              </>
            ) : (
              <span className="breadcrumb-current" aria-current="page">
                {item.title}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;