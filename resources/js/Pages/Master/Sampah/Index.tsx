import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Alert from '@/Components/Base/Alert';
import { Table, THead, TBody, TR, TH, TD, TableSearch, Pagination, PerPageSelector } from '@/Components/Base/Table';
import Button from '@/Components/Base/Button';
import { useState, useCallback } from 'react';
import { debounce } from '@/lib/debounce';

interface Sampah {
    id: number;
    nama_sampah: string;
    kategori: string;
    poin_per_satuan: number;
}

interface Props {
    sampah: {
        data: Sampah[];
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

export default function Index({ sampah, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = useCallback(
        debounce((query: string) => {
            router.get(
                route('master.sampah.index'),
                { search: query, per_page: sampah.meta.per_page },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 500),
        [sampah.meta.per_page]
    );

    const onSearchChange = (value: string) => {
        setSearch(value);
        handleSearch(value);
    };

    const handlePerPageChange = (perPage: number) => {
        router.get(
            route('master.sampah.index'),
            { search, per_page: perPage },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDelete = (id: number) => {
        Alert.delete({
            title: 'Hapus Data?',
            text: 'Data sampah ini akan dihapus secara permanen.',
            confirmButtonText: 'Ya, Hapus',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('master.sampah.destroy', id), {
                    onSuccess: () => {
                        Alert.success({
                            title: 'Dihapus!',
                            text: 'Data sampah telah berhasil dihapus.',
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
            <Head title="Master Data Sampah" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Kategori Sampah</h1>
                    </div>
                    <Link href={route('master.sampah.create')}>
                        <Button variant="primary" size="sm">
                            <Plus className="w-4 h-4 me-2" />
                            Tambah Sampah
                        </Button>
                    </Link>
                </div>

                <div className="bg-white overflow-hidden py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 mb-4">
                        <PerPageSelector value={sampah.meta.per_page} onChange={handlePerPageChange} />
                        <TableSearch 
                            value={search} 
                            onChange={onSearchChange} 
                            placeholder="Cari nama sampah atau kategori..." 
                        />
                    </div>

                    <Table>
                        <THead>
                            <TR isHeader>
                                <TH>Nama Sampah</TH>
                                <TH>Kategori</TH>
                                <TH>Poin / Satuan</TH>
                                <TH className="text-right">Aksi</TH>
                            </TR>
                        </THead>
                        <TBody>
                            {sampah.data.length > 0 ? (
                                sampah.data.map((item, index) => (
                                    <TR key={item.id} index={(sampah.meta.current_page - 1) * sampah.meta.per_page + index}>
                                        <TD className="text-slate-800">{item.nama_sampah}</TD>
                                        <TD>
                                            <span className={`px-3 py-1.5 text-[9px] font-medium text-white uppercase tracking-wider ${
                                                item.kategori === 'Organik' ? 'bg-emerald-500' : 
                                                item.kategori === 'Anorganik' ? 'bg-blue-500' : 
                                                'bg-slate-600'
                                            }`}>
                                                {item.kategori}
                                            </span>
                                        </TD>
                                        <TD>
                                            {new Intl.NumberFormat('id-ID').format(item.poin_per_satuan)}
                                        </TD>
                                        <TD className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Link href={route('master.sampah.edit', item.id)}>
                                                    <Button className="bg-amber-500 text-white hover:bg-amber-600 p-2 rounded-sm shadow-xs" title="Edit">
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    variant="danger" 
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
                                    <TD colSpan={5} className="py-12 text-center text-slate-400">
                                        <p>Belum ada data sampah tersedia.</p>
                                    </TD>
                                </TR>
                            )}
                        </TBody>
                    </Table>

                    <Pagination 
                        links={sampah.links} 
                        meta={sampah.meta} 
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
