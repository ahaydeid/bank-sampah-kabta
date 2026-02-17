import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, ShieldCheck, Key } from 'lucide-react';
import { FormEventHandler } from 'react';
import Alert from '@/Components/Base/Alert';
import Button from '@/Components/Base/Button';
import Input from '@/Components/Base/Input';
import Label from '@/Components/Base/Label';
import Checkbox from '@/Components/Checkbox';

interface Profil {
    id: number;
    nama: string;
    jabatan: string;
    no_hp: string;
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
    staff?: Staff;
}

export default function CreateEdit({ staff }: Props) {
    const isEdit = !!staff;

    const { data, setData, post, patch, processing, errors } = useForm({
        nama: staff?.profil.nama || '',
        email: staff?.email || '',
        password: '',
        peran: staff?.peran || 'petugas',
        jabatan: staff?.profil.jabatan || '',
        no_hp: staff?.profil.no_hp || '',
        is_aktif: staff?.is_aktif ?? true,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        
        const action = isEdit ? 'diperbarui' : 'ditambahkan';
        
        Alert.confirm({
            title: isEdit ? 'Simpan Perubahan?' : 'Tambah Staff Baru?',
            text: `Data staff ini akan ${action}.`,
            confirmButtonText: isEdit ? 'Ya, Simpan' : 'Ya, Tambah',
        }).then((result) => {
            if (result.isConfirmed) {
                if (isEdit) {
                    patch(route('master.staff.update', staff.id), {
                        onSuccess: () => {
                            Alert.success({
                                title: 'Berhasil!',
                                text: `Data staff berhasil ${action}.`,
                                timer: 1500,
                                showConfirmButton: false,
                            });
                        }
                    });
                } else {
                    post(route('master.staff.store'), {
                        onSuccess: () => {
                            Alert.success({
                                title: 'Berhasil!',
                                text: `Data staff berhasil ${action}.`,
                                timer: 1500,
                                showConfirmButton: false,
                            });
                        }
                    });
                }
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? 'Edit Staff/Admin' : 'Tambah Staff Baru'} />

            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('master.staff.index')}
                        className="p-2 hover:bg-slate-100 rounded transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isEdit ? 'Edit Staff/Admin' : 'Tambah Staff Baru'}
                        </h1>
                    </div>
                </div>

                <div className="bg-white rounded-sm border border-slate-200 p-6 max-w-4xl shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Akun & Akses */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2 text-slate-400 pb-2 border-b border-slate-100">
                                <span className="text-xs font-bold uppercase tracking-wider">Kredensial & Hak Akses</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label value="Alamat Email" />
                                    <Input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full mt-1"
                                        placeholder="email@instansi.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <Label value={isEdit ? "Password (Kosongkan jika tidak ganti)" : "Password"} />
                                    <Input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full mt-1"
                                        placeholder="••••••••"
                                    />
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <Label value="Peran / Hak Akses" />
                                    <select
                                        value={data.peran}
                                        onChange={(e) => setData('peran', e.target.value as any)}
                                        className="w-full mt-1 border-slate-300 focus:border-kabta-purple focus:ring-kabta-purple rounded transition-all duration-200"
                                    >
                                        <option value="petugas">Petugas Lapangan</option>
                                        <option value="admin">Administrator System</option>
                                    </select>
                                    {errors.peran && <p className="text-red-500 text-xs mt-1">{errors.peran}</p>}
                                </div>

                                {isEdit && (
                                    <div className="flex items-center space-x-3 pt-6">
                                        <Checkbox
                                            id="is_aktif"
                                            checked={data.is_aktif}
                                            onChange={(e) => setData('is_aktif', e.target.checked)}
                                        />
                                        <Label htmlFor="is_aktif" className="!mb-0 cursor-pointer text-slate-600">
                                            Status Akun Aktif
                                        </Label>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 2: Profil Personal */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2 text-slate-400 pb-2 border-b border-slate-100">
                                <span className="text-xs font-bold uppercase tracking-wider">Informasi Profil</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label value="Nama Lengkap" />
                                    <Input
                                        type="text"
                                        value={data.nama}
                                        onChange={(e) => setData('nama', e.target.value)}
                                        className="w-full mt-1"
                                        placeholder="Nama lengkap beserta gelar jika ada"
                                    />
                                    {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
                                </div>

                                <div>
                                    <Label value="Jabatan" />
                                    <Input
                                        type="text"
                                        value={data.jabatan}
                                        onChange={(e) => setData('jabatan', e.target.value)}
                                        className="w-full mt-1"
                                        placeholder="Contoh: Koordinator Pos, Staff Admin, dll"
                                    />
                                    {errors.jabatan && <p className="text-red-500 text-xs mt-1">{errors.jabatan}</p>}
                                </div>

                                <div>
                                    <Label value="No. WhatsApp / HP" />
                                    <Input
                                        type="text"
                                        value={data.no_hp}
                                        onChange={(e) => setData('no_hp', e.target.value)}
                                        className="w-full mt-1"
                                        placeholder="0812xxxxxx"
                                    />
                                    {errors.no_hp && <p className="text-red-500 text-xs mt-1">{errors.no_hp}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={processing}
                                className="px-8 py-3"
                            >
                                <Save className="w-4 h-4 me-2" />
                                {isEdit ? 'Simpan Perubahan' : 'Daftarkan Staff'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
