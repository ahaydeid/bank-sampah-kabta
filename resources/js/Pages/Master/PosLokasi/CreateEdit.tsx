import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
import { FormEventHandler } from 'react';
import Alert from '@/Components/Base/Alert';
import Button from '@/Components/Base/Button';
import Input from '@/Components/Base/Input';
import Label from '@/Components/Base/Label';
import Checkbox from '@/Components/Checkbox';
import LeafletMap from '@/Components/Base/LeafletMap';

interface PosLokasi {
    id: number;
    nama_pos: string;
    alamat: string;
    latitude: number;
    longitude: number;
    is_aktif: boolean;
}

interface Props {
    pos_lokasi?: PosLokasi;
}

export default function CreateEdit({ pos_lokasi }: Props) {
    const isEdit = !!pos_lokasi;

    const { data, setData, post, patch, processing, errors } = useForm({
        nama_pos: pos_lokasi?.nama_pos || '',
        alamat: pos_lokasi?.alamat || '',
        latitude: pos_lokasi?.latitude || 0,
        longitude: pos_lokasi?.longitude || 0,
        is_aktif: pos_lokasi ? pos_lokasi.is_aktif : true,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        
        const action = isEdit ? 'diperbarui' : 'ditambahkan';
        
        Alert.confirm({
            title: isEdit ? 'Simpan Perubahan?' : 'Tambah Pos Unit?',
            text: `Data pos unit ini akan ${action}.`,
            confirmButtonText: isEdit ? 'Ya, Simpan' : 'Ya, Tambah',
        }).then((result) => {
            if (result.isConfirmed) {
                if (isEdit) {
                    patch(route('master.pos-lokasi.update', pos_lokasi.id), {
                        onSuccess: () => {
                            Alert.success({
                                title: 'Berhasil!',
                                text: `Data pos unit berhasil ${action}.`,
                                timer: 1500,
                                showConfirmButton: false,
                            });
                        }
                    });
                } else {
                    post(route('master.pos-lokasi.store'), {
                        onSuccess: () => {
                            Alert.success({
                                title: 'Berhasil!',
                                text: `Data pos unit berhasil ${action}.`,
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
            <Head title={isEdit ? 'Edit Pos Unit' : 'Tambah Pos Unit'} />

            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('master.pos-lokasi.index')}
                        className="p-2 hover:bg-slate-100 rounded transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isEdit ? 'Edit Pos Unit' : 'Tambah Pos Unit'}
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-2">
                        <LeafletMap 
                            latitude={data.latitude} 
                            longitude={data.longitude} 
                            onLocationSelect={(lat, lng) => {
                                setData(data => ({
                                    ...data,
                                    latitude: lat,
                                    longitude: lng
                                }));
                            }} 
                        />
                        <div className="mt-2 text-xs text-slate-500 flex items-center">
                            <MapPin className="w-3 h-3 me-1" />
                            Klik pada peta atau geser penanda untuk mengatur lokasi.
                        </div>
                    </div>

                    <div className="bg-white rounded-sm border border-slate-200 p-6 shadow-sm h-fit">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label value="Nama Pos" />
                                <Input
                                    type="text"
                                    value={data.nama_pos}
                                    onChange={(e) => setData('nama_pos', e.target.value)}
                                    className="w-full mt-1"
                                    placeholder="Contoh: Unit Desa Mekarjaya"
                                />
                                {errors.nama_pos && <p className="text-red-500 text-xs mt-1">{errors.nama_pos}</p>}
                            </div>

                            <div>
                                <Label value="Alamat" />
                                <textarea
                                    value={data.alamat}
                                    onChange={(e) => setData('alamat', e.target.value)}
                                    rows={3}
                                    className="w-full mt-1 px-4 py-2 border border-slate-300 focus:border-kabta-purple focus:ring-kabta-purple rounded transition-all duration-200"
                                    placeholder="Alamat lengkap pos..."
                                />
                                {errors.alamat && <p className="text-red-500 text-xs mt-1">{errors.alamat}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label value="Latitude" />
                                    <Input
                                        type="number"
                                        step="any"
                                        value={data.latitude}
                                        onChange={(e) => setData('latitude', Number(e.target.value))}
                                        className="w-full mt-1"
                                    />
                                    {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>}
                                </div>

                                <div>
                                    <Label value="Longitude" />
                                    <Input
                                        type="number"
                                        step="any"
                                        value={data.longitude}
                                        onChange={(e) => setData('longitude', Number(e.target.value))}
                                        className="w-full mt-1"
                                    />
                                    {errors.longitude && <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>}
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 py-2">
                                <Checkbox
                                    id="is_aktif"
                                    checked={data.is_aktif}
                                    onChange={(e) => setData('is_aktif', e.target.checked)}
                                />
                                <Label htmlFor="is_aktif" className="!mb-0 cursor-pointer">
                                    Pos Aktif
                                </Label>
                            </div>

                            <div className="flex pt-4 border-t border-slate-100">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={processing}
                                    className="px-8 py-3 w-full"
                                >
                                    <Save className="w-4 h-4 me-2" />
                                    {isEdit ? 'Simpan Perubahan' : 'Tambah Pos'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
