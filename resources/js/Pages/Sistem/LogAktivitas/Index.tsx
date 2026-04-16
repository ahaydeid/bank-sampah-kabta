import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { Table, THead, TBody, TR, TH, TD, Pagination, TableSearch, PerPageSelector } from '@/Components/Base/Table';
import { LogIn, FileText, Eye, X, Trash2, AlertTriangle, Filter, Calendar } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LoginLogItem {
    id: number;
    nama_user: string;
    event: string;
    ip_address: string | null;
    user_agent: string | null;
    status: string;
    created_at: string;
}

interface ActivityLogItem {
    id: number;
    nama_user: string;
    modul: string;
    aksi: string;
    deskripsi: string;
    data_lama: Record<string, any> | null;
    data_baru: Record<string, any> | null;
    ip_address: string | null;
    created_at: string;
}

interface PaginatedData<T> {
    data: T[];
    links: any[];
    current_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
    last_page: number;
}

interface FilterOptions {
    events: string[];
    statuses: string[];
    moduls: string[];
    aksis: string[];
}

interface Props {
    loginLogs: PaginatedData<LoginLogItem>;
    activityLogs: PaginatedData<ActivityLogItem>;
    filterOptions: FilterOptions;
    filters: {
        search_login: string;
        search_activity: string;
        per_page_login: number;
        per_page_activity: number;
        filter_event: string;
        filter_status: string;
        filter_modul: string;
        filter_aksi: string;
        date_from: string;
        date_to: string;
    };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateTime(dts: string): string {
    if (!dts) return '-';
    const d = new Date(dts);
    return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }) + ', ' + d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function eventLabel(event: string): string {
    switch (event) {
        case 'login': return 'Login';
        case 'logout': return 'Logout';
        case 'login_gagal': return 'Login Gagal';
        default: return event;
    }
}

function aksiLabel(aksi: string): string {
    switch (aksi) {
        case 'dibuat': return 'Dibuat';
        case 'diperbarui': return 'Diperbarui';
        case 'dihapus': return 'Dihapus';
        default: return aksi;
    }
}

/** Map class_basename ke label yang mudah dibaca */
const modulLabelMap: Record<string, string> = {
    TransaksiSetor: 'Setoran Sampah',
    TransaksiTukar: 'Tukar Poin',
    RewardStok: 'Stok Sembako',
    Sampah: 'Kategori Sampah',
    Reward: 'Sembako',
    PosLokasi: 'Pos Unit',
    Pengguna: 'Pengguna',
    Profil: 'Profil',
    Setting: 'Pengaturan',
};

function modulLabel(modul: string): string {
    return modulLabelMap[modul] || modul;
}

// ─── Badge Components ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const isSuccess = status === 'berhasil';
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${isSuccess
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : 'bg-red-50 text-red-700 ring-1 ring-red-200'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {isSuccess ? 'Berhasil' : 'Gagal'}
        </span>
    );
}

function EventBadge({ event }: { event: string }) {
    const styles: Record<string, string> = {
        login: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
        logout: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
        login_gagal: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${styles[event] || 'bg-slate-100 text-slate-600'}`}>
            {eventLabel(event)}
        </span>
    );
}

function AksiBadge({ aksi }: { aksi: string }) {
    const styles: Record<string, string> = {
        dibuat: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
        diperbarui: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
        dihapus: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${styles[aksi] || 'bg-slate-100 text-slate-600'}`}>
            {aksiLabel(aksi)}
        </span>
    );
}

// ─── Select Filter Component ─────────────────────────────────────────────────

function FilterSelect({
    value,
    onChange,
    options,
    placeholder,
    labelFn,
}: {
    value: string;
    onChange: (val: string) => void;
    options: string[];
    placeholder: string;
    labelFn?: (val: string) => string;
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`border border-slate-200 rounded-sm py-1.5 px-3 text-xs min-w-[120px] focus:border-sankara-green outline-none bg-white cursor-pointer transition-colors ${value ? 'text-sankara-green font-semibold ring-1 ring-sankara-green/20' : 'text-slate-500'
                }`}
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt} value={opt}>
                    {labelFn ? labelFn(opt) : opt}
                </option>
            ))}
        </select>
    );
}

// ─── Date Range Filter ───────────────────────────────────────────────────────

