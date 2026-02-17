import Sidebar from '@/Components/Base/Sidebar';
import Topbar from '@/Components/Base/Topbar';
import { Head } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebar_collapsed') === 'true';
        }
        return false;
    });

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

                <main className="pt-20 pb-12 px-3">
                    {header && (
                        <div className="mb-10">
                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight uppercase italic">
                                {header}
                            </h1>
                            <div className="h-1.5 w-16 bg-kabta-purple mt-2 shadow-sm shadow-kabta-purple/20"></div>
                        </div>
                    )}
                    
                    {children}
                </main>
            </div>
        </div>
    );
}
