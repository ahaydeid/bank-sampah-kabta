import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Save, Edit2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import Alert from '@/Components/Base/Alert';
import Button from '@/Components/Base/Button';

interface Props {
    settings: {
        penukaran_poin_kadaluwarsa_jam: string;
    }
}

export default function PenukaranPoin({ settings }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        settings: {
            penukaran_poin_kadaluwarsa_jam: settings.penukaran_poin_kadaluwarsa_jam || '24',
        }
    });

    // Fungsi khusus untuk menampilkan Alert sebelum submit
    const handleSaveConfirmation = () => {
        Alert.confirm({
            title: 'Simpan Perubahan?',
            text: 'Konfigurasi batas waktu penukaran poin akan diperbarui.',
            confirmButtonText: 'Ya, Simpan',
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('sistem.pengaturan.update'), {
                    onSuccess: () => {
                        setIsEditing(false);
                        Alert.success({
                            title: 'Berhasil!',
                            text: 'Pengaturan penukaran poin telah diperbarui.',
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    }
                });
            }
        });
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Cukup panggil konfirmasi jika sedang editing
        if (isEditing) {
            handleSaveConfirmation();
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold capitalize leading-tight text-gray-800">
                    Pengaturan Penukaran Poin
                </h2>
            }
        >
            <Head title="Pengaturan Penukaran Poin" />

            <div>
                <div className="mx-auto">
                    <div className="overflow-hidden bg-white rounded-sm">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <label htmlFor="kadaluwarsa_jam" className="block text-sm font-medium text-gray-700">
                                            Batas Waktu Penukaran (Jam)
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-3">
                                        Durasi berlaku QR Code sejak penukaran disetujui Admin. Jika melewati batas ini, transaksi akan batal otomatis.
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <input
                                            type="number"
                                            name="penukaran_poin_kadaluwarsa_jam"
                                            id="kadaluwarsa_jam"
                                            disabled={!isEditing}
                                            className={`block w-20 rounded-sm border-gray-300 focus:border-sky-600 focus:ring-sky-600 sm:text-sm text-gray-700 ${!isEditing ? 'bg-gray-50 text-gray-400 border-gray-100' : ''}`}
                                            placeholder="24"
                                            value={data.settings.penukaran_poin_kadaluwarsa_jam}
                                            onChange={(e) => setData('settings', { ...data.settings, penukaran_poin_kadaluwarsa_jam: e.target.value })}
                                        />
                                        <span className="text-gray-500 sm:text-sm font-medium">Jam</span>
                                    </div>
                                    {errors['settings.penukaran_poin_kadaluwarsa_jam' as keyof typeof errors] && (
                                        <p className="mt-2 text-sm text-red-600">{errors['settings.penukaran_poin_kadaluwarsa_jam' as keyof typeof errors]}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                                    {!isEditing ? (
                                        <Button
                                            type="button"
                                            variant="warning"
                                            size="md"
                                            onClick={(e) => {
                                                e.preventDefault(); // Extra protection
                                                setIsEditing(true);
                                            }}
                                            className="uppercase tracking-widest font-bold border-gray-300"
                                        >
                                            <Edit2 className="w-3.5 h-3.5 mr-2" />
                                            Perbarui
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button" // Ubah jadi type button agar onSubmit tidak terpanggil otomatis
                                            variant="info"
                                            size="md"
                                            onClick={handleSaveConfirmation} // Panggil langsung fungsi konfirmasi
                                            isLoading={processing}
                                            className="uppercase tracking-widest font-bold"
                                        >
                                            <Save className="w-3.5 h-3.5 mr-2" />
                                            Simpan Perubahan
                                        </Button>
                                    )}
                                    
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setData('settings', { 
                                                    penukaran_poin_kadaluwarsa_jam: settings.penukaran_poin_kadaluwarsa_jam 
                                                });
                                            }}
                                            className="text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-gray-600 transition-colors"
                                        >
                                            Batal
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
