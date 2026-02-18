import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { Save, ArrowLeft, Package, MapPin, Search } from 'lucide-react';
import { FormEventHandler, useEffect, useState, useCallback } from 'react';
import Button from '@/Components/Base/Button';
import Input from '@/Components/Base/Input';
import Alert from '@/Components/Base/Alert';
import { Table, THead, TBody, TR, TH, TD, TableSearch, Pagination, PerPageSelector } from '@/Components/Base/Table';
import { debounce } from '@/lib/debounce';

interface Reward {
    id: number;
    nama_reward: string;
    kategori_reward: string;
    stok_saat_ini: number;
}

interface Props {
    rewards: {
        data: Reward[];
        links: any[];
        meta: any;
    };
    pos_lokasi: any[];
    filters: {
        pos_id?: string | number;
        search?: string;
        per_page?: number;
    };
}

export default function Manage({ rewards, pos_lokasi, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const { data, setData, post, processing, errors } = useForm({
        pos_id: filters.pos_id || (pos_lokasi.length > 0 ? pos_lokasi[0].id : ''),
        stok: (rewards.data || []).reduce((acc: any, reward) => {
            acc[reward.id] = reward.stok_saat_ini;
            return acc;
        }, {}),
    });

    const handleFilter = useCallback(
        debounce((query: string, posId: string | number) => {
            router.get(
                route('operasional.stok-sembako.edit'),
                { search: query, pos_id: posId, per_page: rewards.meta.per_page },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 500),
        [rewards.meta.per_page]
    );

    const onSearchChange = (value: string) => {
        setSearch(value);
        handleFilter(value, data.pos_id);
    };

    const handlePosChange = (id: string) => {
        setData('pos_id', id);
        router.get(route('operasional.stok-sembako.edit'), { pos_id: id, per_page: rewards.meta.per_page }, { preserveState: false });
    };

    const handlePerPageChange = (per_page: number) => {
        router.get(
            route('operasional.stok-sembako.edit'),
            { pos_id: data.pos_id, search, per_page },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        Alert.confirm({
            title: 'Simpan Perubahan Stok?',
            text: 'Jumlah stok untuk semua barang di halaman ini akan diperbarui.',
            confirmButtonText: 'Ya, Simpan',
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('operasional.stok-sembako.update'), {
                    onSuccess: () => {
                        Alert.success({
                            title: 'Berhasil!',
                            text: 'Stok sembako telah diperbarui.',
                        });
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Kelola Stok Sembako" />

            <div className="mb-8 border-b border-slate-200 pb-4">
                <Link
                    href={route('operasional.stok-sembako')}
                    className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
                >
                    <ArrowLeft size={16} className="me-2" />
                    Kembali
                </Link>
                <h2 className="text-xl font-bold text-gray-800">
                    Kelola Stok Sembako
                </h2>
            </div>

            <div className="py-2">
                <div className="mx-auto">
                    <div className="bg-white overflow-hidden shadow-xs rounded-sm border border-gray-200">
                        <div className="p-8">
                            <form onSubmit={submit} className="space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Daftar Stok di Unit</h3>
                                                <p className="text-xs text-gray-400 font-normal mt-0.5">Input jumlah stok terkini untuk unit lokasi terpilih.</p>
                                            </div>
                                            <div className="h-10 w-px bg-gray-100 hidden md:block" />
                                            <div className="min-w-[240px]">
                                                <select 
                                                    value={data.pos_id} 
                                                    onChange={(e) => handlePosChange(e.target.value)}
                                                    className="w-full rounded-sm border-gray-300 text-sm focus:border-gray-800 focus:ring-gray-800 bg-white text-gray-800"
                                                >
                                                    {pos_lokasi.map((pos) => (
                                                        <option key={pos.id} value={pos.id}>{pos.nama_pos}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <PerPageSelector value={rewards.meta.per_page} onChange={handlePerPageChange} />
                                            <TableSearch 
                                                value={search} 
                                                onChange={onSearchChange} 
                                                placeholder="Cari nama barang..." 
                                                className="max-w-xs text-sm rounded-sm border-gray-300"
                                            />
                                        </div>
                                    </div>

                                    {rewards.data.length > 0 ? (
                                        <div className="space-y-6">
                                            <Table>
                                                <THead>
                                                    <TR isHeader className="whitespace-nowrap border-b border-gray-100">
                                                        <TH className="font-bold text-gray-500 uppercase p-4 text-[11px] tracking-wider text-left">Nama Barang</TH>
                                                        <TH className="font-bold text-gray-500 uppercase p-4 text-[11px] tracking-wider text-left">Kategori</TH>
                                                        <TH className="font-bold text-gray-500 uppercase p-4 text-[11px] tracking-wider text-center w-48">Jumlah Stok</TH>
                                                    </TR>
                                                </THead>
                                                <TBody>
                                                    {rewards.data.map((reward, index) => (
                                                        <TR key={reward.id} index={index} className="whitespace-nowrap border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                                            <TD className="py-5 px-4 text-left">
                                                                <span className="font-medium text-gray-800 text-sm">{reward.nama_reward}</span>
                                                            </TD>
                                                            <TD className="py-5 px-4 text-sm font-medium text-gray-500 text-left">
                                                                {reward.kategori_reward}
                                                            </TD>
                                                            <TD className="py-5 px-4 text-center">
                                                                <Input
                                                                    type="number"
                                                                    value={data.stok[reward.id]}
                                                                    onChange={(e) => setData('stok', {
                                                                        ...data.stok,
                                                                        [reward.id]: e.target.value
                                                                    })}
                                                                    className="w-full bg-gray-50 border-gray-200 text-gray-900 rounded-sm text-sm py-2 focus:border-gray-800 focus:ring-gray-800 text-center font-medium"
                                                                    placeholder="0"
                                                                />
                                                            </TD>
                                                        </TR>
                                                    ))}
                                                </TBody>
                                            </Table>
                                                
                                            <div className="flex flex-col md:flex-row justify-between items-center pt-6 gap-4 border-t border-gray-100 mt-4">
                                                <Pagination links={rewards.links} meta={rewards.meta} />
                                                
                                                <Button 
                                                    type="submit" 
                                                    className="bg-gray-900 text-white hover:bg-black uppercase tracking-widest font-bold text-[10px] rounded-sm px-6 h-[42px]"
                                                    isLoading={processing}
                                                >
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Simpan Stok
                                                </Button>
                                            </div>
                                        </div>
                                        ) : (
                                            <div className="py-5 text-center bg-gray-50/30 rounded-sm border border-dashed border-gray-200">
                                                <div className="max-w-xs mx-auto text-center">
                                                    <Package className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                                                    <p className="text-gray-500 font-semibold text-sm">Belum Ada Barang</p>
                                                </div>
                                            </div>
                                        )}
                                    </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
