import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, ShieldCheck, Key, Camera, User } from 'lucide-react';
import { FormEventHandler, useState, useRef } from 'react';
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
    pos_id: number | null;
    foto_profil?: string | null;
}

interface Staff {
    id: number;
    username: string;
    email: string;
    peran: 'admin' | 'petugas';
    is_aktif: boolean;
    profil: Profil;
}

interface PosLokasi {
    id: number;
    nama_pos: string;
}

interface Props {
    staff?: Staff;
    pos_lokasi?: PosLokasi[];
}

interface StaffForm {
    _method?: string;
    nama: string;
    email: string;
    password: string;
    peran: 'admin' | 'petugas';
    jabatan: string;
    no_hp: string;
    is_aktif: boolean;
    pos_id: number | string;
    foto_profil: File | null;
}

export default function CreateEdit({ staff, pos_lokasi = [] }: Props) {
    const isEdit = !!staff;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        staff?.profil.foto_profil ? `/storage/${staff.profil.foto_profil}` : null
    );

    const { data, setData, post, patch, processing, errors } = useForm<StaffForm>({
        _method: isEdit ? 'PATCH' : undefined,
        nama: staff?.profil.nama || '',
        email: staff?.email || '',
        password: '',
        peran: staff?.peran || 'petugas',
        jabatan: staff?.profil.jabatan || '',
        no_hp: staff?.profil.no_hp || '',
        is_aktif: staff?.is_aktif ?? true,
        pos_id: staff?.profil.pos_id || '',
        foto_profil: null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('foto_profil', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        
        const action = isEdit ? 'diperbarui' : 'ditambahkan';
        
        Alert.confirm({
            title: isEdit ? 'Simpan Perubahan?' : 'Tambah Staff/Petugas Baru?',
            text: `Data staff ini akan ${action}.`,
            confirmButtonText: isEdit ? 'Ya, Simpan' : 'Ya, Tambah',
        }).then((result) => {
            if (result.isConfirmed) {
                if (isEdit) {
                    post(route('master.staff.update', staff.id), {
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
            <Head title={isEdit ? 'Edit Staff/Admin' : 'Tambah Staff/Petugas Baru'} />

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
                            {isEdit ? 'Edit Staff/Admin' : 'Tambah Staff/Petugas Baru'}
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

                                {data.peran === 'petugas' && (
                                    <div>
                                        <Label value="Pos Unit" />
                                        <select
                                            value={data.pos_id}
                                            onChange={(e) => setData('pos_id', e.target.value)}
                                            className="w-full mt-1 border-slate-300 focus:border-kabta-purple focus:ring-kabta-purple rounded transition-all duration-200"
                                        >
                                            <option value="">-- Pilih Pos Unit --</option>
                                            {pos_lokasi.map((pos) => (
                                                <option key={pos.id} value={pos.id}>
                                                    {pos.nama_pos}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.pos_id && <p className="text-red-500 text-xs mt-1">{errors.pos_id}</p>}
                                    </div>
                                )}

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

                            <div className="flex flex-col items-center mb-6">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm relative bg-slate-50 flex items-center justify-center">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-10 h-10 text-slate-300" />
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        className="absolute bottom-0 right-0 p-1.5 bg-kabta-purple text-white rounded-full hover:bg-kabta-purple/90 border-2 border-white"
                                    >
                                        <Camera size={14} />
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 font-medium">Klik foto untuk {isEdit ? 'mengubah' : 'mengunggah'}</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                {errors.foto_profil && <p className="text-red-500 text-xs text-center mt-1">{errors.foto_profil}</p>}
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
