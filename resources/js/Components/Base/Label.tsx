import { LabelHTMLAttributes } from 'react';

export default function Label({
    value,
    className = '',
    required = false,
    children,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string, required?: boolean }) {
    return (
        <label
            {...props}
            className={
                `block font-medium text-sm text-slate-700 ` + className
            }
        >
            {value ? value : children}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
    );
}
