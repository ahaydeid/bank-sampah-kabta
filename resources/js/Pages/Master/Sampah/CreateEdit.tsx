import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler } from 'react';
import Alert from '@/Components/Base/Alert';
import Button from '@/Components/Base/Button';
import Input from '@/Components/Base/Input';
import Label from '@/Components/Base/Label';

interface Sampah {
    id: number;
    nama_sampah: string;
    kategori: string;
    poin_per_satuan: number;
}

interface Props {
    sampah?: Sampah;
}

export default function CreateEdit({ sampah }: Props) {
    const isEdit = !!sampah;

    const { data, setData, post, patch, processing, errors } = useForm({
        nama_sampah: sampah?.nama_sampah || '',
        kategori: sampah?.kategori || 'Anorganik',
        poin_per_satuan: sampah?.poin_per_satuan || 0,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        
        const action = isEdit ? 'diperbarui' : 'ditambahkan';
        
        Alert.confirm({
            title: isEdit ? 'Simpan Perubahan?' : 'Tambah Data?',
            text: `Data sampah ini akan ${action}.`,
            confirmButtonText: isEdit ? 'Ya, Simpan' : 'Ya, Tambah',
        }).then((result) => {
            if (result.isConfirmed) {
                if (isEdit) {
                    patch(route('master.sampah.update', sampah.id), {
                        onSuccess: () => {
                            Alert.success({
                                title: 'Berhasil!',
                                text: `Data sampah berhasil ${action}.`,
                                timer: 1500,
                                showConfirmButton: false,
                            });
                        }
                    });
                } else {
                    post(route('master.sampah.store'), {
                        onSuccess: () => {
                            Alert.success({
                                title: 'Berhasil!',
                                text: `Data sampah berhasil ${action}.`,
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
            <Head title={isEdit ? 'Edit Sampah' : 'Tambah Sampah'} />

            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('master.sampah.index')}
                        className="p-2 hover:bg-slate-100 rounded transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isEdit ? 'Edit Sampah' : 'Tambah Sampah'}
                        </h1>
                    </div>
                </div>

                <div className="bg-white rounded-sm border border-slate-200 p-6 max-w-2xl shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label value="Nama Sampah" />
                            <Input
                                type="text"
                                value={data.nama_sampah}
                                onChange={(e) => setData('nama_sampah', e.target.value)}
                                className="w-full mt-1"
                                placeholder="Contoh: Botol Plastik, Besi Tua, dll"
                            />
                            {errors.nama_sampah && <p className="text-red-500 text-xs mt-1">{errors.nama_sampah}</p>}
                        </div>

                        <div>
                            <Label value="Kategori" />
                            <select
                                value={data.kategori}
                                onChange={(e) => setData('kategori', e.target.value)}
                                className="w-full mt-1 border-slate-300 focus:border-kabta-purple focus:ring-kabta-purple rounded transition-all duration-200"
                            >
                                <option value="Organik">Organik</option>
                                <option value="Anorganik">Anorganik</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                            {errors.kategori && <p className="text-red-500 text-xs mt-1">{errors.kategori}</p>}
                        </div>

                        <div>
                            <Label value="Poin per Satuan (kg)" />
                            <Input
                                type="number"
                                value={data.poin_per_satuan}
                                onChange={(e) => setData('poin_per_satuan', Number(e.target.value))}
                                className="w-full mt-1"
                                placeholder="0"
                            />
                            {errors.poin_per_satuan && <p className="text-red-500 text-xs mt-1">{errors.poin_per_satuan}</p>}
                            <p className="text-xs text-slate-400 mt-2 italic">* Poin ini akan dikalikan dengan berat/jumlah saat melakukan setoran.</p>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={processing}
                                className="px-8 py-3"
                            >
                                <Save className="w-4 h-4 me-2" />
                                {isEdit ? 'Simpan Perubahan' : 'Tambah Sampah'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