function DateRangeFilter({
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
}: {
    dateFrom: string;
    dateTo: string;
    onDateFromChange: (val: string) => void;
    onDateToChange: (val: string) => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                className="border border-slate-200 rounded-sm py-1.5 px-2 text-xs focus:border-sankara-green outline-none bg-white transition-colors"
                placeholder="Dari"
            />
            <span className="text-xs text-slate-400">—</span>
            <input
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                className="border border-slate-200 rounded-sm py-1.5 px-2 text-xs focus:border-sankara-green outline-none bg-white transition-colors"
                placeholder="Sampai"
            />
        </div>
    );
}

// ─── Confirm Delete Modal ────────────────────────────────────────────────────

function ConfirmModal({
    title,
    message,
    isProcessing,
    onConfirm,
    onCancel,
}: {
    title: string;
    message: string;
    isProcessing: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onCancel}>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            <div
                className="relative bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
                            <p className="text-sm text-slate-500 mt-1">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
                    <button
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isProcessing && (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        )}
                        Hapus
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Login Detail Modal ──────────────────────────────────────────────────────

function LoginDetailModal({ item, onClose }: { item: LoginLogItem; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            <div
                className="relative bg-white rounded-sm shadow-2xl w-full max-w-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Detail Login</h3>
                    <button onClick={onClose} className="p-1.5 rounded-sm hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="px-4 py-2.5 font-medium text-slate-500 bg-slate-50 w-1/3 text-xs uppercase tracking-wide">Nama User</td>
                                    <td className="px-4 py-2.5 text-slate-800 text-xs font-semibold">{item.nama_user}</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2.5 font-medium text-slate-500 bg-slate-50 w-1/3 text-xs uppercase tracking-wide">Event</td>
                                    <td className="px-4 py-2.5"><EventBadge event={item.event} /></td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2.5 font-medium text-slate-500 bg-slate-50 w-1/3 text-xs uppercase tracking-wide">Status</td>
                                    <td className="px-4 py-2.5"><StatusBadge status={item.status} /></td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2.5 font-medium text-slate-500 bg-slate-50 w-1/3 text-xs uppercase tracking-wide">IP Address</td>
                                    <td className="px-4 py-2.5 text-xs"><code className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{item.ip_address || '-'}</code></td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2.5 font-medium text-slate-500 bg-slate-50 w-1/3 text-xs uppercase tracking-wide">User Agent</td>
                                    <td className="px-4 py-2.5 text-xs text-slate-600 break-all leading-relaxed">{item.user_agent || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2.5 font-medium text-slate-500 bg-slate-50 w-1/3 text-xs uppercase tracking-wide">Waktu</td>
                                    <td className="px-4 py-2.5 text-xs text-slate-600">{formatDateTime(item.created_at)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Activity Detail Modal ───────────────────────────────────────────────────

function ActivityDetailModal({ item, onClose }: { item: ActivityLogItem; onClose: () => void }) {
    const dataLama = item.data_lama || {};
    const dataBaru = item.data_baru || {};
    const allKeys = Array.from(new Set([...Object.keys(dataLama), ...Object.keys(dataBaru)]));
    const excludedKeys = ['id', 'created_at', 'updated_at', 'password', 'remember_token'];
    const visibleKeys = allKeys.filter(k => !excludedKeys.includes(k));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            <div
                className="relative bg-white rounded-sm shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Detail Perubahan</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{item.deskripsi}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-sm hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 px-6 py-3 bg-white border-b border-slate-100 text-xs text-slate-500 shrink-0">
                    <span><strong className="text-slate-700">User:</strong> {item.nama_user}</span>
                    <span><strong className="text-slate-700">Modul:</strong> {modulLabel(item.modul)}</span>
                    <span><strong className="text-slate-700">Aksi:</strong> <AksiBadge aksi={item.aksi} /></span>
                    <span><strong className="text-slate-700">Waktu:</strong> {formatDateTime(item.created_at)}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {item.aksi === 'dibuat' && (
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Data Baru</h4>
                            <div className="bg-emerald-50/50 border border-emerald-200 rounded-sm overflow-hidden">
                                <table className="w-full text-sm">
                                    <tbody className="divide-y divide-emerald-100">
                                        {visibleKeys.map(key => (
                                            <tr key={key}>
                                                <td className="px-4 py-2 font-medium text-slate-600 bg-emerald-50 w-1/3 text-xs uppercase tracking-wide">{key}</td>
                                                <td className="px-4 py-2 text-emerald-800 text-xs break-all">{String(dataBaru[key] ?? '-')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {item.aksi === 'dihapus' && (
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Data Terhapus</h4>
                            <div className="bg-red-50/50 border border-red-200 rounded-sm overflow-hidden">
                                <table className="w-full text-sm">
                                    <tbody className="divide-y divide-red-100">
                                        {visibleKeys.map(key => (
                                            <tr key={key}>
                                                <td className="px-4 py-2 font-medium text-slate-600 bg-red-50 w-1/3 text-xs uppercase tracking-wide">{key}</td>
                                                <td className="px-4 py-2 text-red-800 text-xs break-all line-through">{String(dataLama[key] ?? '-')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {item.aksi === 'diperbarui' && (
                        <div className="space-y-2">
                            <div className="grid grid-cols-1 gap-0 border border-slate-200 rounded-sm overflow-hidden">
                                <div className="grid grid-cols-3 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <div className="px-4 py-2.5 border-r border-slate-200">Field</div>
                                    <div className="px-4 py-2.5 border-r border-slate-200 text-red-500">Sebelum</div>
                                    <div className="px-4 py-2.5 text-emerald-600">Sesudah</div>
                                </div>
                                {visibleKeys.map((key, i) => (
                                    <div key={key} className={`grid grid-cols-3 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                        <div className="px-4 py-2.5 border-r border-slate-100 text-xs font-medium text-slate-600 uppercase tracking-wide">{key}</div>
                                        <div className="px-4 py-2.5 border-r border-slate-100 text-xs text-red-600 break-all">
                                            {String(dataLama[key] ?? '-')}
                                        </div>
                                        <div className="px-4 py-2.5 text-xs text-emerald-700 break-all font-medium">
                                            {String(dataBaru[key] ?? '-')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {visibleKeys.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-8">Tidak ada detail perubahan.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Checkbox Component ──────────────────────────────────────────────────────

function Checkbox({ checked, indeterminate, onChange }: { checked: boolean; indeterminate?: boolean; onChange: (checked: boolean) => void }) {
    return (
        <input
            type="checkbox"
            checked={checked}
            ref={(el) => { if (el) el.indeterminate = indeterminate ?? false; }}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-sankara-green focus:ring-sankara-green/30 cursor-pointer transition-colors"
        />
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function LogAktivitasIndex({ loginLogs, activityLogs, filterOptions: rawFilterOptions, filters }: Props) {
    const filterOptions: FilterOptions = rawFilterOptions ?? { events: [], statuses: [], moduls: [], aksis: [] };
    const [activeTab, setActiveTab] = useState<'login' | 'activity'>('login');
    const [searchLogin, setSearchLogin] = useState(filters.search_login || '');
    const [searchActivity, setSearchActivity] = useState(filters.search_activity || '');
    const [perPageLogin, setPerPageLogin] = useState(filters.per_page_login || 10);
    const [perPageActivity, setPerPageActivity] = useState(filters.per_page_activity || 10);

    // Filter states
    const [filterEvent, setFilterEvent] = useState(filters.filter_event || '');
    const [filterStatus, setFilterStatus] = useState(filters.filter_status || '');
    const [filterModul, setFilterModul] = useState(filters.filter_modul || '');
    const [filterAksi, setFilterAksi] = useState(filters.filter_aksi || '');

    // Date range
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    // Selection state
    const [selectedLoginIds, setSelectedLoginIds] = useState<number[]>([]);
    const [selectedActivityIds, setSelectedActivityIds] = useState<number[]>([]);

    // Detail modals
    const [loginDetailItem, setLoginDetailItem] = useState<LoginLogItem | null>(null);
    const [activityDetailItem, setActivityDetailItem] = useState<ActivityLogItem | null>(null);

    // Confirm modal
    const [confirmModal, setConfirmModal] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // ─── Unified fetch helper ─────────────────────────────────────────
    const fetchData = useCallback((overrides: Record<string, any> = {}) => {
        const params = {
            search_login: searchLogin,
            per_page_login: perPageLogin,
            search_activity: searchActivity,
            per_page_activity: perPageActivity,
            filter_event: filterEvent,
            filter_status: filterStatus,
            filter_modul: filterModul,
            filter_aksi: filterAksi,
            date_from: dateFrom,
            date_to: dateTo,
            ...overrides,
        };

        // Hapus param kosong agar URL bersih
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
        );

        router.get(route('sistem.log-aktivitas'), cleanParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [searchLogin, perPageLogin, searchActivity, perPageActivity, filterEvent, filterStatus, filterModul, filterAksi, dateFrom, dateTo]);

    // ─── Selection helpers (Login) ────────────────────────────────────
    const allLoginSelected = loginLogs.data.length > 0 && loginLogs.data.every(l => selectedLoginIds.includes(l.id));
    const someLoginSelected = loginLogs.data.some(l => selectedLoginIds.includes(l.id));

    const toggleLoginSelectAll = (checked: boolean) => {
        setSelectedLoginIds(checked ? loginLogs.data.map(l => l.id) : []);
    };

    const toggleLoginSelect = (id: number, checked: boolean) => {
        setSelectedLoginIds(prev => checked ? [...prev, id] : prev.filter(x => x !== id));
    };

    // ─── Selection helpers (Activity) ─────────────────────────────────
    const allActivitySelected = activityLogs.data.length > 0 && activityLogs.data.every(l => selectedActivityIds.includes(l.id));
    const someActivitySelected = activityLogs.data.some(l => selectedActivityIds.includes(l.id));

    const toggleActivitySelectAll = (checked: boolean) => {
        setSelectedActivityIds(checked ? activityLogs.data.map(l => l.id) : []);
    };

    const toggleActivitySelect = (id: number, checked: boolean) => {
        setSelectedActivityIds(prev => checked ? [...prev, id] : prev.filter(x => x !== id));
    };

    // ─── Filter handlers (Login) ──────────────────────────────────────

    const handleSearchLogin = (val: string) => {
        setSearchLogin(val);
        setSelectedLoginIds([]);
        fetchData({ search_login: val });
    };

    const handlePerPageLogin = (val: number) => {
        setPerPageLogin(val);
        setSelectedLoginIds([]);
        fetchData({ per_page_login: val });
    };

    const handleFilterEvent = (val: string) => {
        setFilterEvent(val);
        setSelectedLoginIds([]);
        fetchData({ filter_event: val });
    };

    const handleFilterStatus = (val: string) => {
        setFilterStatus(val);
        setSelectedLoginIds([]);
        fetchData({ filter_status: val });
    };

    // ─── Filter handlers (Activity) ───────────────────────────────────

    const handleSearchActivity = (val: string) => {
        setSearchActivity(val);
        setSelectedActivityIds([]);
        fetchData({ search_activity: val });
    };

    const handlePerPageActivity = (val: number) => {
        setPerPageActivity(val);
        setSelectedActivityIds([]);
        fetchData({ per_page_activity: val });
    };

    const handleFilterModul = (val: string) => {
        setFilterModul(val);
        setSelectedActivityIds([]);
        fetchData({ filter_modul: val });
    };

    const handleFilterAksi = (val: string) => {
        setFilterAksi(val);
        setSelectedActivityIds([]);
        fetchData({ filter_aksi: val });
    };

    // ─── Date range handlers ─────────────────────────────────────────

    const handleDateFrom = (val: string) => {
        setDateFrom(val);
        fetchData({ date_from: val });
    };

    const handleDateTo = (val: string) => {
        setDateTo(val);
        fetchData({ date_to: val });
    };

    // ─── Delete handlers ──────────────────────────────────────────────

    const handleDeleteLoginSingle = (id: number) => {
        setConfirmModal({
            title: 'Hapus Log Login',
            message: 'Apakah Anda yakin ingin menghapus log login ini? Tindakan ini tidak dapat dibatalkan.',
            onConfirm: () => {
                setIsProcessing(true);
                router.delete(route('sistem.log-aktivitas.login.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => { setConfirmModal(null); setIsProcessing(false); setSelectedLoginIds(prev => prev.filter(x => x !== id)); },
                    onError: () => setIsProcessing(false),
                });
            },
        });
    };

    const handleBulkDeleteLogin = () => {
        setConfirmModal({
            title: 'Hapus Log Login Terpilih',
            message: `Apakah Anda yakin ingin menghapus ${selectedLoginIds.length} log login? Tindakan ini tidak dapat dibatalkan.`,
            onConfirm: () => {
                setIsProcessing(true);
                router.post(route('sistem.log-aktivitas.login.mass-destroy'), { ids: selectedLoginIds }, {
                    preserveScroll: true,
                    onSuccess: () => { setConfirmModal(null); setIsProcessing(false); setSelectedLoginIds([]); },
                    onError: () => setIsProcessing(false),
                });
            },
        });
    };

    const handleDeleteActivitySingle = (id: number) => {
        setConfirmModal({
            title: 'Hapus Log Aktivitas',
            message: 'Apakah Anda yakin ingin menghapus log aktivitas ini? Tindakan ini tidak dapat dibatalkan.',
            onConfirm: () => {
                setIsProcessing(true);
                router.delete(route('sistem.log-aktivitas.activity.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => { setConfirmModal(null); setIsProcessing(false); setSelectedActivityIds(prev => prev.filter(x => x !== id)); },
                    onError: () => setIsProcessing(false),
                });
            },
        });
    };

    const handleBulkDeleteActivity = () => {
        setConfirmModal({
            title: 'Hapus Log Aktivitas Terpilih',
            message: `Apakah Anda yakin ingin menghapus ${selectedActivityIds.length} log aktivitas? Tindakan ini tidak dapat dibatalkan.`,
            onConfirm: () => {
                setIsProcessing(true);
                router.post(route('sistem.log-aktivitas.activity.mass-destroy'), { ids: selectedActivityIds }, {
                    preserveScroll: true,
                    onSuccess: () => { setConfirmModal(null); setIsProcessing(false); setSelectedActivityIds([]); },
                    onError: () => setIsProcessing(false),
                });
            },
        });
    };

    // ─── Active filter count helpers ──────────────────────────────────
    const loginActiveFilters = [filterEvent, filterStatus, dateFrom, dateTo].filter(Boolean).length;
    const activityActiveFilters = [filterModul, filterAksi, dateFrom, dateTo].filter(Boolean).length;

    const tabs = [
        { id: 'login' as const, label: 'Riwayat Login', icon: LogIn, count: loginLogs.total },
        { id: 'activity' as const, label: 'Riwayat Perubahan Data', icon: FileText, count: activityLogs.total },
    ];

    return (
        <AuthenticatedLayout header="Log Aktivitas">
            <Head title="Log Aktivitas" />

            <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-slate-200">
                    <nav className="flex" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    id={`tab-${tab.id}`}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all duration-200 border-b-2 ${isActive
                                            ? 'border-sankara-green text-sankara-green bg-green-50/30'
                                            : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                    <span className={`inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold rounded-full ${isActive ? 'bg-sankara-green text-white' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-4 sm:p-6">

                    {/* ─── Tab: Riwayat Login ────────────────────────────────── */}
                    {activeTab === 'login' && (
                        <div>
                            {/* Toolbar: Search + Filters */}
                            <div className="flex flex-col gap-3 mb-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <TableSearch
                                            value={searchLogin}
                                            onChange={handleSearchLogin}
                                            placeholder="Cari nama atau IP..."
                                        />
                                        {selectedLoginIds.length > 0 && (
                                            <button
                                                onClick={handleBulkDeleteLogin}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Hapus ({selectedLoginIds.length})
                                            </button>
                                        )}
                                    </div>
                                    <PerPageSelector value={perPageLogin} onChange={handlePerPageLogin} />
                                </div>

                                {/* Filter Row */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Filter className="w-3.5 h-3.5" />
                                        <span className="font-medium">Filter:</span>
                                    </div>
                                    <FilterSelect
                                        value={filterEvent}
                                        onChange={handleFilterEvent}
                                        options={filterOptions.events}
                                        placeholder="Semua Event"
                                        labelFn={eventLabel}
                                    />
                                    <FilterSelect
                                        value={filterStatus}
                                        onChange={handleFilterStatus}
                                        options={filterOptions.statuses}
                                        placeholder="Semua Status"
                                        labelFn={(s) => s === 'berhasil' ? 'Berhasil' : 'Gagal'}
                                    />
                                    <DateRangeFilter
                                        dateFrom={dateFrom}
                                        dateTo={dateTo}
                                        onDateFromChange={handleDateFrom}
                                        onDateToChange={handleDateTo}
                                    />
                                    {loginActiveFilters > 0 && (
                                        <button
                                            onClick={() => { setFilterEvent(''); setFilterStatus(''); setDateFrom(''); setDateTo(''); fetchData({ filter_event: '', filter_status: '', date_from: '', date_to: '' }); }}
                                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>

                            <Table>
                                <THead>
                                    <tr className="transition-colors duration-150">
                                        <TH className="w-12 text-center">
                                            <Checkbox
                                                checked={allLoginSelected}
                                                indeterminate={someLoginSelected && !allLoginSelected}
                                                onChange={toggleLoginSelectAll}
                                            />
                                        </TH>
                                        <TH className="w-12 text-center">No</TH>
                                        <TH>Nama User</TH>
                                        <TH>Event</TH>
                                        <TH>Waktu</TH>
                                        <TH>IP Address</TH>
                                        <TH>Status</TH>
                                        <TH className="text-center">Aksi</TH>
                                    </tr>
                                </THead>
                                <TBody>
                                    {loginLogs.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-12 text-slate-400 text-sm">
                                                {loginActiveFilters > 0 ? 'Tidak ada data sesuai filter.' : 'Belum ada log login.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        loginLogs.data.map((log, i) => (
                                            <tr key={log.id} className={`transition-colors duration-150 ${selectedLoginIds.includes(log.id) ? 'bg-green-50/50' : 'hover:bg-slate-50'}`}>
                                                <TD className="text-center">
                                                    <Checkbox checked={selectedLoginIds.includes(log.id)} onChange={(c) => toggleLoginSelect(log.id, c)} />
                                                </TD>
                                                <TD className="text-center text-slate-400 font-medium">
                                                    {i + 1 + ((loginLogs.current_page - 1) * loginLogs.per_page)}
                                                </TD>
                                                <TD><span className="font-medium text-slate-700">{log.nama_user}</span></TD>
                                                <TD><EventBadge event={log.event} /></TD>
                                                <TD><span className="text-xs text-slate-500">{formatDateTime(log.created_at)}</span></TD>
                                                <TD><code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{log.ip_address || '-'}</code></TD>
                                                <TD><StatusBadge status={log.status} /></TD>
                                                <TD className="text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button onClick={() => setLoginDetailItem(log)} className="p-1.5 rounded-sm text-sankara-green hover:bg-sankara-green/10 transition-colors" title="Lihat Detail">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteLoginSingle(log.id)} className="p-1.5 rounded-sm text-red-500 hover:bg-red-50 transition-colors" title="Hapus">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </TD>
                                            </tr>
                                        ))
                                    )}
                                </TBody>
                            </Table>

                            {loginLogs.last_page > 1 && (
                                <Pagination
                                    links={loginLogs.links}
                                    meta={{
                                        current_page: loginLogs.current_page,
                                        from: loginLogs.from,
                                        to: loginLogs.to,
                                        total: loginLogs.total,
                                        per_page: loginLogs.per_page,
                                        last_page: loginLogs.last_page,
                                    }}
                                />
                            )}
                        </div>
                    )}

                    {/* ─── Tab: Riwayat Perubahan Data ────────────────────────── */}
                    {activeTab === 'activity' && (
                        <div>
                            {/* Toolbar: Search + Filters */}
                            <div className="flex flex-col gap-3 mb-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <TableSearch
                                            value={searchActivity}
                                            onChange={handleSearchActivity}
                                            placeholder="Cari user, modul, deskripsi..."
                                        />
                                        {selectedActivityIds.length > 0 && (
                                            <button
                                                onClick={handleBulkDeleteActivity}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Hapus ({selectedActivityIds.length})
                                            </button>
                                        )}
                                    </div>
                                    <PerPageSelector value={perPageActivity} onChange={handlePerPageActivity} />
                                </div>

                                {/* Filter Row */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Filter className="w-3.5 h-3.5" />
                                        <span className="font-medium">Filter:</span>
                                    </div>
                                    <FilterSelect
                                        value={filterModul}
                                        onChange={handleFilterModul}
                                        options={filterOptions.moduls}
                                        placeholder="Semua Modul"
                                        labelFn={modulLabel}
                                    />
                                    <FilterSelect
                                        value={filterAksi}
                                        onChange={handleFilterAksi}
                                        options={filterOptions.aksis}
                                        placeholder="Semua Aksi"
                                        labelFn={(a) => aksiLabel(a)}
                                    />
                                    <DateRangeFilter
                                        dateFrom={dateFrom}
                                        dateTo={dateTo}
                                        onDateFromChange={handleDateFrom}
                                        onDateToChange={handleDateTo}
                                    />
                                    {activityActiveFilters > 0 && (
                                        <button
                                            onClick={() => { setFilterModul(''); setFilterAksi(''); setDateFrom(''); setDateTo(''); fetchData({ filter_modul: '', filter_aksi: '', date_from: '', date_to: '' }); }}
                                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>

                            <Table>
                                <THead>
                                    <tr className="transition-colors duration-150">
                                        <TH className="w-12 text-center">
                                            <Checkbox
                                                checked={allActivitySelected}
                                                indeterminate={someActivitySelected && !allActivitySelected}
                                                onChange={toggleActivitySelectAll}
                                            />
                                        </TH>
                                        <TH className="w-12 text-center">No</TH>
                                        <TH>Nama User</TH>
                                        <TH>Modul</TH>
                                        <TH>Aksi</TH>
                                        <TH>Deskripsi</TH>
                                        <TH>Waktu</TH>
                                        <TH className="text-center">Aksi</TH>
                                    </tr>
                                </THead>
                                <TBody>
                                    {activityLogs.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-12 text-slate-400 text-sm">
                                                {activityActiveFilters > 0 ? 'Tidak ada data sesuai filter.' : 'Belum ada riwayat perubahan data.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        activityLogs.data.map((log, i) => (
                                            <tr key={log.id} className={`transition-colors duration-150 ${selectedActivityIds.includes(log.id) ? 'bg-green-50/50' : 'hover:bg-slate-50'}`}>
                                                <TD className="text-center">
                                                    <Checkbox checked={selectedActivityIds.includes(log.id)} onChange={(c) => toggleActivitySelect(log.id, c)} />
                                                </TD>
                                                <TD className="text-center text-slate-400 font-medium">
                                                    {i + 1 + ((activityLogs.current_page - 1) * activityLogs.per_page)}
                                                </TD>
                                                <TD><span className="font-medium text-slate-700">{log.nama_user}</span></TD>
                                                <TD>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                                                        {modulLabel(log.modul)}
                                                    </span>
                                                </TD>
                                                <TD><AksiBadge aksi={log.aksi} /></TD>
                                                <TD><span className="text-xs text-slate-600 line-clamp-2">{log.deskripsi}</span></TD>
                                                <TD><span className="text-xs text-slate-500">{formatDateTime(log.created_at)}</span></TD>
                                                <TD className="text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button onClick={() => setActivityDetailItem(log)} className="p-1.5 rounded-sm text-sankara-green hover:bg-sankara-green/10 transition-colors" title="Lihat Detail">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteActivitySingle(log.id)} className="p-1.5 rounded-sm text-red-500 hover:bg-red-50 transition-colors" title="Hapus">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </TD>
                                            </tr>
                                        ))
                                    )}
                                </TBody>
                            </Table>

                            {activityLogs.last_page > 1 && (
                                <Pagination
                                    links={activityLogs.links}
                                    meta={{
                                        current_page: activityLogs.current_page,
                                        from: activityLogs.from,
                                        to: activityLogs.to,
                                        total: activityLogs.total,
                                        per_page: activityLogs.per_page,
                                        last_page: activityLogs.last_page,
                                    }}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {loginDetailItem && <LoginDetailModal item={loginDetailItem} onClose={() => setLoginDetailItem(null)} />}
            {activityDetailItem && <ActivityDetailModal item={activityDetailItem} onClose={() => setActivityDetailItem(null)} />}
            {confirmModal && (
                <ConfirmModal
                    title={confirmModal.title}
                    message={confirmModal.message}
                    isProcessing={isProcessing}
                    onConfirm={confirmModal.onConfirm}
                    onCancel={() => { setConfirmModal(null); setIsProcessing(false); }}
                />
            )}
        </AuthenticatedLayout>
    );
}
