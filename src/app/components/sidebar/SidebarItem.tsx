import { ReactNode } from 'react';

interface SidebarItemProps {
  icon: ReactNode;
  label?: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function SidebarItem({ 
  icon, 
  label, 
  isActive = false, 
  onClick, 
  className = '' 
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex flex-col items-center py-3 px-2 rounded-lg transition-colors
        ${isActive 
          ? 'bg-green-50 text-green-600' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
        }
        ${className}
      `}
    >
      <div className="text-xl mb-1">
        {icon}
      </div>
      {label && (
        <span className="text-xs font-medium">
          {label}
        </span>
      )}
    </button>
  );
}