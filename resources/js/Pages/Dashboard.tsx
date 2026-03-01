import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    Users,
    Store,
    GraduationCap,
    BookOpen,
    ArrowUpRight
} from 'lucide-react';

interface DashboardProps {
    stats: {
        totalMember: number;
        totalPetugas: number;
        totalPos: number;
        kategoriSampah: number;
        setoranHariIni: {
            total: number;
            byStatus: Record<string, number>;
        };
        poinHariIni: {
            total: number;
            byCategory: Record<string, number>;
        };
        trendSetoran: Array<{
            date: string;
            total: number;
        }>;
    };
}

// --- Custom Internal Components for Performance ---

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) => (
    <div className={`${color} p-6 rounded-xl relative overflow-hidden group transition-transform duration-300`}>
        <div className="relative z-10 flex flex-col justify-between h-full text-white">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">{label}</span>
            <h3 className="text-4xl font-bold mt-1">{value}</h3>
        </div>
        <div className="absolute top-1/2 -right-4 -translate-y-1/2 opacity-20 group-hover:scale-110 transition-transform duration-500">
            <Icon size={120} strokeWidth={1} color="white" />
        </div>
    </div>
);

const CustomLineChart = ({ data }: { data: Array<{date: string, total: number}> }) => {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center w-full h-48 mt-4 text-slate-400">Belum ada data</div>;
    }

    const minTotal = Math.min(...data.map(d => Number(d.total)));
    const maxTotal = Math.max(...data.map(d => Number(d.total)), minTotal + 1);

    const points = data.map((d, i) => {
        const x = data.length > 1 ? (i / (data.length - 1)) * 500 : 250;
        const normalizedY = (Number(d.total) - minTotal) / (maxTotal - minTotal);
        const y = 100 - (normalizedY * 80 + 10);
        return { x, y, label: d.date };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
        <div className="relative w-full h-48 mt-4">
            <svg viewBox="0 0 500 100" className="w-full h-full overflow-visible">
                {/* Dashed Grid Lines */}
                {[0, 25, 50, 75, 100].map(y => (
                    <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#f1f5f9" strokeDasharray="4 4" />
                ))}
                
                {/* The Line */}
                {data.length > 1 && (
                    <path
                        d={pathData}
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="3"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />
                )}

                {/* Data Points */}
                {points.map((p, i) => (
                    <circle 
                        key={i} 
                        cx={p.x} 
                        cy={p.y} 
                        r="4" 
                        fill="white" 
                        stroke="#8b5cf6" 
                        strokeWidth="2" 
                    />
                ))}
            </svg>
            <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                {points.map((p, i) => (
                    <span key={i} className="text-center">
                        {new Date(p.label).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    </span>
                ))}
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
            <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                    <circle
                        cx="64" cy="64" r={radius}
                        fill="transparent"
                        stroke="#f1f5f9"
                        strokeWidth="12"
                    />
                    <circle
                        cx="64" cy="64" r={radius}
                        fill="transparent"
                        stroke={color}
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-bold text-slate-800 leading-none">{percentage}%</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">{label}</span>
                </div>
            </div>
        </div>
    );
};

export default function Dashboard({ stats }: DashboardProps) {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* Top Stats: Custom Solid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                <StatCard 
                    label="Total Member" 
                    value={(stats?.totalMember || 0).toLocaleString('id-ID')} 
                    icon={Users} 
                    color="bg-[#FF006E]" 
                />
                <StatCard 
                    label="Total Petugas" 
                    value={(stats?.totalPetugas || 0).toLocaleString('id-ID')} 
                    icon={GraduationCap} 
                    color="bg-[#FB5607]" 
                />
                <StatCard 
                    label="Total Pos" 
                    value={(stats?.totalPos || 0).toLocaleString('id-ID')} 
                    icon={Store} 
                    color="bg-[#3A86FF]" 
                />
                <StatCard 
                    label="Kategori Sampah" 
                    value={(stats?.kategoriSampah || 0).toLocaleString('id-ID')} 
                    icon={BookOpen} 
                    color="bg-[#8338EC]" 
                />
            </div>

            <div className="mt-6">
                <h1 className="text-xl font-bold text-gray-500 uppercase tracking-tight">Statistik</h1>
                <div className="flex items-center gap-2 border-b-2 border-slate-100 pb-2">
                </div>
            </div>

            {/* Main Content Area */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-2">
                
                {/* Left: Line Chart */}
                <div className="lg:col-span-6 bg-white p-8 rounded border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-md  text-slate-700 font-semibold uppercase tracking-tight">Tren Setoran Sampah <span className="text-slate-400 italic capitalize"> (7 Hari Terakhir)</span></h4>
                    </div>
                    <CustomLineChart data={stats?.trendSetoran || []} />
                </div>

                {/* Middle: Donut 1 */}
                <div className="lg:col-span-3 bg-white p-8 rounded border border-slate-100 shadow-sm flex flex-col justify-between">
                    <h4 className="text-md text-slate-700 font-semibold uppercase tracking-tight mb-8">Setoran Member <span className="text-slate-400 italic capitalize"> (Hari Ini)</span></h4>
                    <CustomDonutChart 
                        percentage={stats?.setoranHariIni?.total > 0 ? Math.round(((stats.setoranHariIni.byStatus['tervalidasi'] || 0) / stats.setoranHariIni.total) * 100) : 0} 
                        color="#10b981" 
                        label="TERVALIDASI" 
                    />
                    <div className="mt-8 space-y-3">
                        {[
                            { label: 'Tercatat', key: 'tercatat', color: 'bg-indigo-500' },
                            { label: 'Tervalidasi', key: 'tervalidasi', color: 'bg-emerald-500' },
                            { label: 'Proses', key: 'proses', color: 'bg-orange-500' },
                            { label: 'Tunda', key: 'tunda', color: 'bg-cyan-500' },
                            { label: 'Batal', key: 'batal', color: 'bg-rose-500' },
                        ].map(item => (
                            <div key={item.label} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                    <span className=" text-slate-500">{item.label}</span>
                                </div>
                                <span className="text-slate-800">{stats?.setoranHariIni?.byStatus?.[item.key] || 0}</span>
                            </div>
                        ))}
                        <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-xs text-slate-800 uppercase font-medium">Total</span>
                            <span className="text-xs text-slate-800 font-medium">{(stats?.setoranHariIni?.total || 0).toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Donut 2 */}
                <div className="lg:col-span-3 bg-white p-8 rounded border border-slate-100 shadow-sm flex flex-col justify-between">
                    <h4 className="text-md text-slate-700 font-semibold uppercase tracking-tight mb-8">Poin Member <span className="text-slate-400 capitalize italic"> (Hari Ini)</span></h4>
                    <CustomDonutChart 
                        percentage={stats?.poinHariIni?.total > 0 ? Math.round(((stats.poinHariIni.byCategory['Semabko'] || stats.poinHariIni.byCategory['sembako'] || Object.values(stats.poinHariIni.byCategory)[0] || 0) / stats.poinHariIni.total) * 100) : 0} 
                        color="#10b981" 
                        label="TERPAKAI" 
                    />
                    <div className="mt-8 space-y-3">
                        {stats?.poinHariIni?.byCategory && Object.keys(stats.poinHariIni.byCategory).length > 0 ? (
                            Object.entries(stats.poinHariIni.byCategory).slice(0, 4).map(([category, count], index) => {
                                const colors = ['bg-emerald-500', 'bg-orange-500', 'bg-cyan-500', 'bg-rose-500', 'bg-indigo-500'];
                                return (
                                    <div key={category} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                                            <span className="text-slate-500 capitalize">{category}</span>
                                        </div>
                                        <span className="text-slate-800">{Number(count).toLocaleString('id-ID')}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex items-center justify-center py-4 text-xs text-slate-400">Belum ada penukaran</div>
                        )}
                        <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-xs text-slate-800 uppercase font-medium">Total Poin</span>
                            <span className="text-xs text-slate-800 font-medium">{(stats?.poinHariIni?.total || 0).toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
