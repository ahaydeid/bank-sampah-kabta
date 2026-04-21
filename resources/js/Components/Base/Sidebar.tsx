import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Database,
    Users,
    LineChart,
    Settings,
    ChevronDown,
    ChevronRight,
    Package,
    Recycle,
    Wallet,
    ShieldCheck,
    X
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface SubMenuItem {
    label: string;
    href: string;
    active: boolean;
}

interface MenuItemProps {
    label: string;
    icon: any;
    href?: string;
    active: boolean;
    children?: SubMenuItem[];
    isCollapsed?: boolean;
    onNavigate?: () => void;
}

const NavMenu = ({ label, icon: Icon, href, active, children, isCollapsed, onNavigate }: MenuItemProps) => {
    const [isOpen, setIsOpen] = useState(active || children?.some(c => c.active));

    // Support persistence: keep open if child is active
    useEffect(() => {
        if (children?.some(c => c.active)) {
            setIsOpen(true);
        }
    }, [active, children]);

    if (isCollapsed) {
        return (
            <div className="mb-2 flex justify-center">
                <Link
                    href={children ? '#' : (href || '#')}
                    preserveScroll
                    onClick={onNavigate}
                    className={`w-10 h-10 flex items-center justify-center rounded-sm transition-all duration-200 ${active || children?.some(c => c.active)
                        ? 'bg-sankara-green text-white'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                    title={label}
                >
                    <Icon className="w-5 h-5" />
                </Link>
            </div>
        );
    }

    return (
        <div className="mb-1">
            {children ? (
                <>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium transition-all duration-200 ${active || children?.some(c => c.active)
                            ? 'bg-sankara-green text-white shadow-sm shadow-sankara-green/20'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                    >
                        <div className="flex items-center">
                            <Icon className={`w-5 h-5 me-3 ${active || children?.some(c => c.active) ? 'text-white' : 'text-slate-400'}`} />
                            {label}
                        </div>
                        {isOpen ? (
                            <ChevronDown size={14} className={active || children?.some(c => c.active) ? 'text-white/70' : ''} />
                        ) : (
                            <ChevronRight size={14} className={active || children?.some(c => c.active) ? 'text-white/70' : ''} />
                        )}
                    </button>
                    {isOpen && (
                        <div className="bg-slate-50/50 py-1">
                            {children.map((child) => (
                                <Link
                                    key={child.label}
                                    href={child.href}
                                    preserveScroll
                                    onClick={onNavigate}
                                    className={`flex items-center ps-12 pe-4 py-2.5 text-[13px] font-medium transition-all ${child.active
                                        ? 'text-sankara-green'
                                        : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full me-3 ${child.active ? 'bg-sankara-green' : 'bg-slate-300'}`} />
                                    {child.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            ) : href ? (
                <Link
                    href={href}
                    preserveScroll
                    onClick={onNavigate}
                    className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 ${active
                        ? 'bg-sankara-green text-white shadow-sm shadow-sankara-green/20'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                        }`}
                >
                    <Icon className={`w-5 h-5 me-3 ${active ? 'text-white' : 'text-slate-400'}`} />
                    {label}
                </Link>
            ) : (
                <div
                    className="flex items-center px-4 py-3 text-sm font-medium text-slate-400 cursor-not-allowed opacity-60"
                >
                    <Icon className="w-5 h-5 me-3 text-slate-300" />
                    {label}
                </div>
            )}
        </div>
    );
};

// ─── Sidebar Navigation Content (shared between desktop & mobile) ────────────

