import { ReactNode } from 'react';

interface TableProps {
    children: ReactNode;
    className?: string;
}

export function Table({ children, className = '' }: TableProps) {
    return (
        <div className="overflow-x-auto border border-slate-200 rounded-sm shadow-sm">
            <table className={`w-full text-left text-sm border-collapse ${className}`}>
                {children}
            </table>
        </div>
    );
}

export function THead({ children, className = '' }: TableProps) {
    return (
        <thead className={`bg-slate-50 border-b border-slate-200 text-slate-800 font-bold uppercase tracking-wider ${className}`}>
            {children}
        </thead>
    );
}

export function TBody({ children, className = '' }: TableProps) {
    return (
        <tbody className={`divide-y divide-slate-100 ${className}`}>
            {children}
        </tbody>
    );
}

export function TR({ children, className = '', onClick }: TableProps & { onClick?: () => void }) {
    return (
        <tr 
            onClick={onClick}
            className={`transition-colors duration-150 ${onClick ? 'cursor-pointer hover:bg-slate-50' : ''} ${className}`}
        >
            {children}
        </tr>
    );
}

export function TH({ children, className = '' }: TableProps) {
    return (
        <th className={`px-6 py-4 font-bold ${className}`}>
            {children}
        </th>
    );
}

export function TD({ children, className = '' }: TableProps) {
    return (
        <td className={`px-6 py-4 text-slate-600 ${className}`}>
            {children}
        </td>
    );
}
