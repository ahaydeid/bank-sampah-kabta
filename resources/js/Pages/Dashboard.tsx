import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import {
    Users,
    Store,
    GraduationCap,
    BookOpen,
    BarChart3,
    Weight,
    ClipboardList,
    MapPin,
    Calendar,
    ChevronDown,
    Search,
    Filter
} from 'lucide-react';

interface TrendItem {
    pos_id: number;
    nama_pos: string;
    total_berat: number;
    total_transaksi: number;
    jumlah_member: number;
    jumlah_petugas: number;
}

interface DashboardProps {
    stats?: {
        totalMember: number;
        totalPetugas: number;
        totalPos: number;
        kategoriSampah: number;
        setoranStats: {
            [key: string]: {
                total: number;
                byStatus: { [key: string]: number };
            }
        };
        poinHariIni: {
            total: number;
            byCategory: Record<string, number>;
        };
        trendSetoran: TrendItem[];
        trendByKategori: Record<string, Record<string, number>>;
        allKategori: string[];
        aktivitasMember?: { name: string; pos: string[]; active: boolean }[];
        allPosUnits?: string[];
        topMembers?: { name: string; total_berat: number }[];
    };
    filters?: {
        timeRange: '7hari' | 'bulanan';
        month: number;
        year: number;
        aktivitasTime?: string;
    };
}

// --- Custom Internal Components ---

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) => (
    <div className={`${color} p-4 sm:p-6 rounded-xl relative overflow-hidden group transition-transform duration-300`}>
        <div className="relative z-10 flex flex-col justify-between h-full text-white">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">{label}</span>
            <h3 className="text-2xl sm:text-4xl font-bold mt-1">{value}</h3>
        </div>
        <div className="absolute top-1/2 -right-4 -translate-y-1/2 opacity-20 group-hover:scale-110 transition-transform duration-500">
            <Icon size={80} className="sm:w-[120px] sm:h-[120px]" strokeWidth={1} color="white" />
        </div>
    </div>
);

const KATEGORI_COLORS: Record<string, string> = {
    'Plastik': '#6366f1',
    'Kertas': '#f59e0b',
    'Logam': '#64748b',
    'Kaca': '#06b6d4',
    'Organik': '#22c55e',
    'Elektronik': '#ef4444',
    'Tekstil': '#ec4899',
    'B3': '#a855f7',
    'Lainnya': '#94a3b8',
};

const getKategoriColor = (kategori: string, index: number): string => {
    if (KATEGORI_COLORS[kategori]) return KATEGORI_COLORS[kategori];
    const fallback = ['#6366f1', '#f59e0b', '#22c55e', '#06b6d4', '#ef4444', '#ec4899', '#a855f7', '#64748b'];
    return fallback[index % fallback.length];
};

