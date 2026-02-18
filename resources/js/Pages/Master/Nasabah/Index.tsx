import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Plus, Edit, QrCode } from 'lucide-react';
import { Table, THead, TBody, TR, TH, TD, TableSearch, Pagination, PerPageSelector } from '@/Components/Base/Table';
import Button from '@/Components/Base/Button';
import Avatar from '@/Components/Avatar';
import { useState, useEffect, useCallback } from 'react';
import { debounce } from '@/lib/debounce';

interface Profil {
    id: number;
    nama: string;
    nik: string;
    no_hp: string;
    alamat: string;
    saldo_poin: number;
    token_qr: string;
    foto_profil?: string | null;
}

interface Nasabah {
    id: number;
    username: string;
    email: string;
    is_aktif: boolean;
    profil: Profil;
}

interface Props {
    nasabah: {
        data: Nasabah[];
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

export default function Index({ nasabah, filters }: Props) {
    const { delete: destroy } = useForm();
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = useCallback(
        debounce((query: string) => {
            router.get(
                route('master.nasabah.index'),
                { search: query, per_page: nasabah.meta.per_page },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 500),
        [nasabah.meta.per_page]
    );

    const onSearchChange = (value: string) => {
        setSearch(value);
        handleSearch(value);
    };

    const handlePerPageChange = (perPage: number) => {
        router.get(
            route('master.nasabah.index'),
            { search, per_page: perPage },
            { preserveState: true, preserveScroll: true }
        );
    };


    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Nasabah" />

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Manajemen Nasabah</h1>
                    </div>
                    <Link href={route('master.nasabah.create')}>
                        <Button variant="primary" size="sm" className="w-full md:w-auto">
                            <Plus className="w-4 h-4 me-2" />
                            Tambah Nasabah
                        </Button>
                    </Link>
                </div>

                <div className="bg-white overflow-hidden py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 mb-4">
                        <PerPageSelector value={nasabah.meta.per_page} onChange={handlePerPageChange} />
                        <TableSearch 
                            value={search} 
                            onChange={onSearchChange} 
                            placeholder="Cari nama, NIK, atau email..." 
                        />
                    </div>

                    <Table>
                        <THead>
                            <TR isHeader className='whitespace-nowrap'>
                                <TH>Nasabah</TH>
                                <TH>Alamat</TH>
                                <TH>Email</TH>
                                <TH>Telepon</TH>
                                <TH className="text-right">Saldo Poin</TH>
                                <TH>Status</TH>
                                <TH className="text-center">Aksi</TH>
                            </TR>
                        </THead>
                        <TBody>
                            {nasabah.data.length > 0 ? (
                                nasabah.data.map((item, index) => (
                                    <TR className='whitespace-nowrap' key={item.id} index={(nasabah.meta.current_page - 1) * nasabah.meta.per_page + index}>
                                        <TD>
                                            <div className="flex items-center">
                                                <Avatar 
                                                    src={item.profil?.foto_profil ? `/storage/${item.profil.foto_profil}` : null} 
                                                    name={item.profil?.nama}
                                                    size="sm"
                                                    className="me-3"
                                                />
                                                <div>
                                                    <div className="font-medium text-slate-700">{item.profil.nama}</div>
                                                </div>
                                            </div>
                                        </TD>
                                        <TD>
                                            <div className="text-sm text-slate-600 max-w-[200px] truncate" title={item.profil.alamat}>
                                                {item.profil.alamat || '-'}
                                            </div>
                                        </TD>
                                        <TD>
                                            <div className="text-slate-600 flex items-center text-sm">
                                                {item.email}
                                            </div>
                                        </TD>
                                        <TD>
                                            <div className="text-slate-600 flex items-center text-sm">
                                                {item.profil.no_hp || '-'}
                                            </div>
                                        </TD>
                                        <TD className="text-center">
                                            <span className="font-medium text-slate-800">
                                                {new Intl.NumberFormat('id-ID').format(item.profil.saldo_poin)}
                                            </span>
                                        </TD>
                                        <TD>
                                            <span className={`px-3 py-1.5 text-[9px] font-medium text-white uppercase tracking-wider ${
                                                item.is_aktif ? 'bg-emerald-500' : 'bg-red-500'
                                            }`}>
                                                {item.is_aktif ? 'Aktif' : 'Non-Aktif'}
                                            </span>
                                        </TD>
                                        <TD className="text-right">
                                            <div className="flex justify-center space-x-2">
                                                <Button className="!bg-gray-200 !text-gray-800 hover:bg-gray-600 p-2 rounded-sm shadow-xs" title="QR Code">
                                                    <QrCode className="w-3.5 h-3.5" />
                                                </Button>
                                                <Link href={route('master.nasabah.edit', item.id)}>
                                                    <Button className="bg-amber-500 text-white hover:bg-amber-600 p-2 rounded-sm shadow-xs" title="Edit">
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TD>
                                    </TR>
                                ))
                            ) : (
                                <TR>
                                    <TD colSpan={8} className="py-12 text-center text-slate-400">
                                        <p>Belum ada data nasabah tersedia.</p>
                                    </TD>
                                </TR>
                            )}
                        </TBody>
                    </Table>

                    <Pagination 
                        links={nasabah.links} 
                        meta={nasabah.meta} 
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
