import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, MapPin, Package, Plus, Trash2, Search, Settings2 } from 'lucide-react';
import { FormEventHandler, useState, useEffect, useCallback } from 'react';
import Alert from '@/Components/Base/Alert';
import Button from '@/Components/Base/Button';
import Input from '@/Components/Base/Input';
import Label from '@/Components/Base/Label';
import Checkbox from '@/Components/Checkbox';
import LeafletMap from '@/Components/Base/LeafletMap';
import { Table, THead, TBody, TR, TH, TD, TableSearch, Pagination } from '@/Components/Base/Table';
import { debounce } from '@/lib/debounce';

interface Reward {
    id: number;
    nama_reward: string;
    kategori_reward: string;
    pivot?: {
        stok: number;
    }
}

interface PosLokasi {
    id: number;
    nama_pos: string;
    kode_pos: string;
    alamat: string;
    jadwal_buka: string | null;
    jadwal_tutup: string | null;
    latitude: number;
    longitude: number;
    is_aktif: boolean;
}

interface Props {
    pos_lokasi?: PosLokasi;
    registered_rewards?: {
        data: Reward[];
        links: any[];
        meta: any;
    };
    available_rewards?: Reward[];
    filters?: {
        catalog_search?: string;
    };
}

export default function CreateEdit({ pos_lokasi, registered_rewards, available_rewards = [], filters }: Props) {
    const isEdit = !!pos_lokasi;

    const { data, setData, post, patch, processing, errors } = useForm({
        nama_pos: pos_lokasi?.nama_pos || '',
        kode_pos: pos_lokasi?.kode_pos || '',
        alamat: pos_lokasi?.alamat || '',
        jadwal_buka: pos_lokasi?.jadwal_buka ? pos_lokasi.jadwal_buka.slice(0, 5) : '',
        jadwal_tutup: pos_lokasi?.jadwal_tutup ? pos_lokasi.jadwal_tutup.slice(0, 5) : '',
        latitude: pos_lokasi?.latitude || 0,
        longitude: pos_lokasi?.longitude || 0,
        is_aktif: pos_lokasi ? pos_lokasi.is_aktif : true,
    });

    const [catalogSearch, setCatalogSearch] = useState(filters?.catalog_search || '');
    const [rewardSearch, setRewardSearch] = useState('');
    const [rewardDropdownOpen, setRewardDropdownOpen] = useState(false);

    const handleCatalogFilter = useCallback(
        debounce((query: string) => {
            router.get(
                route('master.pos-lokasi.edit', pos_lokasi?.id),
                { catalog_search: query },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 500),
        [pos_lokasi?.id]
    );

    const onCatalogSearchChange = (value: string) => {
        setCatalogSearch(value);
        handleCatalogFilter(value);
    };

    const registerForm = useForm({
        reward_id: '',
        pos_id: pos_lokasi?.id,
    });

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (!registerForm.data.reward_id) return;

        registerForm.post(route('operasional.stok-sembako.register'), {
            onSuccess: () => {
                registerForm.reset('reward_id');
                Alert.success({ title: 'Berhasil', text: 'Barang ditambahkan ke katalog unit' });
            }
        });
    };

    const handleUnregister = (rewardId: number) => {
        Alert.confirm({
            title: 'Hapus Barang dari Unit?',
            text: 'Barang ini tidak akan muncul lagi di unit ini, tapi datanya tetap ada di Master Data.',
            confirmButtonText: 'Ya, Hapus',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('operasional.stok-sembako.destroy', { rewardId, posId: pos_lokasi?.id }), {
                    onSuccess: () => {
                        Alert.success({ title: 'Berhasil', text: 'Barang dihapus dari katalog unit' });
                    }
                });
            }
        });
    };

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
                            });
                        }
                    });
                } else {
                    post(route('master.pos-lokasi.store'), {
                        onSuccess: () => {
                            Alert.success({
                                title: 'Berhasil!',
                                text: `Data pos unit berhasil ${action}.`,
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
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('master.pos-lokasi.index')}
                            className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                            {isEdit ? `Edit ${data.nama_pos}` : 'Tambah Pos Unit'}
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-sm border border-gray-200 overflow-hidden shadow-xs">
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
                            <div className="p-3 bg-gray-50 text-[10px] text-gray-500 flex items-center border-t border-gray-100">
                                <MapPin className="w-3 h-3 me-1 text-gray-400" />
                                Klik pada peta atau geser penanda untuk menetapkan titik koordinat unit POS.
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-sm border border-gray-200 p-8 shadow-xs h-fit">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label value="Nama Pos" className="text-gray-700 font-semibold mb-1.5" />
                                <Input
                                    type="text"
                                    value={data.nama_pos}
                                    onChange={(e) => setData('nama_pos', e.target.value)}
                                    className="w-full rounded-sm border-gray-300 focus:border-gray-800 focus:ring-gray-800"
                                    placeholder="Contoh: Unit Desa Mekarjaya"
                                />
                                {errors.nama_pos && <p className="text-red-500 text-xs mt-1">{errors.nama_pos}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label value="Kode Unit" className="text-gray-700 font-semibold mb-1.5" />
                                    <Input
                                        type="text"
                                        maxLength={2}
                                        value={data.kode_pos}
                                        onChange={(e) => {
                                            const values = e.target.value.replace(/[^0-9]/g, '');
                                            setData('kode_pos', values);
                                        }}
                                        className="w-full rounded-sm border-gray-300 uppercase focus:border-gray-800 focus:ring-gray-800"
                                        placeholder="01"
                                    />
                                    {errors.kode_pos && <p className="text-red-500 text-xs mt-1">{errors.kode_pos}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label value="Latitude" className="text-gray-700 font-semibold mb-1.5" />
                                    <Input
                                        type="number"
                                        value={data.latitude}
                                        onChange={(e) => setData('latitude', e.target.value as any)}
                                        className="w-full rounded-sm border-gray-300 focus:border-gray-800 focus:ring-gray-800"
                                        placeholder="-6.200000"
                                        step="any"
                                    />
                                    {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>}
                                </div>
                                <div>
                                    <Label value="Longitude" className="text-gray-700 font-semibold mb-1.5" />
                                    <Input
                                        type="number"
                                        value={data.longitude}
                                        onChange={(e) => setData('longitude', e.target.value as any)}
                                        className="w-full rounded-sm border-gray-300 focus:border-gray-800 focus:ring-gray-800"
                                        placeholder="106.816666"
                                        step="any"
                                    />
                                    {errors.longitude && <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>}
                                </div>
                            </div>

                            <div>
                                <Label value="Alamat Lengkap" className="text-gray-700 font-semibold mb-1.5" />
                                <textarea
                                    value={data.alamat}
                                    onChange={(e) => setData('alamat', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 focus:border-gray-800 focus:ring-gray-800 rounded-sm text-sm"
                                    placeholder="Alamat lengkap pos..."
                                />
                                {errors.alamat && <p className="text-red-500 text-xs mt-1">{errors.alamat}</p>}
                            </div>

                            <div>
                                <Label value="Jadwal Operasional" className="text-gray-700 font-semibold mb-1.5" />
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={2}
                                            value={data.jadwal_buka.split(':')[0] || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                                                if (Number(val) > 23 && val.length === 2) return;
                                                const mm = data.jadwal_buka.split(':')[1] || '00';
                                                setData('jadwal_buka', `${val}:${mm}`);
                                            }}
                                            placeholder="JJ"
                                            className="w-14 text-center px-2 py-2 border border-gray-300 focus:border-gray-800 focus:ring-gray-800 rounded-sm text-sm"
                                        />
                                        <span className="text-gray-500 font-bold text-lg">.</span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={2}
                                            value={data.jadwal_buka.split(':')[1] || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                                                if (Number(val) > 59 && val.length === 2) return;
                                                const hh = data.jadwal_buka.split(':')[0] || '00';
                                                setData('jadwal_buka', `${hh}:${val}`);
                                            }}
                                            placeholder="MM"
                                            className="w-14 text-center px-2 py-2 border border-gray-300 focus:border-gray-800 focus:ring-gray-800 rounded-sm text-sm"
                                        />
                                    </div>
                                    <span className="text-gray-400 font-medium px-1">—</span>
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={2}
                                            value={data.jadwal_tutup.split(':')[0] || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                                                if (Number(val) > 23 && val.length === 2) return;
                                                const mm = data.jadwal_tutup.split(':')[1] || '00';
                                                setData('jadwal_tutup', `${val}:${mm}`);
                                            }}
                                            placeholder="JJ"
                                            className="w-14 text-center px-2 py-2 border border-gray-300 focus:border-gray-800 focus:ring-gray-800 rounded-sm text-sm"
                                        />
                                        <span className="text-gray-500 font-bold text-lg">.</span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={2}
                                            value={data.jadwal_tutup.split(':')[1] || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                                                if (Number(val) > 59 && val.length === 2) return;
                                                const hh = data.jadwal_tutup.split(':')[0] || '00';
                                                setData('jadwal_tutup', `${hh}:${val}`);
                                            }}
                                            placeholder="MM"
                                            className="w-14 text-center px-2 py-2 border border-gray-300 focus:border-gray-800 focus:ring-gray-800 rounded-sm text-sm"
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1.5">Format 24 jam (contoh: 08.00 — 16.00)</p>
                                {(errors.jadwal_buka || errors.jadwal_tutup) && <p className="text-red-500 text-xs mt-1">{errors.jadwal_buka || errors.jadwal_tutup}</p>}
                            </div>

                            <div className="flex items-center space-x-3 py-2">
                                <Checkbox
                                    id="is_aktif"
                                    checked={data.is_aktif}
                                    onChange={(e) => setData('is_aktif', e.target.checked)}
                                />
                                <Label htmlFor="is_aktif" className="!mb-0 cursor-pointer font-medium text-gray-700">
                                    Pos Aktif & Beroperasi
                                </Label>
                            </div>
                        </form>
                    </div>
                </div>

                {isEdit && (
                    <div className="bg-white rounded-sm border border-gray-200 shadow-xs mt-8">
                        <div className="p-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        Katalog Barang
                                    </h3>
                                    <p className="text-xs text-gray-400 font-normal mt-1 leading-relaxed">
                                        Dazftarkan barang baru ke unit ini.
                                    </p>
                                </div>
                                
                                <div className="flex flex-col md:flex-row gap-3 items-end md:items-center">
                                    <TableSearch 
                                        value={catalogSearch} 
                                        onChange={onCatalogSearchChange} 
                                        placeholder="Cari barang terdaftar..." 
                                        className="w-full md:w-64 rounded-sm border-gray-300"
                                    />
                                    <form onSubmit={handleRegister} className="flex gap-2 w-full md:w-auto relative">
                                        <div className="relative w-full md:w-64">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder={registerForm.data.reward_id 
                                                        ? available_rewards.find(r => r.id === Number(registerForm.data.reward_id))?.nama_reward 
                                                        : "Cari & Pilih Barang..."}
                                                    className="w-full pl-9 pr-8 rounded-sm border-gray-300 text-xs focus:border-gray-800 bg-white text-gray-800 placeholder:text-gray-400"
                                                    onChange={(e) => {
                                                        const val = e.target.value.toLowerCase();
                                                        setRewardSearch(val);
                                                        setRewardDropdownOpen(true);
                                                        if (val === '') registerForm.setData('reward_id', '');
                                                    }}
                                                    onFocus={() => setRewardDropdownOpen(true)}
                                                    value={rewardSearch}
                                                />
                                                {registerForm.data.reward_id && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            registerForm.setData('reward_id', '');
                                                            setRewardSearch('');
                                                        }}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>

                                            {rewardDropdownOpen && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-sm shadow-lg max-h-60 overflow-y-auto">
                                                    {available_rewards.filter(r => r.nama_reward.toLowerCase().includes(rewardSearch.toLowerCase())).length > 0 ? (
                                                        available_rewards
                                                            .filter(r => r.nama_reward.toLowerCase().includes(rewardSearch.toLowerCase()))
                                                            .map((r) => (
                                                                <div 
                                                                    key={r.id}
                                                                    className="px-4 py-2 text-xs hover:bg-gray-50 cursor-pointer text-gray-700"
                                                                    onClick={() => {
                                                                        registerForm.setData('reward_id', String(r.id));
                                                                        setRewardSearch(r.nama_reward);
                                                                        setRewardDropdownOpen(false);
                                                                    }}
                                                                >
                                                                    {r.nama_reward}
                                                                </div>
                                                            ))
                                                    ) : (
                                                        <div className="px-4 py-2 text-xs text-gray-400 italic">
                                                            Barang tidak ditemukan...
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <Button 
                                            type="submit" 
                                            className="font-bold uppercase tracking-wider text-[10px] rounded-sm bg-gray-800 text-white hover:bg-black px-6 whitespace-nowrap"
                                            disabled={!registerForm.data.reward_id || registerForm.processing}
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                                            Tambah
                                        </Button>
                                    </form>
                                </div>
                            </div>

                            <div className="mt-6">

                                    <Table>
                                        <THead>
                                            <TR isHeader className="whitespace-nowrap border-b border-gray-100">
                                                <TH className="font-bold text-gray-500 uppercase p-4 text-[11px] tracking-wider text-left">Nama Barang</TH>
                                                <TH className="font-bold text-gray-500 uppercase p-4 text-[11px] tracking-wider text-left">Kategori</TH>
                                                <TH className="font-bold text-gray-500 uppercase p-4 text-[11px] tracking-wider text-center">Stok Saat Ini</TH>
                                                <TH className="font-bold text-gray-500 uppercase p-4 text-[11px] tracking-wider text-center w-24">Aksi</TH>
                                            </TR>
                                        </THead>
                                        <TBody>
                                            {registered_rewards && registered_rewards.data.length > 0 ? (
                                                registered_rewards.data.map((item, index) => (
                                                    <TR key={item.id} index={index} className="whitespace-nowrap border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                        <TD className="py-4 px-4 text-left">
                                                            <span className="font-medium text-gray-800 text-sm">{item.nama_reward}</span>
                                                        </TD>
                                                        <TD className="py-4 px-4 text-sm font-medium text-gray-500 text-left">
                                                            {item.kategori_reward}
                                                        </TD>
                                                        <TD className="py-4 px-4 text-center">
                                                            <span className={`text-sm font-medium ${
                                                                (item.pivot?.stok ?? 0) > 10 ? 'text-gray-700' : 'text-red-600'
                                                            }`}>
                                                                {item.pivot?.stok ?? 0}
                                                            </span>
                                                        </TD>
                                                        <TD className="text-center py-4 px-4">
                                                            <Button 
                                                                className="bg-red-600 text-white hover:bg-red-700 p-2 rounded-sm shadow-xs" 
                                                                title="Hapus dari katalog unit"
                                                                onClick={() => handleUnregister(item.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </TD>
                                                    </TR>
                                                ))
                                            ) : (
                                                <TR>
                                                    <TD colSpan={5} className="py-12 text-center text-gray-400">
                                                        <p className="text-sm font-medium">Belum ada barang di katalog unit ini.</p>
                                                    </TD>
                                                </TR>
                                            )}
                                        </TBody>
                                    </Table>

                                    {registered_rewards && (
                                        <div className="pt-4">
                                            <Pagination links={registered_rewards.links} meta={registered_rewards.meta} />
                                        </div>
                                    )}
                                </div>
                        </div>
                    </div>
                )}

                <div className="flex pt-6 mt-8 border-t border-gray-200">
                    <Button
                        type="button"
                        onClick={(e) => handleSubmit(e as any)}
                        isLoading={processing}
                        className="bg-gray-900 text-white hover:bg-black uppercase tracking-widest font-bold rounded-sm h-12 px-10 shadow-xs w-full md:w-auto md:min-w-[200px] ml-auto"
                    >
                        <Save className="w-4 h-4 me-2" />
                        {isEdit ? 'Simpan Perubahan' : 'Tambah Pos'}
                    </Button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
