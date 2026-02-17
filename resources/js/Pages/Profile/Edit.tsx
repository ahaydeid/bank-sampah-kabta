import { FormEventHandler, useRef, useState } from 'react';
import { useForm, usePage, router, Link } from '@inertiajs/react';
import { Camera, Trash2, Save, ArrowLeft } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Avatar from '@/Components/Avatar';
import Alert from '@/Components/Base/Alert';

export default function Edit() {
    const { user } = usePage().props as any;
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    // Profile Info Form (including Photo)
    const { data: profileData, setData: setProfileData, post, processing: profileProcessing, errors: profileErrors } = useForm({
        nama: user.profil?.nama || '',
        nik: user.profil?.nik || '',
        jabatan: user.profil?.jabatan || '',
        no_hp: user.profil?.no_hp || '',
        alamat: user.profil?.alamat || '',
        photo: null as File | null,
        _method: 'patch', // Inertia needs this for multipart PATCH
    });

    const handleProfileSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        Alert.confirm({
            title: 'Simpan Perubahan?',
            text: 'Informasi profil Anda akan diperbarui.',
            confirmButtonText: 'Ya, Simpan',
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('profile.update'), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Alert.success({
                            title: 'Berhasil!',
                            text: 'Profil Anda telah diperbarui.',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                    },
                    onError: () => {
                        Alert.error({
                            title: 'Gagal!',
                            text: 'Terjadi kesalahan saat memperbarui profil. Silakan periksa formulir Anda.',
                        });
                    }
                });
            }
        });
    };

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoDelete = () => {
        Alert.delete({
            title: 'Hapus Foto?',
            text: 'Apakah Anda yakin ingin menghapus foto profil?',
            confirmButtonText: 'Ya, Hapus',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('profile.photo.delete'), {
                    preserveScroll: true,
                    onSuccess: () => {
                        setPhotoPreview(null);
                        Alert.success({
                            title: 'Dihapus!',
                            text: 'Foto profil telah dihapus.',
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    }
                });
            }
        });
    };


    const currentPhoto = photoPreview || (user.profil?.foto_profil ? `/storage/${user.profil.foto_profil}` : null);

    return (
        <AuthenticatedLayout>
            <div className="">
                <div className="mx-auto space-y-6">
                    {/* Page Header */}
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('profile.settings')}
                            className="p-2 hover:bg-slate-100 rounded transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Edit Profil</h1>
                        </div>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                        {/* Profile Information & Photo */}
                        <div className="bg-white rounded-sm border border-slate-200 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                                Informasi Profil
                            </h2>
                            
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Photo Side */}
                                <div className="flex flex-col items-center space-y-4">
                                    <Avatar 
                                        src={currentPhoto}
                                        name={user.profil?.nama}
                                        size="xl"
                                    />
                                    
                                    <div className="flex flex-col items-center space-y-2">
                                        <input
                                            ref={photoInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png"
                                            onChange={handlePhotoSelect}
                                            className="hidden"
                                        />
                                        
                                        <div className="flex items-center space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => photoInputRef.current?.click()}
                                                className="px-4 py-2 bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 transition-colors flex items-center rounded-sm"
                                            >
                                                <Camera className="w-4 h-4 me-2" />
                                                Ganti Foto
                                            </button>
                                            
                                            {user.profil?.foto_profil && !photoPreview && (
                                                <button
                                                    type="button"
                                                    onClick={handlePhotoDelete}
                                                    className="p-2 bg-red-600 text-white hover:bg-red-700 transition-colors rounded-sm"
                                                    title="Hapus Foto"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        
                                        <p className="text-[10px] text-slate-400 text-center max-w-[150px]">
                                            Format: JPG, JPEG, PNG. Maksimal 2MB.
                                        </p>
                                    </div>
                                    {profileErrors.photo && <p className="text-red-500 text-xs mt-1 text-center">{profileErrors.photo}</p>}
                                </div>
 
                                {/* Form Side */}
                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
                                            <input
                                                type="text"
                                                value={profileData.nama}
                                                onChange={(e) => setProfileData('nama', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-sm focus:border-slate-400 outline-none transition-all"
                                            />
                                            {profileErrors.nama && <p className="text-red-500 text-xs mt-1">{profileErrors.nama}</p>}
                                        </div>
 
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">NIK</label>
                                            <input
                                                type="text"
                                                value={profileData.nik}
                                                onChange={(e) => setProfileData('nik', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-sm focus:border-slate-400 outline-none transition-all"
                                                placeholder="Nomor Induk Kependudukan"
                                            />
                                            {profileErrors.nik && <p className="text-red-500 text-xs mt-1">{profileErrors.nik}</p>}
                                        </div>
 
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Jabatan</label>
                                            <input
                                                type="text"
                                                value={profileData.jabatan}
                                                onChange={(e) => setProfileData('jabatan', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-sm focus:border-slate-400 outline-none transition-all"
                                            />
                                            {profileErrors.jabatan && <p className="text-red-500 text-xs mt-1">{profileErrors.jabatan}</p>}
                                        </div>
 
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">No. HP</label>
                                            <input
                                                type="text"
                                                value={profileData.no_hp}
                                                onChange={(e) => setProfileData('no_hp', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-sm focus:border-slate-400 outline-none transition-all"
                                            />
                                            {profileErrors.no_hp && <p className="text-red-500 text-xs mt-1">{profileErrors.no_hp}</p>}
                                        </div>
                                    </div>
 
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={user.email}
                                            disabled
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Email tidak dapat diubah</p>
                                    </div>
 
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Alamat</label>
                                        <textarea
                                            value={profileData.alamat}
                                            onChange={(e) => setProfileData('alamat', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-sm focus:border-slate-400 outline-none transition-all"
                                        />
                                        {profileErrors.alamat && <p className="text-red-500 text-xs mt-1">{profileErrors.alamat}</p>}
                                    </div>
 
                                    <div className="flex justify-end pt-4 border-t border-slate-100">
                                        <button
                                            type="submit"
                                            disabled={profileProcessing}
                                            className="px-8 py-2 bg-slate-800 text-white hover:bg-slate-900 transition-colors disabled:opacity-50 flex items-center rounded-sm"
                                        >
                                            <Save className="w-4 h-4 me-2" />
                                            {profileProcessing ? 'Memproses...' : 'Simpan Perubahan'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
