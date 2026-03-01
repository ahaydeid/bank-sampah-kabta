import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import Alert from '@/Components/Base/Alert';
import { Table, THead, TBody, TR, TH, TD, TableSearch, Pagination, PerPageSelector } from '@/Components/Base/Table';
import Button from '@/Components/Base/Button';
import { useState, useCallback } from 'react';
import { debounce } from '@/lib/debounce';

interface Reward {
    id: number;
    nama_reward: string;
    stok: number;
    total_stok?: number;
    stok_tampil?: number;
    poin_tukar: number;
    kategori_reward: string;
    foto?: string | null;
}

interface Props {
    reward: {
        data: Reward[];
        links: any[];
        meta: {
            current_page: number;
            from: number;
            to: number;
            total: number;
            per_page: number;
            last_page: number;
        };
    };
    pos_lokasi: any[];
    filters: {
        search?: string;
        pos_id?: string | number;
        per_page?: string | number;
    }
}

export default function Index({ reward, pos_lokasi, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleFilter = useCallback(
        debounce((query: string) => {
            router.get(
                route('master.reward.index'),
                { search: query, per_page: reward.meta.per_page },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 500),
        [reward.meta.per_page]
    );

    const onSearchChange = (value: string) => {
        setSearch(value);
        handleFilter(value);
    };

    const handlePerPageChange = (perPage: number) => {
        router.get(
            route('master.reward.index'),
            { search, per_page: perPage },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDelete = (id: number) => {
        Alert.delete({
            title: 'Hapus Data?',
            text: 'Data reward ini akan dihapus secara permanen.',
            confirmButtonText: 'Ya, Hapus',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('master.reward.destroy', id), {
                    onSuccess: () => {
                        Alert.success({
                            title: 'Dihapus!',
                            text: 'Data reward telah berhasil dihapus.',
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
            <Head title="Master Data Sembako" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Master Data Sembako</h1>
                    </div>
                    <Link href={route('master.reward.create')}>
                        <Button variant="primary" size="sm">
                            <Plus className="w-4 h-4 me-2" />
                            Tambah Reward
                        </Button>
                    </Link>
                </div>

                <div className="bg-white py-4 rounded-sm border border-gray-200 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 mb-6">
                        <div className="flex flex-1 items-center gap-4">
                            <TableSearch 
                                value={search} 
                                onChange={onSearchChange} 
                                placeholder="Cari nama barang..." 
                                className="flex-1 max-w-sm rounded-sm border-gray-200"
                            />
                        </div>
                        <PerPageSelector value={reward.meta.per_page} onChange={handlePerPageChange} />
                    </div>

                    <Table>
                        <THead>
                            <TR isHeader className="whitespace-nowrap bg-white border-b border-gray-100">
                                <TH className="font-bold text-gray-500 uppercase p-4 text-[11px] tracking-wider text-left">Nama Barang</TH>
                                <TH className="font-bold text-gray-500 uppercase p-4 text-[11px] tracking-wider text-left w-16">Foto</TH>
                                <TH className="font-bold text-gray-500 uppercase p-4 text-[11px] tracking-wider text-left">Kategori</TH>
                                <TH className="font-bold text-gray-500 uppercase p-4 text-[11px] tracking-wider text-right">Poin Tukar</TH>
                                <TH className="font-bold text-gray-500 uppercase p-4 text-[11px] tracking-wider text-center w-24">Aksi</TH>
                            </TR>
                        </THead>
                        <TBody>
                            {reward.data.length > 0 ? (
                                reward.data.map((item, index) => (
                                    <TR key={item.id} index={(reward.meta.current_page - 1) * reward.meta.per_page + index} className='whitespace-nowrap border-b border-gray-100 hover:bg-gray-50/50 transition-colors'>
                                        <TD className="py-3 px-4 text-left">
                                            <span className="font-medium text-gray-800 text-sm">{item.nama_reward}</span>
                                        </TD>
                                        <TD className="py-3 px-4 text-left">
                                            <div className="w-10 h-10 rounded-sm overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                                                {item.foto ? (
                                                    <img src={`/storage/${item.foto}`} alt={item.nama_reward} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-5 h-5 text-gray-300" />
                                                )}
                                            </div>
                                        </TD>
                                        <TD className="py-3 px-4 text-sm font-medium text-gray-500 text-left">
                                            {item.kategori_reward}
                                        </TD>
                                        <TD className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                                            {new Intl.NumberFormat('id-ID').format(item.poin_tukar)}
                                        </TD>
                                        <TD className="text-center py-3 px-4">
                                            <div className="flex justify-center space-x-2 whitespace-nowrap">
                                                <Link href={route('master.reward.edit', item.id)}>
                                                    <Button className="bg-amber-500 text-white hover:bg-amber-600 p-2 rounded-sm shadow-xs" title="Edit">
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    className="bg-red-600 text-white hover:bg-red-700 p-2 rounded-sm shadow-xs" 
                                                    title="Hapus"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </TD>
                                    </TR>
                                ))
                            ) : (
                                <TR>
                                    <TD colSpan={5} className="py-20 text-center text-gray-400">
                                        <p className="text-sm font-medium">Belum ada data reward tersedia.</p>
                                    </TD>
                                </TR>
                            )}
                        </TBody>
                    </Table>

                    <Pagination 
                        links={reward.links} 
                        meta={reward.meta} 
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
