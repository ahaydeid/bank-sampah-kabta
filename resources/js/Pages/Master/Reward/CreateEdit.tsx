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
}

interface Props {
    reward?: Reward;
}

export default function CreateEdit({ reward }: Props) {
    const isEdit = !!reward;

    const { data, setData, post, patch, processing, errors } = useForm({
        nama_reward: reward?.nama_reward || '',
        stok: reward?.stok || 0,
        poin_tukar: reward?.poin_tukar || 0,
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
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('master.reward.index')}
                        className="p-2 hover:bg-slate-100 rounded transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isEdit ? 'Edit Reward' : 'Tambah Reward'}
                        </h1>
                    </div>
                </div>

                <div className="bg-white rounded-sm border border-slate-200 p-6 max-w-2xl shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label value="Nama Barang / Reward" />
                            <Input
                                type="text"
                                value={data.nama_reward}
                                onChange={(e) => setData('nama_reward', e.target.value)}
                                className="w-full mt-1"
                                placeholder="Contoh: Beras 5kg, Minyak Goreng 1L, dll"
                            />
                            {errors.nama_reward && <p className="text-red-500 text-xs mt-1">{errors.nama_reward}</p>}
                        </div>

                        <div>
                            <Label value="Kategori" />
                            <Input
                                type="text"
                                value={data.kategori_reward}
                                onChange={(e) => setData('kategori_reward', e.target.value)}
                                className="w-full mt-1"
                                placeholder="Contoh: Sembako, Alat Tulis, dll"
                            />
                            {errors.kategori_reward && <p className="text-red-500 text-xs mt-1">{errors.kategori_reward}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label value="Stok Tersedia" />
                                <Input
                                    type="number"
                                    value={data.stok}
                                    onChange={(e) => setData('stok', Number(e.target.value))}
                                    className="w-full mt-1"
                                    placeholder="0"
                                />
                                {errors.stok && <p className="text-red-500 text-xs mt-1">{errors.stok}</p>}
                            </div>

                            <div>
                                <Label value="Poin yang Dibutuhkan" />
                                <Input
                                    type="number"
                                    value={data.poin_tukar}
                                    onChange={(e) => setData('poin_tukar', Number(e.target.value))}
                                    className="w-full mt-1"
                                    placeholder="0"
                                />
                                {errors.poin_tukar && <p className="text-red-500 text-xs mt-1">{errors.poin_tukar}</p>}
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
                                {isEdit ? 'Simpan Perubahan' : 'Tambah Reward'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
