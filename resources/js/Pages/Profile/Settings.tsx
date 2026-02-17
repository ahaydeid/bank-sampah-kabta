import { Link } from '@inertiajs/react';
import { User, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Settings() {
    return (
        <AuthenticatedLayout>
            <div className="">
                <div className="mx-auto space-y-6">
                    {/* Page Header */}
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('profile.show')}
                            className="p-2 hover:bg-slate-100 rounded transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1>
                        </div>
                    </div>

                    {/* Settings Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Edit Profile Card */}
                        <Link
                            href={route('profile.edit')}
                            className="bg-white rounded border border-slate-100 p-6 hover:shadow-sm transition-all group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4">
                                    <div className="p-3 bg-kabta-purple/10 rounded-lg">
                                        <User className="w-6 h-6 text-kabta-purple" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">Edit Profil</h3>
                                        <p className="text-sm text-slate-500 mt-1">Ubah informasi profil, foto, dan data pribadi</p>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Edit Password Card */}
                        <Link
                            href={route('profile.password.edit')}
                            className="bg-white rounded border border-slate-100 p-6 hover:shadow-sm transition-all group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4">
                                    <div className="p-3 bg-kabta-purple/10 rounded-lg">
                                        <Lock className="w-6 h-6 text-kabta-purple" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">Edit Kata Sandi</h3>
                                        <p className="text-sm text-slate-500 mt-1">Ubah password untuk keamanan akun</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
