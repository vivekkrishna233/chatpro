"use client";

import Image from 'next/image';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: string;
  isOnline?: boolean;
  className?: string;
}

export default function Avatar({ 
  src, 
  alt = '', 
  size = 'md', 
  fallback, 
  isOnline = false, 
  className = '' 
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const sizePx = {
    sm: 32,
    md: 40,
    lg: 48
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full bg-gray-300 flex items-center justify-center overflow-hidden`}>
        {src ? (
          <Image 
            src={src} 
            alt={alt} 
            width={sizePx[size]} 
            height={sizePx[size]} 
            className="object-cover rounded-full" 
          />
        ) : (
          <span className="text-gray-600 font-medium">
            {fallback ? getInitials(fallback) : '?'}
          </span>
        )}
      </div>
      {isOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      )}
    </div>
  );
}
