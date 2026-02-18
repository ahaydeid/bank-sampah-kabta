import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Table, 
    THead, 
    TBody, 
    TR, 
    TH, 
    TD, 
    TableSearch, 
    PerPageSelector, 
    Pagination 
} from '@/Components/Base/Table';
import { useState, useEffect } from 'react';
import { Eye, Search } from 'lucide-react';
import Button from '@/Components/Base/Button';

interface Props {
    transaksi: {
        data: any[];
        links: any[];
        meta: any;
    };
    filters: {
        search?: string;
        per_page?: number;
        date_filter?: string;
    };
}

export default function Index({ transaksi, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || 10);
    const [dateFilter, setDateFilter] = useState(filters.date_filter || 'all');

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(
                    route('operasional.setoran.index'), 
                    { search, per_page: perPage, date_filter: dateFilter === 'all' ? '' : dateFilter }, 
                    { preserveState: true }
                );
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const handlePerPageChange = (val: number) => {
        setPerPage(val);
        router.get(
            route('operasional.setoran.index'), 
            { search, per_page: val, date_filter: dateFilter === 'all' ? '' : dateFilter }, 
            { preserveState: true }
        );
    };

    const handleDateFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setDateFilter(val);
        router.get(
            route('operasional.setoran.index'),
            { search, per_page: perPage, date_filter: val === 'all' ? '' : val },
            { preserveState: true }
        );
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long' });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'berhasil': return 'bg-emerald-500 text-white';
            case 'dibatalkan': return 'bg-rose-500 text-white';
            default: return 'bg-emerald-500 text-white';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Setoran Sampah" />

            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Setoran Sampah</h1>
                </div>
            </div>

            <div className="bg-white py-4 rounded-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between px-4 gap-4 mb-6">
                    <div className="flex items-center gap-4 flex-1">
                        <TableSearch 
                            value={search} 
                            onChange={setSearch} 
                            placeholder="Cari ID atau Nasabah..."
                            className="w-full max-w-sm"
                        />
                        <select
                            value={dateFilter}
                            onChange={handleDateFilterChange}
                            className="rounded-sm border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500 py-2 bg-white"
                        >
                            <option value="all">Semua</option>
                            <option value="today">Hari Ini</option>
                        </select>
                    </div>
                    <PerPageSelector 
                        value={perPage} 
                        onChange={handlePerPageChange} 
                    />
                </div>

                <Table>
                    <THead>
                        <TR isHeader className='whitespace-nowrap'>
                            <TH>ID Transaksi</TH>
                            <TH>Nasabah</TH>
                            <TH>PIC (Petugas)</TH>
                            <TH>Tanggal</TH>
                            <TH>Pos Unit</TH>
                            <TH>Status</TH>
                            <TH className="text-center">Aksi</TH>
                        </TR>
                    </THead>
                    <TBody>
                        {transaksi.data.length > 0 ? (
                            transaksi.data.map((item, index) => (
                                <TR key={item.id} index={index} className='whitespace-nowrap'>
                                    <TD className="font-medium text-slate-700">{item.kode_transaksi}</TD>
                                    <TD>
                                        <div className="flex flex-col">
                                            <span className="text-slate-700">{item.member?.profil?.nama || 'N/A'}</span>
                                        </div>
                                    </TD>
                                    <TD>
                                        <span className="text-sm text-slate-700">{item.petugas?.profil?.nama || 'Sistem'}</span>
                                    </TD>
                                    <TD>
                                        <div className="flex flex-col">
                                            <span className="text-slate-700 text-xs">{formatDate(item.tanggal_waktu)}</span>
                                            <span className="text-xs text-slate-400">{formatTime(item.tanggal_waktu)}</span>
                                        </div>
                                    </TD>
                                    <TD>
                                        <span className="px-2 py-1 text-slate-700">
                                            {item.pos?.nama_pos || 'N/A'}
                                        </span>
                                    </TD>
                                    <TD className="text-center">
                                        <span className={`px-3 py-1.5 text-[9px] font-medium uppercase tracking-wider ${getStatusColor(item.status)}`}>
                                            {item.status === 'dibatalkan' ? 'Batal' : 'Berhasil'}
                                        </span>
                                    </TD>
                                    <TD className="text-center">
                                        <Link href={route('operasional.setoran.show', item.id)}>
                                            <Button className="bg-amber-500 text-white hover:bg-amber-600 p-2 rounded-sm">
                                                <Eye className="w-3.5 h-3.5" />
                                            </Button>
                                        </Link>
                                    </TD>
                                </TR>
                            ))
                        ) : (
                            <TR>
                                <TD colSpan={9} className="text-center py-5 text-slate-400">
                                    Tidak ada data transaksi ditemukan.
                                </TD>
                            </TR>
                        )}
                    </TBody>
                </Table>

                <Pagination links={transaksi.links} meta={transaksi.meta} />
            </div>
        </AuthenticatedLayout>
    );
}
