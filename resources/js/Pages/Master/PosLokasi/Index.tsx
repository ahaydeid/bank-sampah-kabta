import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import Alert from '@/Components/Base/Alert';
import { Table, THead, TBody, TR, TH, TD, TableSearch, Pagination, PerPageSelector } from '@/Components/Base/Table';
import Button from '@/Components/Base/Button';
import { useState, useCallback } from 'react';
import { debounce } from '@/lib/debounce';

interface PosLokasi {
    id: number;
    nama_pos: string;
    kode_pos: string;
    alamat: string;
    latitude: number;
    longitude: number;
    is_aktif: boolean;
    rewards_count?: number;
}

interface Props {
    pos_lokasi: {
        data: PosLokasi[];
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
    filters: {
        search?: string;
        per_page?: string | number;
    }
}

export default function Index({ pos_lokasi, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = useCallback(
        debounce((query: string) => {
            router.get(
                route('master.pos-lokasi.index'),
                { search: query, per_page: pos_lokasi.meta.per_page },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 500),
        [pos_lokasi.meta.per_page]
    );

    const onSearchChange = (value: string) => {
        setSearch(value);
        handleSearch(value);
    };

    const handlePerPageChange = (perPage: number) => {
        router.get(
            route('master.pos-lokasi.index'),
            { search, per_page: perPage },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDelete = (id: number) => {
        Alert.delete({
            title: 'Hapus Pos Unit?',
            text: 'Data pos unit ini akan dihapus secara permanen.',
            confirmButtonText: 'Ya, Hapus',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('master.pos-lokasi.destroy', id), {
                    onSuccess: () => {
                        Alert.success({
                            title: 'Dihapus!',
                            text: 'Pos unit telah berhasil dihapus.',
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
            <Head title="Master Data Pos Unit" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Pos Unit</h1>
                    </div>
                    <Link href={route('master.pos-lokasi.create')}>
                        <Button variant="primary" size="sm">
                            <Plus className="w-4 h-4 me-2" />
                            Tambah Pos Unit
                        </Button>
                    </Link>
                </div>

                <div className="bg-white py-4 rounded-sm border border-gray-200 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 mb-6">
                        <div className="flex flex-1 items-center gap-4">
                            <TableSearch 
                                value={search} 
                                onChange={onSearchChange} 
                                placeholder="Cari nama pos atau alamat..." 
                                className="flex-1 max-w-sm rounded-sm border-gray-200"
                            />
                        </div>
                        <PerPageSelector value={pos_lokasi.meta.per_page} onChange={handlePerPageChange} />
                    </div>

                    <Table>
                        <THead>
                            <TR isHeader className="whitespace-nowrap bg-gray-50/50">
                                <TH className="font-bold text-gray-700 uppercase p-4 text-[10px] tracking-widest border-b border-gray-100">Nama Pos</TH>
                                <TH className="font-bold text-gray-700 uppercase p-4 text-[10px] tracking-widest border-b border-gray-100 text-center">Kode</TH>
                                <TH className="font-bold text-gray-700 uppercase p-4 text-[10px] tracking-widest border-b border-gray-100">Alamat</TH>
                                <TH className="font-bold text-gray-700 uppercase p-4 text-[10px] tracking-widest border-b border-gray-100 text-center">Barang Terdaftar</TH>
                                <TH className="font-bold text-gray-700 uppercase p-4 text-[10px] tracking-widest border-b border-gray-100 text-center">Maps</TH>
                                <TH className="font-bold text-gray-700 uppercase p-4 text-[10px] tracking-widest border-b border-gray-100 text-center">Status</TH>
                                <TH className="font-bold text-gray-700 uppercase p-4 text-[10px] tracking-widest border-b border-gray-100 text-right">Aksi</TH>
                            </TR>
                        </THead>
                        <TBody>
                            {pos_lokasi.data.length > 0 ? (
                                pos_lokasi.data.map((item, index) => (
                                    <TR key={item.id} index={(pos_lokasi.meta.current_page - 1) * pos_lokasi.meta.per_page + index} className="whitespace-nowrap border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                                        <TD className="py-3 px-4">
                                            <span className="font-normal text-gray-800 text-sm">{item.nama_pos}</span>
                                        </TD>
                                        <TD className="text-center py-3 px-4">
                                            <span className="text-gray-700 text-sm">{item.kode_pos || '-'}</span>
                                        </TD>
                                        <TD className="py-3 px-4 max-w-xs truncate text-gray-500 text-sm">
                                            {item.alamat || '-'}
                                        </TD>
                                        <TD className="text-center py-3 px-4">
                                            <span className="inline-flex items-center font-bold px-2.5 py-1 text-sm text-gray-700 tracking-widest">
                                                {item.rewards_count ?? 0} <span className="text-xs font-normal text-gray-500 ml-1">item</span>
                                            </span>
                                        </TD>
                                        <TD className="text-center py-3 px-4">
                                            <span className={`inline-flex items-center px-3 py-0.5 text-[9px] font-medium uppercase tracking-widest ${
                                                item.latitude && item.longitude ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
                                            }`}>
                                                {item.latitude && item.longitude ? 'Tersedia' : 'Tidak tersedia'}
                                            </span>
                                        </TD>
                                        <TD className="text-center py-3 px-4">
                                            <span className={`inline-flex items-center px-3 py-0.5 text-[9px] font-medium uppercase tracking-widest ${
                                                item.is_aktif ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                                            }`}>
                                                {item.is_aktif ? 'Aktif' : 'Non-Aktif'}
                                            </span>
                                        </TD>
                                        <TD className="text-right py-3 px-4">
                                            <div className="flex justify-end space-x-2 whitespace-nowrap">
                                                <Link href={route('master.pos-lokasi.edit', item.id)}>
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
                                    <TD colSpan={7} className="py-12 text-center text-slate-400">
                                        <p>Belum ada data pos unit tersedia.</p>
                                    </TD>
                                </TR>
                            )}
                        </TBody>
                    </Table>

                    <Pagination 
                        links={pos_lokasi.links} 
                        meta={pos_lokasi.meta} 
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
