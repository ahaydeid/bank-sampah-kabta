import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, User } from 'lucide-react';
import { FormEventHandler } from 'react';
import Alert from '@/Components/Base/Alert';
import Button from '@/Components/Base/Button';
import Input from '@/Components/Base/Input';
import Label from '@/Components/Base/Label';
import Checkbox from '@/Components/Checkbox';

interface Profil {
    id: number;
    nama: string;
    nik: string;
    no_hp: string;
    alamat: string;
    saldo_poin: number;
}

interface Nasabah {
    id: number;
    username: string;
    email: string;
    is_aktif: boolean;
    profil: Profil;
}

interface Props {
    nasabah?: Nasabah;
}

export default function CreateEdit({ nasabah }: Props) {
    const isEdit = !!nasabah;

    const { data, setData, post, patch, processing, errors } = useForm({
        nama: nasabah?.profil.nama || '',
        nik: nasabah?.profil.nik || '',
        email: nasabah?.email || '',
        no_hp: nasabah?.profil.no_hp || '',
        alamat: nasabah?.profil.alamat || '',
        is_aktif: nasabah?.is_aktif ?? true,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        
        const action = isEdit ? 'diperbarui' : 'ditambahkan';
        
        Alert.confirm({
            title: isEdit ? 'Simpan Perubahan?' : 'Tambah Nasabah?',
            text: `Data nasabah ini akan ${action}.`,
            confirmButtonText: isEdit ? 'Ya, Simpan' : 'Ya, Tambah',
        }).then((result) => {
            if (result.isConfirmed) {
                if (isEdit) {
                    patch(route('master.nasabah.update', nasabah.id), {
                        onSuccess: () => {
                            Alert.success({
                                title: 'Berhasil!',
                                text: `Data nasabah berhasil ${action}.`,
                                timer: 1500,
                                showConfirmButton: false,
                            });
                        }
                    });
                } else {
                    post(route('master.nasabah.store'), {
                        onSuccess: () => {
                            Alert.success({
                                title: 'Berhasil!',
                                text: `Data nasabah berhasil ${action}.`,
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
            <Head title={isEdit ? 'Edit Nasabah' : 'Tambah Nasabah'} />

            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('master.nasabah.index')}
                        className="p-2 hover:bg-slate-100 rounded transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isEdit ? 'Edit Nasabah' : 'Tambah Nasabah'}
                        </h1>
                    </div>
                </div>

                <div className="bg-white rounded-sm border border-slate-200 p-6 max-w-3xl shadow-sm">
                    <div className="flex items-center space-x-2 text-slate-400 mb-6 pb-4 border-b border-slate-100">
                        <User className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Informasi Personal</span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div>
                                    <Label value="Nama Lengkap" />
                                    <Input
                                        type="text"
                                        value={data.nama}
                                        onChange={(e) => setData('nama', e.target.value)}
                                        className="w-full mt-1"
                                        placeholder="Nama sesuai KTP"
                                    />
                                    {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
                                </div>

                                <div>
                                    <Label value="NIK (Nomor Induk Kependudukan)" />
                                    <Input
                                        type="text"
                                        value={data.nik}
                                        onChange={(e) => setData('nik', e.target.value)}
                                        className="w-full mt-1"
                                        placeholder="16 digit nomor NIK"
                                        maxLength={16}
                                    />
                                    {errors.nik && <p className="text-red-500 text-xs mt-1">{errors.nik}</p>}
                                    <p className="text-[10px] text-slate-400 mt-2 italic">* NIK akan digunakan sebagai username dan password default.</p>
                                </div>

                                <div>
                                    <Label value="Kontak / No. HP" />
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

                            <div className="space-y-6">
                                <div>
                                    <Label value="Alamat Email" />
                                    <Input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full mt-1"
                                        placeholder="email@nasabah.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <Label value="Alamat Lengkap" />
                                    <textarea
                                        value={data.alamat}
                                        onChange={(e) => setData('alamat', e.target.value)}
                                        className="w-full mt-1 px-4 py-2 border border-slate-300 focus:border-kabta-purple focus:ring-kabta-purple rounded transition-all duration-200"
                                        placeholder="Alamat tempat tinggal..."
                                        rows={4}
                                    />
                                    {errors.alamat && <p className="text-red-500 text-xs mt-1">{errors.alamat}</p>}
                                </div>
                            </div>
                        </div>

                        {isEdit && (
                            <div className="flex items-center space-x-3 py-4 border-t border-slate-100">
                                <Checkbox
                                    id="is_aktif"
                                    checked={data.is_aktif}
                                    onChange={(e) => setData('is_aktif', e.target.checked)}
                                />
                                <Label htmlFor="is_aktif" className="!mb-0 cursor-pointer text-slate-600">
                                    Akun Nasabah Aktif
                                </Label>
                            </div>
                        )}

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={processing}
                                className="px-8 py-3"
                            >
                                <Save className="w-4 h-4 me-2" />
                                {isEdit ? 'Simpan Perubahan' : 'Daftarkan Nasabah'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
