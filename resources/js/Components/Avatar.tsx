import { User } from 'lucide-react';

interface AvatarProps {
    src?: string | null;
    name?: string | null;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export default function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-lg',
        xl: 'w-32 h-32 text-2xl',
    };

    const iconSizes = {
        sm: 16,
        md: 20,
        lg: 32,
        xl: 64,
    };

    // Get initials from name
    const getInitials = (name: string) => {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // If photo exists, show photo
    if (src) {
        return (
            <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-slate-100 ${className}`}>
                <img 
                    src={src} 
                    alt={name || 'Profile'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback to initials if image fails to load
                        e.currentTarget.style.display = 'none';
                    }}
                />
            </div>
        );
    }

    // If name exists, show initials
    if (name) {
        return (
            <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold ${className}`}>
                {getInitials(name)}
            </div>
        );
    }

    // Fallback to icon
    return (
        <div className={`${sizeClasses[size]} rounded-full bg-slate-100 flex items-center justify-center text-slate-600 ${className}`}>
            <User size={iconSizes[size]} />
        </div>
    );
}
