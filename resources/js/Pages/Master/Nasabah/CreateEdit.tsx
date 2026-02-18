import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, User, Trash2, X, Camera } from 'lucide-react';
import { FormEventHandler, useState, useRef } from 'react';
import Alert from '@/Components/Base/Alert';
import Button from '@/Components/Base/Button';
import Input from '@/Components/Base/Input';
import Label from '@/Components/Base/Label';
import Checkbox from '@/Components/Checkbox';
import Modal from '@/Components/Modal';

interface Profil {
    id: number;
    nama: string;
    nik: string;
    no_hp: string;
    alamat: string;
    saldo_poin: number;
    foto_profil?: string | null;
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        nasabah?.profil.foto_profil ? `/storage/${nasabah.profil.foto_profil}` : null
    );

    const { data, setData, post, patch, delete: destroy, processing, errors } = useForm({
        _method: isEdit ? 'PATCH' : undefined,
        nama: nasabah?.profil.nama || '',
        nik: nasabah?.profil.nik || '',
        email: nasabah?.email || '',
        no_hp: nasabah?.profil.no_hp || '',
        alamat: nasabah?.profil.alamat || '',
        is_aktif: nasabah?.is_aktif ?? true,
        foto_profil: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('foto_profil', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmName, setConfirmName] = useState('');

    const handleDeleteInitiate = () => {
        Alert.confirm({
            title: 'Hapus Akun Nasabah?',
            text: 'Tindakan ini akan menghapus seluruh data nasabah dan bersifat permanen.',
            confirmButtonText: 'Lanjutkan',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#d33',
        }).then((result) => {
            if (result.isConfirmed) {
                setShowDeleteModal(true);
            }
        });
    };

    const handleFinalDelete = () => {
        if (confirmName !== nasabah?.profil.nama) return;

        destroy(route('master.nasabah.destroy', nasabah.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                Alert.success({
                    title: 'Dihapus!',
                    text: 'Data nasabah berhasil dihapus.',
                    timer: 1500,
                    showConfirmButton: false,
                });
            }
        });
    };

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
                    post(route('master.nasabah.update', nasabah.id), {
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

                <div className="bg-white rounded-sm border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center space-x-2 text-slate-400 mb-6 pb-4 border-b border-slate-100">
                        <span className="text-xs font-bold uppercase tracking-wider">Informasi nasabah</span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm relative bg-slate-50 flex items-center justify-center">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-12 h-12 text-slate-300" />
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                        
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="absolute bottom-1 right-1 p-2 bg-kabta-purple text-white rounded-full hover:bg-kabta-purple/90 border-2 border-white"
                                >
                                    <Camera size={16} />
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-3 font-medium">Klik untuk ubah foto profil</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            {/* @ts-ignore */}
                            {errors.foto_profil && <p className="text-red-500 text-xs text-center mt-1">{errors.foto_profil}</p>}
                        </div>

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

                        <div className="flex justify-between pt-4 border-t border-slate-100">
                            <div>
                                {isEdit && (
                                    <Button
                                        type="button"
                                        variant="danger"
                                        onClick={handleDeleteInitiate}
                                        disabled={processing}
                                        className="px-6"
                                    >
                                        <Trash2 className="w-4 h-4 me-2" />
                                        Hapus Akun
                                    </Button>
                                )}
                            </div>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={processing}
                                className="px-8"
                            >
                                <Save className="w-4 h-4 me-2" />
                                {isEdit ? 'Simpan Perubahan' : 'Daftarkan Nasabah'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Final Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4 border-b pb-3">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center">
                            Konfirmasi Terakhir
                        </h3>
                        <button onClick={() => setShowDeleteModal(false)} className="text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                    </div>

                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                        Untuk menghapus akun silakan ketik nama lengkap nasabah tersebut di bawah ini sebagai konfirmasi.
                    </p>

                    <div className="space-y-4">
                        <div className="text-center">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                "{nasabah?.profil.nama}"
                            </label>
                            <Input
                                type="text"
                                className="w-full mt-1 text-sm border-gray-100  focus:border-red-500 focus:ring-red-500 text-center"
                                value={confirmName}
                                onChange={(e) => setConfirmName(e.target.value)}
                                placeholder="ketik di sini..."
                                autoComplete='off'
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="danger"
                                className="flex-[2] bg-red-600 hover:bg-red-700"
                                onClick={handleFinalDelete}
                                disabled={confirmName !== nasabah?.profil.nama || processing}
                                isLoading={processing}
                            >
                                Hapus Sekarang
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
