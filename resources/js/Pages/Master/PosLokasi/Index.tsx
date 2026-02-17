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
    alamat: string;
    latitude: number;
    longitude: number;
    is_aktif: boolean;
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
                        <h1 className="text-2xl font-bold text-slate-800">Pos Unit</h1>
                    </div>
                    <Link href={route('master.pos-lokasi.create')}>
                        <Button variant="primary" size="md">
                            <Plus className="w-4 h-4 me-2" />
                            Tambah Pos Unit
                        </Button>
                    </Link>
                </div>

                <div className="bg-white overflow-hidden py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 mb-4">
                        <PerPageSelector value={pos_lokasi.meta.per_page} onChange={handlePerPageChange} />
                        <TableSearch 
                            value={search} 
                            onChange={onSearchChange} 
                            placeholder="Cari nama pos atau alamat..." 
                        />
                    </div>

                    <Table>
                        <THead>
                            <TR isHeader>
                                <TH>Nama Pos</TH>
                                <TH>Alamat</TH>
                                <TH>Status</TH>
                                <TH className="text-right">Aksi</TH>
                            </TR>
                        </THead>
                        <TBody>
                            {pos_lokasi.data.length > 0 ? (
                                pos_lokasi.data.map((item, index) => (
                                    <TR key={item.id} index={(pos_lokasi.meta.current_page - 1) * pos_lokasi.meta.per_page + index}>
                                        <TD>
                                            <div className="flex items-center">
                                                <span className="font-medium text-slate-700">{item.nama_pos}</span>
                                            </div>
                                        </TD>
                                        <TD className="max-w-xs truncate text-slate-500">
                                            {item.alamat || '-'}
                                        </TD>
                                        <TD>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold text-white rounded-sm uppercase tracking-wider ${
                                                item.is_aktif ? 'bg-emerald-600' : 'bg-red-600'
                                            }`}>
                                                {item.is_aktif ? 'Aktif' : 'Non-Aktif'}
                                            </span>
                                        </TD>
                                        <TD className="text-right">
                                            <div className="flex justify-end space-x-2 whitespace-nowrap">
                                                <Link href={route('master.pos-lokasi.edit', item.id)}>
                                                    <Button variant="warning" size="sm" className="p-1.5" title="Edit">
                                                        <Edit className="w-3.5 h-3.5 me-1.5" />
                                                        Ubah
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    variant="danger" 
                                                    size="sm" 
                                                    className="p-1.5" 
                                                    title="Hapus"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 me-1.5" />
                                                    Hapus
                                                </Button>
                                            </div>
                                        </TD>
                                    </TR>
                                ))
                            ) : (
                                <TR>
                                    <TD colSpan={4} className="py-12 text-center text-slate-400">
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
