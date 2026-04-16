import { usePage, Link, router } from '@inertiajs/react';
import {
    Bell, Search, Menu, X, Check, Trash2, CheckCheck,
    Recycle, Wallet, AlertTriangle, PackageX, UserPlus
} from 'lucide-react';
import Avatar from '@/Components/Avatar';
import { useState, useRef, useEffect, useCallback } from 'react';

interface Notification {
    id: string;
    type: string;
    icon: string;
    color: string;
    title: string;
    message: string;
    url: string;
    time: string;
}

interface Props {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
    onToggleMobile: () => void;
}

// Map icon string to component
const iconMap: Record<string, any> = {
    'recycle': Recycle,
    'wallet': Wallet,
    'alert-triangle': AlertTriangle,
    'package-x': PackageX,
    'user-plus': UserPlus,
};

// Map color to tailwind classes
const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-100' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-100' },
};

function formatTimeAgo(isoString: string): string {
    const now = new Date();
    const date = new Date(isoString);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);

    if (diffMin < 1) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffHour < 24) return `${diffHour} jam lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export default function Topbar({ isCollapsed, setIsCollapsed, onToggleMobile }: Props) {
    const { auth, notificationCount } = usePage().props as any;
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [localCount, setLocalCount] = useState<number>(notificationCount || 0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Sync from server-side count
    useEffect(() => {
        setLocalCount(notificationCount || 0);
    }, [notificationCount]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Fetch notifications when dropdown opens
    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await (window as any).axios.get(route('notifications.index'));
            const data = response.data;
            setNotifications(data.notifications || []);
            setLocalCount(data.count || 0);
        } catch (e) {
            console.error('Failed to fetch notifications', e);
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleDropdown = () => {
        const next = !isOpen;
        setIsOpen(next);
        if (next) {
            fetchNotifications();
        }
    };

    // Dismiss single notification
    const handleDismiss = async (e: React.MouseEvent, notifId: string) => {
        e.stopPropagation();
        e.preventDefault();

        // Optimistic update
        setNotifications(prev => prev.filter(n => n.id !== notifId));
        setLocalCount(prev => Math.max(0, prev - 1));

        try {
            await (window as any).axios.post(route('notifications.dismiss'), { id: notifId });
        } catch (e) {
            console.error('Failed to dismiss notification', e);
            fetchNotifications(); // Rollback
        }
    };

    // Dismiss all notifications
    const handleDismissAll = async () => {
        // Optimistic update
        setNotifications([]);
        setLocalCount(0);

        try {
            await (window as any).axios.post(route('notifications.dismiss-all'));
        } catch (e) {
            console.error('Failed to dismiss all notifications', e);
            fetchNotifications(); // Rollback
        }
    };

    // Mark all read
    const handleMarkAllRead = async () => {
        // Optimistic update - reset counter
        setLocalCount(0);

        try {
            await (window as any).axios.post(route('notifications.mark-all-read'));
        } catch (e) {
            console.error('Failed to mark all read', e);
            fetchNotifications(); // Rollback
        }
    };

    // Navigate to notification URL
    const handleNotificationClick = (notif: Notification) => {
        setIsOpen(false);
        router.visit(notif.url);
    };

    return (
        <header className={`fixed top-0 right-0 left-0 ${isCollapsed ? 'lg:left-20' : 'lg:left-60'} z-30 bg-white border-b border-slate-100 py-3 transition-all duration-300 ease-in-out`}>
            {/* Mobile Search Overlay */}
            {isMobileSearchOpen && (
                <div className="absolute inset-0 bg-white z-40 flex items-center px-4 md:hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="relative flex-1 flex items-center">
                        <Search className="absolute left-4 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari data transaksi..."
                            className="w-full ps-12 pe-12 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:ring-1 focus:ring-sankara-green/20 focus:border-sankara-green transition-all duration-100 outline-none"
                            autoFocus
                        />
                        <button 
                            onClick={() => setIsMobileSearchOpen(false)} 
                            className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between h-full px-4 sm:px-8">
                <div className="flex items-center space-x-4 sm:space-x-6">
                    {/* Mobile: open sidebar drawer */}
                    <button
                        onClick={onToggleMobile}
                        className="-ms-1 p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors lg:hidden"
                        aria-label="Buka menu navigasi"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Desktop: toggle collapse */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="-ms-1 p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors hidden lg:block"
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="relative hidden md:block">
                        <span className="absolute inset-y-0 left-0 flex items-center ps-4">
                            <Search className="w-4 h-4 text-slate-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Cari data transaksi..."
                            className="ps-12 pe-4 py-1.5 w-80 text-sm bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:ring-1 focus:ring-sankara-green/20 focus:border-sankara-green transition-all duration-100"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* ─── Mobile Search Toggle ─── */}
                    <button
                        onClick={() => setIsMobileSearchOpen(true)}
                        className="p-2 text-slate-400 hover:text-sankara-green hover:bg-slate-50 rounded-lg transition-colors md:hidden"
                        aria-label="Toggle search"
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {/* ─── Bell Notification ─── */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={toggleDropdown}
                            className={`relative p-2 transition-colors duration-200 rounded-lg ${isOpen
                                ? 'bg-sankara-green/10 text-sankara-green'
                                : 'text-slate-400 hover:text-sankara-green hover:bg-slate-50'
                                }`}
                            aria-label="Notifikasi"
                        >
                            <Bell className="w-5 h-5" />
                            {localCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white leading-none">
                                    {localCount > 99 ? '99+' : localCount}
                                </span>
                            )}
                        </button>

                        {/* Dropdown */}
                        {isOpen && (
                            <div className="absolute -right-12 sm:right-0 top-full mt-2 w-[340px] max-w-[90vw] sm:max-w-none sm:w-[380px] max-h-[480px] bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                {/* Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-slate-800">Notifikasi</h3>
                                        {localCount > 0 && (
                                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-full">
                                                {localCount}
                                            </span>
                                        )}
                                    </div>
                                    {notifications.length > 0 && (
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            {localCount > 0 && (
                                                <button
                                                    onClick={handleMarkAllRead}
                                                    className="flex items-center gap-1.5 text-slate-400 hover:text-sankara-green transition-colors"
                                                    title="Tandai semua dibaca"
                                                >
                                                    <CheckCheck className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                                                    <span className="text-[11px] font-semibold hidden sm:block">Tandai Dibaca</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={handleDismissAll}
                                                className="flex items-center gap-1.5 text-slate-400 hover:text-sankara-danger transition-colors"
                                                title="Hapus semua notifikasi"
                                            >
                                                <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                                                <span className="text-[11px] font-semibold hidden sm:block">Hapus</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="overflow-y-auto max-h-[380px] custom-scrollbar">
                                    {loading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="w-6 h-6 border-2 border-slate-200 border-t-sankara-green rounded-full animate-spin" />
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 px-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                                <Bell className="w-4 h-4 text-slate-300" />
                                            </div>
                                            <p className="text-xs font-medium text-slate-400">Tidak ada notifikasi</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-50">
                                            {notifications.map((notif) => {
                                                const IconComponent = iconMap[notif.icon] || Bell;
                                                const colors = colorMap[notif.color] || colorMap.blue;

                                                return (
                                                    <div
                                                        key={notif.id}
                                                        onClick={() => handleNotificationClick(notif)}
                                                        className="group flex items-start gap-3 px-4 py-3 hover:bg-slate-50/80 cursor-pointer transition-colors relative"
                                                    >
                                                        {/* Icon */}
                                                        <div className={`shrink-0 w-9 h-9 rounded-lg ${colors.bg} ${colors.text} ring-1 ${colors.ring} flex items-center justify-center mt-0.5`}>
                                                            <IconComponent className="w-4 h-4" />
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[13px] font-semibold text-slate-800 leading-tight">
                                                                {notif.title}
                                                            </p>
                                                            <p className="text-xs text-slate-500 mt-0.5 leading-snug truncate">
                                                                {notif.message}
                                                            </p>
                                                            <p className="text-[10px] text-slate-300 mt-1 font-medium">
                                                                {formatTimeAgo(notif.time)}
                                                            </p>
                                                        </div>

                                                        {/* Dismiss single */}
                                                        <button
                                                            onClick={(e) => handleDismiss(e, notif.id)}
                                                            className="shrink-0 p-1 rounded-md text-slate-300 opacity-100 hover:text-red-500 hover:bg-red-50 transition-all"
                                                            title="Hapus notifikasi"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                    <Link href={route('profile.show')} className="flex items-center group transition duration-150 ease-in-out">
                        <div className="text-right me-4 hidden sm:block">
                            <div className="text-sm font-bold text-slate-800 group-hover:text-sankara-green transition-colors">{auth.user.profil?.nama || auth.user.email}</div>
                            <div className="text-[9px] text-gray-400 tracking-widest">{auth.user.peran}</div>
                        </div>
                        <Avatar
                            src={auth.user.profil?.foto_profil ? `/storage/${auth.user.profil.foto_profil}` : null}
                            name={auth.user.profil?.nama}
                            size="sm"
                            className="transition-all"
                        />
                    </Link>
                </div>
            </div>
        </header>
    );
}
