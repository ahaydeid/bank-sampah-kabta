import { FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
import { Lock, Save, ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Alert from '@/Components/Base/Alert';

export default function EditPassword() {
    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        Alert.confirm({
            title: 'Ubah Kata Sandi?',
            text: 'Pastikan Anda mengingat kata sandi baru Anda.',
            confirmButtonText: 'Ya, Ubah',
        }).then((result) => {
            if (result.isConfirmed) {
                put(route('profile.password.update'), {
                    preserveScroll: true,
                    onSuccess: () => {
                        reset();
                        Alert.success({
                            title: 'Berhasil!',
                            text: 'Kata sandi telah diubah.',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                    },
                });
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <div className="">
                <div className="mx-auto space-y-6">
                    {/* Header with Back Button */}
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('profile.settings')}
                            className="p-2 hover:bg-slate-100 rounded transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Ubah Kata Sandi</h1>
                        </div>
                    </div>

                    {/* Password Form */}
                    <div className="bg-white rounded border border-slate-100 p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Password Saat Ini</label>
                                <input
                                    type="password"
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded focus:ring-2 focus:ring-kabta-purple/20 focus:border-kabta-purple transition-all"
                                    placeholder="Masukkan password saat ini"
                                />
                                {errors.current_password && <p className="text-red-500 text-xs mt-1">{errors.current_password}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Password Baru</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded focus:ring-2 focus:ring-kabta-purple/20 focus:border-kabta-purple transition-all"
                                    placeholder="Masukkan password baru"
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                <p className="text-xs text-slate-500 mt-1">Minimal 8 karakter</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Konfirmasi Password Baru</label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded focus:ring-2 focus:ring-kabta-purple/20 focus:border-kabta-purple transition-all"
                                    placeholder="Konfirmasi password baru"
                                />
                            </div>

                            <div className="flex justify-end pt-2 space-x-3">
                                <Link
                                    href={route('profile.settings')}
                                    className="px-6 py-2.5 border border-slate-200 text-slate-700 font-medium rounded hover:bg-slate-50 transition-colors"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 bg-kabta-purple text-white font-medium rounded hover:bg-kabta-purple/90 transition-colors disabled:opacity-50 flex items-center"
                                >
                                    <Save className="w-4 h-4 me-2" />
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
