import Sidebar from '@/Components/Base/Sidebar';
import Topbar from '@/Components/Base/Topbar';
import { Head, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import { toast } from '@/Components/Base/Alert';

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { flash } = usePage().props as any;
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebar_collapsed') === 'true';
        }
        return false;
    });

    useEffect(() => {
        if (flash?.success) {
            toast.fire({
                icon: 'success',
                title: flash.success
            });
        }
        if (flash?.error) {
            toast.fire({
                icon: 'error',
                title: flash.error
            });
        }
    }, [flash]);

    const handleToggleCollapse = (val: boolean) => {
        setIsCollapsed(val);
        localStorage.setItem('sidebar_collapsed', String(val));
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Dashboard" />

            <Sidebar isCollapsed={isCollapsed} />

            <div className={`${isCollapsed ? 'lg:ms-20' : 'lg:ms-60'} transition-all duration-300 ease-in-out`}>
                <Topbar isCollapsed={isCollapsed} setIsCollapsed={handleToggleCollapse} />

                <main className="pt-20 pb-12 px-4 max-w-7xl mx-auto">
                    {header && (
                        <div className="mb-8 border-b border-slate-200 pb-4">
                            <h1 className="text-xl font-bold text-slate-800 tracking-tight uppercase">
                                {header}
                            </h1>
                        </div>
                    )}
                    
                    {children}
                </main>
            </div>
        </div>
    );
}