const CustomBarChart = ({ data, trendByKategori, allKategori }: {
    data: TrendItem[];
    trendByKategori: Record<string, Record<string, number>>;
    allKategori: string[];
}) => {
    const [activeBar, setActiveBar] = useState<number | null>(null);
    const [lastActiveBar, setLastActiveBar] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'berat' | 'kategori'>('berat');

    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center text-xs w-full h-48 sm:h-64 mt-4 text-slate-400">Belum ada data</div>;
    }

    const maxBerat = Math.max(...data.map(d => Number(d.total_berat)), 1);

    // For kategori stacked view
    const maxKategoriTotal = Math.max(
        ...data.map(d => {
            const cats = trendByKategori?.[String(d.pos_id)] || {};
            return Object.values(cats).reduce((sum, v) => sum + Number(v), 0);
        }),
        1
    );

    const chartHeight = 200;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 30;
    const paddingBottom = 40;
    const barCount = data.length || 1;

    // Dimensions
    const barWidth = 24;
    const gap = 36;
    const totalBarsWidth = barCount * (barWidth + gap) - gap;

    // Minimum internal width to keep text size stable (prevents huge text on desktop)
    const svgWidth = Math.max(800, paddingLeft + paddingRight + totalBarsWidth);
    const svgHeight = paddingTop + chartHeight + paddingBottom;

    // Start bars from the left
    const startX = paddingLeft + 10;

    const maxVal = viewMode === 'berat' ? maxBerat : maxKategoriTotal;
    const gridLines = 4;
    const gridValues = Array.from({ length: gridLines + 1 }, (_, i) => (maxVal / gridLines) * (gridLines - i));

    return (
        <div>
            {/* View Mode Toggle */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setViewMode('berat')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${viewMode === 'berat'
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                >
                    Total Berat
                </button>
                <button
                    onClick={() => setViewMode('kategori')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${viewMode === 'kategori'
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                >
                    Per Kategori
                </button>
            </div>

            {/* Kategori Legend */}
            {viewMode === 'kategori' && allKategori.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                    {allKategori.map((kat, i) => (
                        <div key={kat} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: getKategoriColor(kat, i) }} />
                            <span className="text-xs text-slate-500 font-medium">{kat}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Chart */}
            <div className="relative w-full overflow-x-auto -mx-2 px-2">
                <div style={{ minWidth: svgWidth }}>
                    <svg
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        className="w-full h-auto"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        {/* Grid lines + labels */}
                        {gridValues.map((val, i) => {
                            const y = paddingTop + (i / gridLines) * chartHeight;
                            return (
                                <g key={i}>
                                    <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="#f1f5f9" strokeDasharray="3 3" />
                                    <text x={paddingLeft - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#94a3b8">
                                        {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(1)}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Bottom axis line */}
                        <line x1={paddingLeft} y1={paddingTop + chartHeight} x2={svgWidth - paddingRight} y2={paddingTop + chartHeight} stroke="#e2e8f0" strokeWidth="1" />

                        {/* Bars */}
                        {data.map((item, idx) => {
                            const x = startX + idx * (barWidth + gap);
                            const isActive = activeBar === idx;

                            if (viewMode === 'berat') {
                                const barH = (Number(item.total_berat) / maxVal) * chartHeight;
                                const barY = paddingTop + chartHeight - barH;
                                return (
                                    <g
                                        key={idx}
                                        onClick={() => {
                                            setActiveBar(isActive ? null : idx);
                                            if (!isActive) setLastActiveBar(idx);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {/* Hover background */}
                                        <rect
                                            x={x - 8}
                                            y={paddingTop}
                                            width={barWidth + 16}
                                            height={chartHeight}
                                            fill={isActive ? '#f1f5f9' : 'transparent'}
                                            rx={4}
                                        />
                                        {/* Bar */}
                                        <rect
                                            x={x}
                                            y={barY}
                                            width={barWidth}
                                            height={Math.max(barH, 2)}
                                            rx={4}
                                            ry={4}
                                            fill="url(#barGradient)"
                                            opacity={activeBar === null || isActive ? 1 : 0.4}
                                        />
                                        {/* Value on top */}
                                        {Number(item.total_berat) > 0 && (
                                            <text
                                                x={x + barWidth / 2}
                                                y={barY - 8}
                                                textAnchor="middle"
                                                fontSize="10"
                                                fill="#4f46e5"
                                                fontWeight="bold"
                                            >
                                                {Number(item.total_berat).toFixed(1)} kg
                                            </text>
                                        )}
                                    </g>
                                );
                            } else {
                                // Stacked bar by kategori
                                const cats = trendByKategori?.[String(item.pos_id)] || {};
                                let cumHeight = 0;
                                const totalCat = Object.values(cats).reduce((s, v) => s + Number(v), 0);
                                return (
                                    <g
                                        key={idx}
                                        onClick={() => {
                                            setActiveBar(isActive ? null : idx);
                                            if (!isActive) setLastActiveBar(idx);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {/* Hover background */}
                                        <rect
                                            x={x - 8}
                                            y={paddingTop}
                                            width={barWidth + 16}
                                            height={chartHeight}
                                            fill={isActive ? '#f1f5f9' : 'transparent'}
                                            rx={4}
                                        />
                                        {allKategori.map((kat, ki) => {
                                            const val = Number(cats[kat] || 0);
                                            const segH = (val / maxVal) * chartHeight;
                                            const segY = paddingTop + chartHeight - cumHeight - segH;
                                            cumHeight += segH;
                                            if (segH <= 0) return null;
                                            const isLast = ki === allKategori.filter(k => Number(cats[k] || 0) > 0).length - 1;
                                            return (
                                                <rect
                                                    key={kat}
                                                    x={x}
                                                    y={segY}
                                                    width={barWidth}
                                                    height={segH}
                                                    rx={isLast ? 4 : 0}
                                                    ry={isLast ? 4 : 0}
                                                    fill={getKategoriColor(kat, ki)}
                                                    opacity={activeBar === null || isActive ? 1 : 0.4}
                                                />
                                            );
                                        })}
                                        {/* Total on top */}
                                        {totalCat > 0 && (
                                            <text
                                                x={x + barWidth / 2}
                                                y={paddingTop + chartHeight - cumHeight - 8}
                                                textAnchor="middle"
                                                fontSize="10"
                                                fill="#475569"
                                                fontWeight="bold"
                                            >
                                                {totalCat.toFixed(1)}
                                            </text>
                                        )}
                                    </g>
                                );
                            }
                        })}

                        {/* Pos unit labels */}
                        {data.map((item, idx) => {
                            const x = startX + idx * (barWidth + gap) + barWidth / 2;
                            const nameLower = item.nama_pos.toLowerCase();
                            const isPosUnit = nameLower.startsWith('pos unit');
                            const title = isPosUnit ? 'Pos Unit' : item.nama_pos;
                            const subtitle = isPosUnit ? item.nama_pos.substring(8).trim() : '';
                            const truncatedSubtitle = subtitle.length > 15 ? subtitle.substring(0, 14) + '…' : subtitle;

                            return (
                                <text
                                    key={idx}
                                    x={x}
                                    y={paddingTop + chartHeight + 15}
                                    textAnchor="middle"
                                    fontSize="9"
                                    fill="#64748b"
                                    fontWeight="600"
                                >
                                    <tspan x={x} dy="0">{title}</tspan>
                                    {subtitle && <tspan x={x} dy="12">{truncatedSubtitle}</tspan>}
                                </text>
                            );
                        })}

                        {/* Gradient definition */}
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#818cf8" />
                                <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>

            {/* Detail Info Card (Animated Dropdown) */}
            <div
                className={`grid transition-all duration-300 ease-in-out ${activeBar !== null ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 mt-0'}`}
            >
                <div className="overflow-hidden">
                    {(() => {
                        const targetIdx = activeBar !== null ? activeBar : lastActiveBar;
                        if (targetIdx === null || !data[targetIdx]) return null;
                        const targetData = data[targetIdx];
                        return (
                            <div className="p-2.5 sm:p-3 bg-slate-50 rounded-lg border border-slate-100 mb-2">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <MapPin size={14} className="text-indigo-500 shrink-0" />
                                    <span className="text-[11px] sm:text-xs font-bold text-slate-700 truncate">
                                        {targetData.nama_pos}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <Weight size={12} className="text-indigo-400 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[8px] sm:text-[9px] text-slate-400 uppercase leading-tight">Berat</p>
                                            <p className="text-[10px] sm:text-[11px] font-bold text-slate-700 truncate">{Number(targetData.total_berat).toFixed(2)} kg</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users size={12} className="text-emerald-400 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[8px] sm:text-[9px] text-slate-400 uppercase leading-tight">Member</p>
                                            <p className="text-[10px] sm:text-[11px] font-bold text-slate-700 truncate">{targetData.jumlah_member} org</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <ClipboardList size={12} className="text-cyan-400 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[8px] sm:text-[9px] text-slate-400 uppercase leading-tight">Transaksi</p>
                                            <p className="text-[10px] sm:text-[11px] font-bold text-slate-700 truncate">{targetData.total_transaksi}x</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Kategori breakdown */}
                                {trendByKategori?.[String(targetData.pos_id)] && (
                                    <div className="mt-2 pt-2 border-t border-slate-200">
                                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                                            {Object.entries(trendByKategori[String(targetData.pos_id)]).map(([kat, val], i) => (
                                                <div key={kat} className="flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ backgroundColor: getKategoriColor(kat, i) }} />
                                                    <span className="text-[9px] sm:text-[10px] text-slate-600">{kat}: <strong>{Number(val).toFixed(2)}kg</strong></span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Summary row - only Total Berat and Total Transaksi */}
            <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="bg-indigo-50 rounded-lg p-2 sm:p-3 text-center">
                    <p className="text-[9px] sm:text-[10px] text-indigo-400 uppercase font-bold">Total Berat</p>
                    <p className="text-sm sm:text-base font-bold text-indigo-600 leading-tight mt-0.5">
                        {data.reduce((s, d) => s + Number(d.total_berat), 0).toFixed(1)} kg
                    </p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-2 sm:p-3 text-center">
                    <p className="text-[9px] sm:text-[10px] text-emerald-400 uppercase font-bold">Total Transaksi</p>
                    <p className="text-sm sm:text-base font-bold text-emerald-600 leading-tight mt-0.5">
                        {data.reduce((s, d) => s + Number(d.total_transaksi), 0)}
                    </p>
                </div>
            </div>
        </div>
    );
};

const TopMembersBarChart = ({ data }: { data: { name: string, total_berat: number }[] }) => {
    const maxVal = Math.max(...data.map(d => d.total_berat), 1);

    return (
        <div className="flex flex-col h-full w-full">
            <h4 className="text-sm sm:text-md text-slate-700 font-semibold uppercase tracking-tight mb-4 sm:mb-6">
                Top Member Teraktif <span className="text-slate-400 italic normal-case text-xs tracking-normal"> (Berdasarkan Berat)</span>
            </h4>

            <div className="flex-1 flex flex-col justify-center space-y-4">
                {data.map((item, idx) => {
                    const percentage = (item.total_berat / maxVal) * 100;
                    return (
                        <div key={idx} className="relative w-full group">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-xs sm:text-sm font-semibold text-slate-700 truncate mr-4">
                                    <span className="text-slate-400 w-4 inline-block">{idx + 1}.</span> {item.name}
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-indigo-600">{item.total_berat.toFixed(1)} kg</span>
                            </div>
                            <div className="w-full h-2.5 sm:h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-indigo-500 to-indigo-400 group-hover:brightness-110"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const InteractiveSetoranChart = ({
    stats
}: {
    stats: { [key: string]: { total: number; byStatus: { [key: string]: number } } }
}) => {
    const [timeFilter, setTimeFilter] = useState('hari_ini');

    const currentStats = stats?.[timeFilter] || { total: 0, byStatus: {} };
    // Include 'tervalidasi' as fallback if there's old bad seeder data
    const berhasilCount = (currentStats.byStatus['berhasil'] || 0) + (currentStats.byStatus['tervalidasi'] || 0);
    const percentage = currentStats.total > 0 
        ? Math.round((berhasilCount / currentStats.total) * 100) 
        : 0;

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex items-center justify-between mb-4 sm:mb-8">
                <h4 className="text-sm sm:text-md text-slate-700 font-semibold uppercase tracking-tight">
                    Setoran Member
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded px-1 flex gap-2">
                    <select 
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="text-[9px] sm:text-[10px] font-bold text-slate-600 bg-transparent border-none py-1 pl-1 pr-5 focus:ring-0 cursor-pointer"
                    >
                        <option value="hari_ini">Hari Ini</option>
                        <option value="minggu_ini">Minggu Ini</option>
                        <option value="bulan_ini">Bulan Ini</option>
                        <option value="tahun_ini">Tahun Ini</option>
                    </select>
                </div>
            </div>

            <CustomDonutChart
                percentage={percentage}
                color="#10b981"
                label="BERHASIL"
            />
            
            <div className="mt-4 sm:mt-8 space-y-2 sm:space-y-3">
                {[
                    { label: 'Berhasil', key: 'berhasil', color: 'bg-emerald-500' },
                    { label: 'Dibatalkan', key: 'dibatalkan', color: 'bg-rose-500' },
                ].map(item => {
                    // Handle old seeder data that might use 'tervalidasi' instead of 'berhasil'
                    let count = currentStats.byStatus?.[item.key] || 0;
                    if (item.key === 'berhasil') {
                        count += currentStats.byStatus?.['tervalidasi'] || 0;
                    }
                    
                    return (
                        <div key={item.label} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                <span className="text-slate-500">{item.label}</span>
                            </div>
                            <span className="text-slate-800">{count}</span>
                        </div>
                    );
                })}
                <div className="pt-2 sm:pt-3 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-xs text-slate-800 uppercase font-medium">Total</span>
                    <span className="text-xs text-slate-800 font-medium">{(currentStats.total || 0).toLocaleString('id-ID')}</span>
                </div>
            </div>
        </div>
    );
};

const CustomDonutChart = ({ percentage, color, label }: { percentage: number, color: string, label: string }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                    <circle cx="64" cy="64" r={radius} fill="transparent" stroke={color} strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-2xl sm:text-4xl font-bold text-slate-800 leading-none">{percentage}%</span>
                    <span className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 sm:mt-2">{label}</span>
                </div>
            </div>
        </div>
    );
};

const CustomPieChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = 25;
    const circumference = 2 * Math.PI * radius;

    let currentPercentage = 0;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="50" />

                    {data.map((item, index) => {
                        const percentage = total > 0 ? (item.value / total) : 0;
                        if (percentage === 0) return null;

                        const strokeDasharray = `${percentage * circumference} ${circumference}`;
                        const strokeDashoffset = -(currentPercentage * circumference);

                        const startAngle = currentPercentage * 360;
                        const sliceAngle = percentage * 360;
                        const midAngle = startAngle + sliceAngle / 2;
                        const midAngleRad = midAngle * (Math.PI / 180);

                        // Position text inside the slice
                        const textRadius = 28;
                        const textX = 50 + Math.cos(midAngleRad) * textRadius;
                        const textY = 50 + Math.sin(midAngleRad) * textRadius;

                        currentPercentage += percentage;

                        const showText = percentage > 0.05; // Only show text if slice > 5%

                        return (
                            <g key={index}>
                                <circle
                                    cx="50" cy="50" r={radius}
                                    fill="transparent"
                                    stroke={item.color}
                                    strokeWidth="49.5" // Slightly less to avoid edge bleeding
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    className="transition-all duration-1000"
                                />
                                {showText && (
                                    <text
                                        x={textX}
                                        y={textY}
                                        fill="white"
                                        fontSize="6"
                                        fontWeight="bold"
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        transform={`rotate(90, ${textX}, ${textY})`}
                                    >
                                        <tspan x={textX} dy="-3">{item.label}</tspan>
                                        <tspan x={textX} dy="7">{Math.round(percentage * 100)}%</tspan>
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};

const InteractivePieChart = ({
    members,
    allPosUnits,
    initialTime,
    onTimeChange
}: {
    members: { name: string, pos: string[], active: boolean }[],
    allPosUnits: string[],
    initialTime: string,
    onTimeChange: (time: string) => void
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [posFilter, setPosFilter] = useState('Semua Pos Unit');

    // Combine database Pos Units and members' pos, but exclude 'Belum Ditentukan' as requested
    const posOptions = useMemo(() => {
        const uniquePosFromMembers = Array.from(new Set(members.flatMap(m => m.pos)));
        const allUniquePos = Array.from(new Set([...allPosUnits, ...uniquePosFromMembers]));
        return ['Semua Pos Unit', ...allUniquePos.filter(p => p && p !== 'Belum Ditentukan')];
    }, [members, allPosUnits]);

    const filteredMembers = members.filter(m => {
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
        const matchPos = posFilter === 'Semua Pos Unit' || m.pos.includes(posFilter);
        return matchSearch && matchPos;
    });

    const activeList = filteredMembers.filter(m => m.active);
    const inactiveList = filteredMembers.filter(m => !m.active);
    const total = activeList.length + inactiveList.length;

    const chartData = [
        { label: 'Aktif', value: activeList.length, color: '#10b981' }, // Emerald
        { label: 'Pasif', value: inactiveList.length, color: '#f59e0b' } // Orange
    ];

    return (
        <div className="flex flex-col h-full w-full justify-between">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h4 className="text-sm sm:text-md text-slate-700 font-semibold uppercase tracking-tight">
                    Aktivitas Member
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded px-1">
                    <select
                        value={initialTime}
                        onChange={(e) => onTimeChange(e.target.value)}
                        className="text-[9px] sm:text-[10px] font-bold text-slate-600 bg-transparent border-none py-1 pl-1 pr-5 focus:ring-0 cursor-pointer"
                    >
                        <option value="Minggu Ini">Minggu Ini</option>
                        <option value="Bulan Ini">Bulan Ini</option>
                        <option value="Tahun Ini">Tahun Ini</option>
                    </select>
                </div>
            </div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative flex-1 flex flex-col items-center justify-center w-full transition-transform active:scale-[0.98]"
            >
                <CustomPieChart data={chartData} />
                <div className="absolute top-0 right-0 sm:top-2 sm:right-2 p-1.5 bg-slate-50 text-slate-400 rounded-full group-hover:bg-slate-100 transition-colors shadow-sm border border-slate-100">
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg max-h-72 flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Total Member</span>
                            <span className="text-xs sm:text-sm font-bold text-slate-800">{total} org</span>
                        </div>

                        {/* Filters for the list */}
                        <div className="flex flex-col gap-2 mb-3 pb-3 border-b border-slate-200">
                            <div className="relative">
                                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama member..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-6 pr-2 py-1 text-[10px] sm:text-xs border border-slate-200 rounded bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div className="relative">
                                <Filter size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    value={posFilter}
                                    onChange={(e) => setPosFilter(e.target.value)}
                                    className="w-full pl-6 pr-2 py-1 text-[10px] sm:text-xs border border-slate-200 rounded bg-white focus:ring-1 focus:ring-indigo-500 outline-none appearance-none"
                                >
                                    {posOptions.map((opt, i) => (
                                        <option key={i} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar flex-1 pr-1">
                            <div className="mb-3">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                    <span className="text-[11px] sm:text-xs font-semibold text-slate-600">Aktif (Setor) - {activeList.length} org</span>
                                </div>
                                {activeList.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 mt-1 pl-4">
                                        {activeList.map((m, i) => (
                                            <span key={i} className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-sm text-[9px] sm:text-[10px] font-medium whitespace-nowrap">
                                                {m.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-slate-400 italic pl-4">Tidak ada member aktif</p>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center gap-1.5 mb-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                                    <span className="text-[11px] sm:text-xs font-semibold text-slate-600">Pasif (Tidak Setor) - {inactiveList.length} org</span>
                                </div>
                                {inactiveList.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 mt-1 pl-4">
                                        {inactiveList.map((m, i) => (
                                            <span key={i} className="px-1.5 py-0.5 bg-orange-50 border border-orange-100 text-orange-600 rounded-sm text-[9px] sm:text-[10px] font-medium whitespace-nowrap">
                                                {m.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-slate-400 italic pl-4">Tidak ada member pasif</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Dashboard({ stats, filters }: DashboardProps) {
    const [timeRange, setTimeRange] = useState<'7hari' | 'bulanan'>(filters?.timeRange || '7hari');
    const [selectedMonth, setSelectedMonth] = useState<number>(filters?.month || new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(filters?.year || new Date().getFullYear());
    const [aktivitasTime, setAktivitasTime] = useState<string>(filters?.aktivitasTime || 'Bulan Ini');

    // Fetch real data from backend when filters change
    useEffect(() => {
        router.get(
            // @ts-ignore
            route('dashboard'),
            { timeRange, month: selectedMonth, year: selectedYear, aktivitasTime },
            { preserveState: true, preserveScroll: true, replace: true, only: ['stats', 'filters'] }
        );
    }, [timeRange, selectedMonth, selectedYear, aktivitasTime]);

    const chartData = stats?.trendSetoran || [];
    const chartKategori = stats?.trendByKategori || {};
    const chartAllKategori = stats?.allKategori || [];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* Top Stats: Custom Solid Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <StatCard
                    label="Total Member"
                    value={(stats?.totalMember || 0).toLocaleString('id-ID')}
                    icon={Users}
                    color="bg-sankara-stat-member"
                />
                <StatCard
                    label="Total Petugas"
                    value={(stats?.totalPetugas || 0).toLocaleString('id-ID')}
                    icon={GraduationCap}
                    color="bg-sankara-stat-petugas"
                />
                <StatCard
                    label="Total Pos"
                    value={(stats?.totalPos || 0).toLocaleString('id-ID')}
                    icon={Store}
                    color="bg-sankara-stat-pos"
                />
                <StatCard
                    label="Kategori Sampah"
                    value={(stats?.kategoriSampah || 0).toLocaleString('id-ID')}
                    icon={BookOpen}
                    color="bg-sankara-stat-kategori"
                />
            </div>

            <div className="mt-6">
                <h1 className="text-lg sm:text-xl font-bold text-gray-500 uppercase tracking-tight">Statistik</h1>
                <div className="flex items-center gap-2 border-b-2 border-slate-100 pb-2">
                </div>
            </div>

            {/* Main Content Area */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">

                {/* Top Row: Bar Chart */}
                <div className="lg:col-span-12 bg-white p-4 sm:p-8 rounded border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm sm:text-md text-slate-700 font-semibold uppercase tracking-tight flex items-center gap-2">
                                <BarChart3 size={18} className="text-indigo-500 shrink-0" />
                                <span>Tren Setoran Sampah</span>
                            </h4>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value as '7hari' | 'bulanan')}
                                className="text-[11px] sm:text-xs border-transparent bg-transparent py-1 pl-2 pr-6 text-slate-700 font-bold focus:ring-0 cursor-pointer"
                            >
                                <option value="7hari">7 Hari Terakhir</option>
                                <option value="bulanan">Bulanan</option>
                            </select>
                            {timeRange === 'bulanan' && (
                                <div className="flex items-center border-l border-slate-200 pl-1">
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                        className="text-[11px] sm:text-xs border-transparent bg-transparent py-1 pl-2 pr-6 text-indigo-600 font-bold focus:ring-0 cursor-pointer"
                                    >
                                        <option value={1}>Januari</option>
                                        <option value={2}>Februari</option>
                                        <option value={3}>Maret</option>
                                        <option value={4}>April</option>
                                        <option value={5}>Mei</option>
                                        <option value={6}>Juni</option>
                                        <option value={7}>Juli</option>
                                        <option value={8}>Agustus</option>
                                        <option value={9}>September</option>
                                        <option value={10}>Oktober</option>
                                        <option value={11}>November</option>
                                        <option value={12}>Desember</option>
                                    </select>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        className="text-[11px] sm:text-xs border-transparent bg-transparent py-1 pl-2 pr-6 text-indigo-600 font-bold focus:ring-0 cursor-pointer"
                                    >
                                        <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                                        <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                                        <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                    <CustomBarChart
                        data={chartData}
                        trendByKategori={chartKategori}
                        allKategori={chartAllKategori}
                    />
                </div>

                {/* Bottom Row: 2 Donut Cards (Aktivitas Member & Setoran Member) */}
                <div className="lg:col-span-6 bg-white p-4 sm:p-8 rounded border border-slate-100 shadow-sm flex flex-col justify-between">
                    <InteractivePieChart
                        members={stats?.aktivitasMember || []}
                        allPosUnits={stats?.allPosUnits || []}
                        initialTime={aktivitasTime}
                        onTimeChange={(val) => setAktivitasTime(val)}
                    />
                </div>

                <div className="lg:col-span-6 bg-white p-4 sm:p-8 rounded border border-slate-100 shadow-sm flex flex-col justify-between">
                    <InteractiveSetoranChart stats={stats?.setoranStats || {}} />
                </div>

                {/* Row 3: Top Members Bar Chart */}
                <div className="lg:col-span-12 bg-white p-4 sm:p-8 rounded border border-slate-100 shadow-sm">
                    {stats?.topMembers && stats.topMembers.length > 0 ? (
                        <TopMembersBarChart data={stats.topMembers} />
                    ) : (
                        <div className="flex flex-col h-full w-full">
                            <h4 className="text-sm sm:text-md text-slate-700 font-semibold uppercase tracking-tight mb-4 sm:mb-6">
                                Top Member Teraktif <span className="text-slate-400 italic normal-case text-xs tracking-normal"> (Berdasarkan Berat)</span>
                            </h4>
                            <div className="flex items-center justify-center py-8 text-xs text-slate-400">
                                Belum ada data transaksi
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