function SidebarContent({
    isCollapsed,
    menuGroups,
    scrollRef,
    onNavigate,
}: {
    isCollapsed: boolean;
    menuGroups: { title: string; items: MenuItemProps[] }[];
    scrollRef: React.RefObject<HTMLDivElement>;
    onNavigate?: () => void;
}) {
    return (
        <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto min-h-0 max-h-full pb-4 custom-scrollbar"
        >
            {menuGroups.map((group) => (
                <div key={group.title} className={isCollapsed ? 'mb-2' : 'mb-4'}>
                    {!isCollapsed && group.title && (
                        <h5 className="px-4 text-[10px] font-medium text-slate-300 uppercase tracking-[0.2em]">
                            {group.title}
                        </h5>
                    )}
                    {isCollapsed && group.title && (
                        <div className="h-px bg-slate-100 mx-4 mb-2 opacity-50" />
                    )}
                    {group.items.map((item) => (
                        <NavMenu
                            key={item.label}
                            label={item.label}
                            icon={item.icon}
                            href={item.href}
                            active={item.active}
                            children={item.children}
                            isCollapsed={isCollapsed}
                            onNavigate={onNavigate}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

// ─── Main Sidebar Export ─────────────────────────────────────────────────────

interface SidebarProps {
    isCollapsed: boolean;
    isMobileOpen: boolean;
    onCloseMobile: () => void;
}

export default function Sidebar({ isCollapsed, isMobileOpen, onCloseMobile }: SidebarProps) {
    const { auth } = usePage().props as any;
    const isAdmin = auth?.user?.peran === 'admin';
    const scrollRef = useRef<HTMLDivElement>(null);
    const mobileScrollRef = useRef<HTMLDivElement>(null);

    // Persist scroll position across navigations (remounts)
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const savedScroll = sessionStorage.getItem('sidebar-scroll-pos');
        if (savedScroll) {
            el.scrollTop = parseInt(savedScroll, 10);
        }

        const handleScroll = () => {
            sessionStorage.setItem('sidebar-scroll-pos', el.scrollTop.toString());
        };

        el.addEventListener('scroll', handleScroll);
        return () => el.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when mobile sidebar is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileOpen]);

    const menuGroups: {
        title: string;
        items: MenuItemProps[];
    }[] = [
            {
                title: '',
                items: [
                    { label: 'Dashboard', icon: LayoutGrid, href: route('dashboard'), active: route().current('dashboard') },
                ]
            },
            {
                title: 'Operasional',
                items: [
                    { label: 'Setoran Sampah', icon: Recycle, href: route('operasional.setoran.index'), active: route().current('operasional.setoran.*') },
                    { label: 'Tukar Poin', icon: Wallet, href: route('operasional.tukar-poin'), active: route().current('operasional.tukar-poin') },
                    { label: 'Stok Sembako', icon: Package, href: route('operasional.stok-sembako'), active: route().current('operasional.stok-sembako') },
                ]
            },
            {
                title: 'Analitik',
                items: [
                    { label: 'Laporan Transaksi', icon: LineChart, href: route('analitik.laporan'), active: route().current('analitik.laporan') },
                ]
            },
            {
                title: 'Member',
                items: [
                    { label: 'Member', icon: Users, href: route('master.nasabah.index'), active: route().current('master.nasabah.*') },
                ]
            },
            {
                title: 'Master Data',
                items: [
                    {
                        label: 'Master Data',
                        icon: Database,
                        active: route().current('master.sampah.*') || route().current('master.pos-lokasi.*') || route().current('master.reward.*'),
                        children: [
                            { label: 'Sembako', href: route('master.reward.index'), active: route().current('master.reward.*') },
                            { label: 'Kategori Sampah', href: route('master.sampah.index'), active: route().current('master.sampah.*') },
                            { label: 'Pos Unit', href: route('master.pos-lokasi.index'), active: route().current('master.pos-lokasi.*') },
                        ]
                    },
                ]
            },
            {
                title: 'Sistem',
                items: [
                    {
                        label: 'Staff & Petugas',
                        icon: Users,
                        href: route('master.staff.index'),
                        active: route().current('master.staff.*'),
                    },
                    {
                        label: 'Pengaturan',
                        icon: Settings,
                        active: route().current('sistem.pengaturan.*'),
                        children: [
                            { label: 'Penukaran Poin', href: route('sistem.pengaturan.penukaran-poin'), active: route().current('sistem.pengaturan.penukaran-poin') },
                        ]
                    },
                    ...(isAdmin ? [{
                        label: 'Log Aktivitas',
                        icon: ShieldCheck,
                        href: route('sistem.log-aktivitas'),
                        active: route().current('sistem.log-aktivitas'),
                    }] : []),
                ]
            }
        ];

    return (
        <>
            {/* ─── Desktop Sidebar ─────────────────────────────────────────── */}
            <aside className={`fixed inset-y-0 left-0 z-50 ${isCollapsed ? 'w-20' : 'w-60'} h-screen bg-white border-e border-slate-200 hidden lg:flex flex-col transition-all duration-300 ease-in-out`}>
                {/* Header / Logo */}
                <div className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-5'} h-20 border-b border-slate-100 gap-3 bg-white shrink-0 overflow-hidden`}>
                    <img
                        src="/images/logo-sankara.webp"
                        alt="Logo Sankara"
                        className={`object-contain shrink-0 ${isCollapsed ? 'w-10 h-10' : 'h-12 w-auto max-w-[180px]'}`}
                    />
                </div>

                {/* Navigation */}
                <SidebarContent
                    isCollapsed={isCollapsed}
                    menuGroups={menuGroups}
                    scrollRef={scrollRef}
                />

                {/* Footer */}
                <div className={`p-4 border-t border-slate-100 flex items-center ${isCollapsed ? 'justify-center' : 'gap-1'} bg-white shrink-0 overflow-hidden`}>
                    {!isCollapsed && (
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                            Powered by
                        </span>
                    )}
                    <a
                        href="https://www.instagram.com/ahayde_hadd/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xs text-blue-600 hover:text-blue-800 transition-colors ${isCollapsed ? 'font-bold' : ''}`}
                    >
                        {isCollapsed ? 'H' : 'Had'}
                    </a>
                    {!isCollapsed && (
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                            &
                        </span>
                    )}
                    <a
                        href="https://www.instagram.com/dnisepr/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xs text-blue-600 hover:text-blue-800 transition-colors ${isCollapsed ? 'font-bold' : ''}`}
                    >
                        {isCollapsed ? 'N' : 'Noy'}
                    </a>
                </div>
            </aside>

            {/* ─── Mobile Sidebar Overlay + Drawer ─────────────────────────── */}
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onCloseMobile}
            />

            {/* Drawer */}
            <aside
                className={`fixed inset-y-0 left-0 z-[70] w-72 h-screen bg-white border-e border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Header / Logo + Close */}
                <div className="flex items-center justify-between px-5 h-20 border-b border-slate-100 bg-white shrink-0">
                    <img
                        src="/images/logo-sankara.webp"
                        alt="Logo Sankara"
                        className="h-12 w-auto max-w-[180px] object-contain"
                    />
                    <button
                        onClick={onCloseMobile}
                        className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        aria-label="Tutup menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <SidebarContent
                    isCollapsed={false}
                    menuGroups={menuGroups}
                    scrollRef={mobileScrollRef}
                    onNavigate={onCloseMobile}
                />

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 flex items-center gap-1 bg-white shrink-0">
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                        Powered by
                    </span>
                    <a
                        href="https://www.instagram.com/ahayde_hadd/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        Had
                    </a>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                        &
                    </span>
                    <a
                        href="https://www.instagram.com/dnisepr/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        Noy
                    </a>
                </div>
            </aside>
        </>
    );
}
