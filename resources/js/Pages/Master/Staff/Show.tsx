import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Mail, Phone, Shield, MapPin, Briefcase, User as UserIcon } from 'lucide-react';
import Button from '@/Components/Base/Button';
import Avatar from '@/Components/Avatar';

interface Profil {
    id: number;
    nama: string;
    jabatan: string;
    no_hp: string;
    foto_profil?: string | null;
    pos?: {
        nama_pos: string;
    }
}

interface Staff {
    id: number;
    username: string;
    email: string;
    peran: 'admin' | 'petugas';
    is_aktif: boolean;
    profil: Profil;
}

interface Props {
    staff: Staff;
}

export default function Show({ staff }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title={`Detail Staff - ${staff.profil.nama}`} />

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('master.staff.index')}
                            className="p-2 hover:bg-slate-100 rounded transition-colors text-slate-600"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Detail Staff / Petugas</h1>
                        </div>
                    </div>
                    <Link href={route('master.staff.edit', staff.id)}>
                        <Button variant="primary" size="sm" className="w-full md:w-auto">
                            <Edit className="w-4 h-4 me-2" />
                            Edit Staff
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Visual Profile */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-sm border border-slate-200 p-8 text-center">
                            <div className="flex justify-center mb-6">
                                <Avatar 
                                    src={staff.profil.foto_profil ? `/storage/${staff.profil.foto_profil}` : null} 
                                    name={staff.profil.nama}
                                    size="xl"
                                    className="w-32 h-32 text-4xl border-4 border-slate-50 shadow-sm"
                                />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 mb-1">{staff.profil.nama}</h2>
                            <p className="text-slate-500 font-medium mb-4">{staff.profil.jabatan || 'Staff'}</p>
                            
                            <div className="flex flex-col space-y-2 mt-6">
                                <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    staff.peran === 'admin' ? 'bg-kabta-purple text-white' : 'bg-blue-500 text-white'
                                } mx-auto`}>
                                    {staff.peran === 'admin' ? 'Administrator' : 'Petugas Lapangan'}
                                </span>
                                <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    staff.is_aktif ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                                } mx-auto`}>
                                    {staff.is_aktif ? 'Aktif' : 'Non-Aktif'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white rounded-sm border border-slate-200 p-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Akses Cepat</h3>
                            <div className="space-y-4">
                                <a href={`mailto:${staff.email}`} className="flex items-center p-3 rounded-sm border border-slate-100 hover:bg-slate-50 transition-colors group">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-sm me-3 group-hover:bg-blue-100 transition-colors">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="text-sm text-slate-600 truncate">{staff.email}</div>
                                </a>
                                {staff.profil.no_hp && (
                                    <a href={`https://wa.me/${staff.profil.no_hp.replace(/\D/g, '')}`} target="_blank" className="flex items-center p-3 rounded-sm border border-slate-100 hover:bg-slate-50 transition-colors group">
                                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-sm me-3 group-hover:bg-emerald-100 transition-colors">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div className="text-sm text-slate-600 truncate">{staff.profil.no_hp}</div>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-slate-700">Informasi Lengkap</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
                                            <UserIcon className="w-3 h-3 me-2" /> Nama Lengkap
                                        </div>
                                        <div className="text-slate-700 font-medium">{staff.profil.nama}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
                                            <Briefcase className="w-3 h-3 me-2" /> Jabatan
                                        </div>
                                        <div className="text-slate-700 font-medium">{staff.profil.jabatan || '-'}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
                                            <Mail className="w-3 h-3 me-2" /> Alamat Email
                                        </div>
                                        <div className="text-slate-700 font-medium">{staff.email}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
                                            <Phone className="w-3 h-3 me-2" /> No. WhatsApp / HP
                                        </div>
                                        <div className="text-slate-700 font-medium">{staff.profil.no_hp || '-'}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
                                            <Shield className="w-3 h-3 me-2" /> Peran & Hak Akses
                                        </div>
                                        <div className="text-slate-700 font-medium capitalize">{staff.peran}</div>
                                    </div>

                                    {staff.peran === 'petugas' && (
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
                                                <MapPin className="w-3 h-3 me-2" /> Penugasan Pos Unit
                                            </div>
                                            <div className="text-slate-700 font-medium text-kabta-purple">
                                                {staff.profil.pos?.nama_pos || 'Belum ditugaskan'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
