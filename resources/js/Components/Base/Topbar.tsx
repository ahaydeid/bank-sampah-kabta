import { usePage, Link } from '@inertiajs/react';
import { Bell, Search, Menu } from 'lucide-react';
import Avatar from '@/Components/Avatar';

interface Props {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

export default function Topbar({ isCollapsed, setIsCollapsed }: Props) {
    const { auth } = usePage().props as any;

    return (
        <header className={`fixed top-0 right-0 left-0 ${isCollapsed ? 'lg:left-20' : 'lg:left-60'} z-30 bg-white border-b border-slate-100 py-3 transition-all duration-300 ease-in-out`}>
            <div className="flex items-center justify-between h-full px-8">
                <div className="flex items-center space-x-6">
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="-ms-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors"
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
                            className="ps-12 pe-4 py-1.5 w-80 text-sm bg-slate-50 border-transparent rounded-full focus:bg-white focus:ring-1 focus:ring-kabta-purple/20 focus:border-kabta-purple transition-all duration-100"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <button className="relative p-2 text-slate-400 hover:text-kabta-purple transition-colors duration-200">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-kabta-gold rounded-full border-2 border-white"></span>
                    </button>

                    <div className="h-6 w-px bg-slate-200"></div>

                    <Link href={route('profile.show')} className="flex items-center group transition duration-150 ease-in-out">
                        <div className="text-right me-4 hidden sm:block">
                            <div className="text-sm font-bold text-slate-800 group-hover:text-kabta-purple transition-colors">{auth.user.profil?.nama || auth.user.email}</div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-widest">{auth.user.peran}</div>
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
