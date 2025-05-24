interface BadgeProps {
    children: React.ReactNode;
    variant?: 'demo' | 'internal' | 'signup' | 'content' | 'dont-send' | 'default';
    className?: string;
  }
  
  export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
    const variantClasses = {
      demo: 'bg-orange-100 text-orange-600 border-orange-200',
      internal: 'bg-green-100 text-green-600 border-green-200',
      signup: 'bg-blue-100 text-blue-600 border-blue-200',
      content: 'bg-purple-100 text-purple-600 border-purple-200',
      'dont-send': 'bg-red-100 text-red-600 border-red-200',
      default: 'bg-gray-100 text-gray-600 border-gray-200'
    };
  
    return (
      <span className={`
        inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border
        ${variantClasses[variant]}
        ${className}
      `}>
        {children}
      </span>
    );
  }