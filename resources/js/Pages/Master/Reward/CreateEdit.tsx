import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Gift } from 'lucide-react';
import { FormEventHandler } from 'react';
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
    stok_per_pos?: any[];
}

interface Props {
    reward?: Reward;
    pos_lokasi: any[];
}

export default function CreateEdit({ reward, pos_lokasi }: Props) {
    const isEdit = !!reward;
    const { data, setData, post, patch, processing, errors } = useForm({
        nama_reward: reward?.nama_reward || '',
        poin_tukar: Number(reward?.poin_tukar || 0),
        kategori_reward: reward?.kategori_reward || 'Sembako',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        
        const action = isEdit ? 'diperbarui' : 'ditambahkan';
        
        Alert.confirm({
            title: isEdit ? 'Simpan Perubahan?' : 'Tambah Reward?',
            text: `Data reward ini akan ${action}.`,
            confirmButtonText: isEdit ? 'Ya, Simpan' : 'Ya, Tambah',
        }).then((result) => {
            if (result.isConfirmed) {
                if (isEdit) {
                    patch(route('master.reward.update', reward.id), {
                        onSuccess: () => {
                            Alert.success({
                                title: 'Berhasil!',
                                text: `Data reward berhasil ${action}.`,
                                timer: 1500,
                                showConfirmButton: false,
                            });
                        }
                    });
                } else {
                    post(route('master.reward.store'), {
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
