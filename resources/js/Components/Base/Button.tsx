import { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    children: ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className = '',
    disabled,
    children,
    ...props
}: Props) {
    const baseStyles = 'inline-flex items-center justify-center font-semibold uppercase tracking-widest transition ease-in-out duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-25';
    
    const variants = {
        primary: 'bg-slate-800 text-white hover:bg-slate-700 active:bg-slate-900 focus:ring-slate-500 border border-transparent',
        secondary: 'bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-500 border border-slate-300',
        danger: 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700 focus:ring-red-500 border border-transparent',
        success: 'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 focus:ring-emerald-500 border border-transparent',
        outline: 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-500 border border-slate-300',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    const rounding = 'rounded-sm'; // Strict minimal rounding

    return (
        <button
            {...props}
            disabled={disabled || isLoading}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${rounding} ${className}`}
        >
            {isLoading && (
                <svg className="animate-spin -ms-1 me-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {children}
        </button>
    );
}
