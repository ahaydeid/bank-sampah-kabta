import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    Users,
    Store,
    GraduationCap,
    BookOpen,
    ArrowUpRight
} from 'lucide-react';

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

const CustomLineChart = () => {
    // Mock Data for "Kehadiran Siswa" equiv -> Setoran Sampah
    const points = [
        { x: 0, y: 50 }, { x: 50, y: 60 }, { x: 100, y: 45 }, 
        { x: 150, y: 55 }, { x: 200, y: 35 }, { x: 250, y: 48 }, 
        { x: 300, y: 40 }, { x: 350, y: 52 }, { x: 400, y: 45 }, 
        { x: 450, y: 38 }, { x: 500, y: 42 }
    ];

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
        <div className="relative w-full h-48 mt-4">
            <svg viewBox="0 0 500 100" className="w-full h-full overflow-visible">
                {/* Dashed Grid Lines */}
                {[0, 25, 50, 75, 100].map(y => (
                    <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#f1f5f9" strokeDasharray="4 4" />
                ))}
                
                {/* The Line */}
                <path
                    d={pathData}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />

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
                <span>Minggu 1</span>
                <span>Minggu 3</span>
                <span>Minggu 5</span>
                <span>Minggu 7</span>
                <span>Minggu 9</span>
                <span>Minggu 11</span>
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

export default function Dashboard() {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* Top Stats: Custom Solid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                <StatCard 
                    label="Total Member" 
                    value="1,240" 
                    icon={Users} 
                    color="bg-[#FF006E]" 
                />
                <StatCard 
                    label="Total Petugas" 
                    value="48" 
                    icon={GraduationCap} 
                    color="bg-[#FB5607]" 
                />
                <StatCard 
                    label="Total Pos" 
                    value="24" 
                    icon={Store} 
                    color="bg-[#3A86FF]" 
                />
                <StatCard 
                    label="Kategori Sampah" 
                    value="11" 
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
                        <h4 className="text-md  text-slate-700 font-semibold uppercase tracking-tight">Tren Setoran Sampah <span className="text-slate-400 italic capitalize"> (91%)</span></h4>
                    </div>
                    <CustomLineChart />
                </div>

                {/* Middle: Donut 1 */}
                <div className="lg:col-span-3 bg-white p-8 rounded border border-slate-100 shadow-sm flex flex-col justify-between">
                    <h4 className="text-md text-slate-700 font-semibold uppercase tracking-tight mb-8">Setoran Member <span className="text-slate-400 italic capitalize"> (Hari Ini)</span></h4>
                    <CustomDonutChart percentage={88} color="#10b981" label="TERCATAT" />
                    <div className="mt-8 space-y-3">
                        {[
                            { label: 'Tervalidasi', count: 42, color: 'bg-emerald-500' },
                            { label: 'Proses', count: 3, color: 'bg-orange-500' },
                            { label: 'Tunda', count: 2, color: 'bg-cyan-500' },
                            { label: 'Batal', count: 1, color: 'bg-rose-500' },
                        ].map(item => (
                            <div key={item.label} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                    <span className=" text-slate-500">{item.label}</span>
                                </div>
                                <span className="text-slate-800">{item.count}</span>
                            </div>
                        ))}
                        <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-xs text-slate-800 uppercase font-medium">Total</span>
                            <span className="text-xs text-slate-800 font-medium">48</span>
                        </div>
                    </div>
                </div>

                {/* Right: Donut 2 */}
                <div className="lg:col-span-3 bg-white p-8 rounded border border-slate-100 shadow-sm flex flex-col justify-between">
                    <h4 className="text-md text-slate-700 font-semibold uppercase tracking-tight mb-8">Poin Member <span className="text-slate-400 capitalize italic"> (Hari Ini)</span></h4>
                    <CustomDonutChart percentage={94} color="#10b981" label="TERPAKAI" />
                    <div className="mt-8 space-y-3">
                        {[
                            { label: 'Sembako', count: 712, color: 'bg-emerald-500' },
                            { label: 'Uang Tunai', count: 21, color: 'bg-orange-500' },
                            { label: 'Lainnya', count: 15, color: 'bg-cyan-500' },
                            { label: 'Tabungan', count: 11, color: 'bg-rose-500' },
                        ].map(item => (
                            <div key={item.label} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                    <span className="text-slate-500">{item.label}</span>
                                </div>
                                <span className="text-slate-800">{item.count}</span>
                            </div>
                        ))}
                        <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-xs text-slate-800 uppercase font-medium">Total</span>
                            <span className="text-xs text-slate-800 font-medium">759</span>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
