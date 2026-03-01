import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, ImagePlus } from 'lucide-react';
import { FormEventHandler, useState, useRef } from 'react';
import Alert from '@/Components/Base/Alert';
import Button from '@/Components/Base/Button';
import Input from '@/Components/Base/Input';
import Label from '@/Components/Base/Label';

interface Reward {
    id: number;
    nama_reward: string;
    stok: number;
    poin_tukar: number;
    kategori_reward: string;
    foto?: string | null;
    stok_per_pos?: any[];
}

interface Props {
    reward?: Reward;
    pos_lokasi: any[];
}

export default function CreateEdit({ reward, pos_lokasi }: Props) {
    const isEdit = !!reward;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        reward?.foto ? `/storage/${reward.foto}` : null
    );

    const { data, setData, post, processing, errors } = useForm({
        _method: isEdit ? 'PATCH' : undefined,
        nama_reward: reward?.nama_reward || '',
        poin_tukar: Number(reward?.poin_tukar || 0),
        kategori_reward: reward?.kategori_reward || 'Sembako',
        foto: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('foto', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        
        const action = isEdit ? 'diperbarui' : 'ditambahkan';
        
        Alert.confirm({
            title: isEdit ? 'Simpan Perubahan?' : 'Tambah Reward?',
            text: `Data reward ini akan ${action}.`,
            confirmButtonText: isEdit ? 'Ya, Simpan' : 'Ya, Tambah',
        }).then((result) => {
            if (result.isConfirmed) {
                const route_name = isEdit ? route('master.reward.update', reward.id) : route('master.reward.store');
                post(route_name, {
                    onSuccess: () => {
                        Alert.success({
                            title: 'Berhasil!',
                            text: `Data reward berhasil ${action}.`,
                            timer: 1500,
                            showConfirmButton: false,
                        });
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? 'Edit Reward' : 'Tambah Reward'} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('master.reward.index')}
                            className="p-2 hover:bg-gray-100 rounded-sm transition-colors border border-gray-200"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                            {isEdit ? 'Edit Reward' : 'Tambah Reward'}
                        </h1>
                    </div>
                </div>

                <div className="bg-white rounded-sm border border-gray-200 p-8 max-w-2xl shadow-xs">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Foto Upload */}
                        <div>
                            <Label value="Foto Barang" className="text-gray-700 font-semibold mb-1.5" />
                            <div
                                className="mt-1 relative group cursor-pointer border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-sm transition-colors flex flex-col items-center justify-center h-48 bg-slate-50 overflow-hidden"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {previewUrl ? (
                                    <>
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100">Klik untuk ganti foto</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <ImagePlus className="w-10 h-10" />
                                        <span className="text-sm">Klik untuk upload foto</span>
                                        <span className="text-xs">JPG, PNG, max 2MB</span>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            {/* @ts-ignore */}
                            {errors.foto && <p className="text-red-500 text-xs mt-1">{errors.foto}</p>}
                        </div>

                        <div>
                            <Label value="Nama Barang / Reward" className="text-gray-700 font-semibold mb-1.5" />
                            <Input
                                type="text"
                                value={data.nama_reward}
                                onChange={(e) => setData('nama_reward', e.target.value)}
                                className="w-full rounded-sm border-gray-300 focus:border-gray-800 focus:ring-gray-800"
                                placeholder="Contoh: Beras 5kg, Minyak Goreng 1L, dll"
                            />
                            {errors.nama_reward && <p className="text-red-500 text-xs mt-1">{errors.nama_reward}</p>}
                        </div>

                        <div>
                            <Label value="Kategori" className="text-gray-700 font-semibold mb-1.5" />
                            <Input
                                type="text"
                                value={data.kategori_reward}
                                onChange={(e) => setData('kategori_reward', e.target.value)}
                                className="w-full rounded-sm border-gray-300 focus:border-gray-800 focus:ring-gray-800"
                                placeholder="Contoh: Sembako, Alat Tulis, dll"
                            />
                            {errors.kategori_reward && <p className="text-red-500 text-xs mt-1">{errors.kategori_reward}</p>}
                        </div>

                        <div>
                            <Label value="Poin yang Dibutuhkan" className="text-gray-700 font-semibold mb-1.5" />
                            <Input
                                type="number"
                                value={data.poin_tukar}
                                onChange={(e) => setData('poin_tukar', Number(e.target.value))}
                                className="w-full rounded-sm border-gray-300 focus:border-gray-800 focus:ring-gray-800"
                                placeholder="0"
                            />
                            {errors.poin_tukar && <p className="text-red-500 text-xs mt-1">{errors.poin_tukar}</p>}
                        </div>

                        <div className="flex justify-end pt-6 border-t border-gray-50">
                            <Button
                                type="submit"
                                isLoading={processing}
                                className="bg-sky-600 text-white hover:bg-sky-700 uppercase tracking-widest font-bold rounded-sm h-12 px-10 shadow-xs"
                            >
                                <Save className="w-4 h-4 me-2" />
                                {isEdit ? 'Simpan Perubahan' : 'Tambah Reward'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
