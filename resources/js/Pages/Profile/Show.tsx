import { usePage, router } from '@inertiajs/react';
import { Settings } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Avatar from '@/Components/Avatar';
import Dropdown from '@/Components/Dropdown';
import Alert from '@/Components/Base/Alert';

export default function Show() {
    const { user } = usePage().props as any;
    const photoUrl = user.profil?.foto_profil ? `/storage/${user.profil.foto_profil}` : null;

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        Alert.delete({
            title: 'Keluar',
            text: 'Apakah Anda yakin ingin keluar?',
            confirmButtonText: 'Ya, Keluar',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('logout'));
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <div className="">
                <div className="mx-auto space-y-6">
                    {/* Header with Settings Button */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Profil Saya</h1>
                            <p className="text-sm text-slate-500 mt-1">Informasi profil Anda</p>
                        </div>
                        
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center rounded-full px-2 py-2 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                                    <Settings className="w-5 h-5 text-slate-600" />
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content align="right">
                                <Dropdown.Link href={route('profile.settings')}>Pengaturan</Dropdown.Link>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full px-4 py-2 text-start text-sm leading-5 transition duration-150 ease-in-out focus:outline-none text-gray-700 hover:text-red-600"
                                >
                                    Keluar
                                </button>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-white rounded border border-slate-100 p-8">
                        {/* Photo and Name - Centered */}
                        <div className="flex flex-col items-center mb-8">
                            <Avatar 
                                src={photoUrl}
                                name={user.profil?.nama}
                                size="xl"
                                className="mb-4"
                            />
                            <h2 className="text-2xl font-bold text-slate-800">{user.profil?.nama || 'Nama belum diatur'}</h2>
                            <p className="text-sm text-slate-500 mt-1">{user.profil?.jabatan || 'Jabatan belum diatur'}</p>
                        </div>

                        {/* Information Grid - 2 Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email</label>
                                <div className="text-sm mt-1">
                                    <span className="text-slate-600">{user.email}</span>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">NIK</label>
                                <div className="text-sm mt-1">
                                    <span className={user.profil?.nik ? "text-slate-600" : "text-slate-400 italic"}>
                                        {user.profil?.nik || '-'}
                                    </span>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">No. HP</label>
                                <div className="text-sm mt-1">
                                    <span className={user.profil?.no_hp ? "text-slate-600" : "text-slate-400 italic"}>
                                        {user.profil?.no_hp || '-'}
                                    </span>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Alamat</label>
                                <div className="text-sm mt-1">
                                    <span className={user.profil?.alamat ? "text-slate-600" : "text-slate-400 italic"}>
                                        {user.profil?.alamat || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
