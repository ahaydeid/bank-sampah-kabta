import { ReactNode, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, HTMLAttributes } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface BaseTableProps {
    children: ReactNode;
    className?: string;
}

export function Table({ children, className = '', ...props }: TableHTMLAttributes<HTMLTableElement> & BaseTableProps) {
    return (
        <div className="overflow-x-auto border border-slate-200 rounded-sm bg-white">
            <table {...props} className={`w-full text-left text-sm border-collapse ${className}`}>
                {children}
            </table>
        </div>
    );
}

export function TableSearch({ value, onChange, placeholder = "Cari data...", className = "" }: { value: string, onChange: (val: string) => void, placeholder?: string, className?: string }) {
    return (
        <div className={`relative max-w-[200px] ${className}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-1.5 text-sm border border-slate-200 rounded-sm focus:border-kabta-purple outline-none transition-all"
            />
        </div>
    );
}

export function PerPageSelector({ value, onChange }: { value: number, onChange: (val: number) => void }) {
    return (
        <div className="flex items-center text-sm text-slate-500">
            <span className="me-2 text-xs font-medium tracking-wider font-sans">Tampilkan</span>
            <select 
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="border border-slate-200 rounded-sm py-2 px-2 text-xs min-w-[60px] focus:border-kabta-purple outline-none bg-white cursor-pointer"
            >
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
            </select>
        </div>
    );
}

interface PaginationProps {
    links: any[];
    meta: {
        current_page: number;
        from: number;
        to: number;
        total: number;
        per_page: number;
        last_page: number;
    };
}

export function Pagination({ links, meta }: PaginationProps) {
    const prevLink = links.find(l => l.label.includes('Previous'))?.url;
    const nextLink = links.find(l => l.label.includes('Next'))?.url;

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 mt-6 px-1">

            <div className="flex items-center space-x-1">
                {prevLink ? (
                    <Link
                        href={prevLink}
                        preserveScroll
                        className="p-2 border border-slate-200 rounded-sm hover:bg-slate-50 text-slate-600 transition-colors bg-white"
                        title="Halaman Sebelumnya"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                ) : (
                    <div className="p-2 border border-slate-100 rounded-sm text-slate-300 opacity-50 bg-slate-50" title="Halaman Sebelumnya">
                        <ChevronLeft className="w-4 h-4" />
                    </div>
                )}

                <div className="flex items-center px-4 py-1.5 bg-white text-xs font-bold text-slate-700">
                    {meta.current_page} / {meta.last_page}
                </div>

                {nextLink ? (
                    <Link
                        href={nextLink}
                        preserveScroll
                        className="p-2 border border-slate-200 rounded-sm hover:bg-slate-50 text-slate-600 transition-colors bg-white"
                        title="Halaman Berikutnya"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                ) : (
                    <div className="p-2 border border-slate-100 rounded-sm text-slate-300 opacity-50 bg-slate-50" title="Halaman Berikutnya">
                        <ChevronRight className="w-4 h-4" />
                    </div>
                )}
            </div>
        </div>
    );
}

export function THead({ children, className = '', ...props }: HTMLAttributes<HTMLTableSectionElement> & BaseTableProps) {
    return (
        <thead {...props} className={`bg-slate-50 border-b border-slate-200 ${className}`}>
            {children}
        </thead>
    );
}

export function TBody({ children, className = '', ...props }: HTMLAttributes<HTMLTableSectionElement> & BaseTableProps) {
    return (
        <tbody {...props} className={`divide-y divide-slate-100 ${className}`}>
            {children}
        </tbody>
    );
}

interface TRProps extends HTMLAttributes<HTMLTableRowElement> {
    index?: number;
    isHeader?: boolean;
}

export function TR({ children, className = '', index, isHeader, onClick, ...props }: TRProps & BaseTableProps) {
    return (
        <tr 
            {...props}
            onClick={onClick}
            className={`transition-colors duration-150 ${onClick ? 'cursor-pointer hover:bg-slate-50' : ''} ${className}`}
        >
            {isHeader && (
                <TH className="w-12 text-center">No</TH>
            )}
            {typeof index === 'number' && (
                <TD className="text-center text-slate-400 font-medium">{index + 1}</TD>
            )}
            {children}
        </tr>
    );
}

export function TH({ children, className = '', ...props }: ThHTMLAttributes<HTMLTableCellElement> & BaseTableProps) {
    return (
        <th {...props} className={`px-6 py-3 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600 ${className}`}>
            {children}
        </th>
    );
}

export function TD({ children, className = '', ...props }: TdHTMLAttributes<HTMLTableCellElement> & BaseTableProps) {
    return (
        <td {...props} className={`px-6 py-3 text-slate-600 ${className}`}>
            {children}
        </td>
    );
}
