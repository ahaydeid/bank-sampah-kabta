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
import { Loader2 } from 'lucide-react';
import Button from '@/Components/Base/Button';
import Swal from 'sweetalert2';

interface Props {
    transaksi: {
        data: any[];
        links: any[];
        meta: any;
    };
    filters: {
        search?: string;
        status?: string;
        per_page?: number;
    };
}

export default function Index({ transaksi, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [perPage, setPerPage] = useState(filters.per_page || 10);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters.search || '') || status !== (filters.status || '')) {
                router.get(route('operasional.tukar-poin'), { search, status, per_page: perPage }, { preserveState: true });
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, status]);

    const handlePerPageChange = (val: number) => {
        setPerPage(val);
        router.get(route('operasional.tukar-poin'), { search, status, per_page: val }, { preserveState: true });
    };

    const handleApprove = (id: number, code: string) => {
        Swal.fire({
            title: 'Setujui Penukaran?',
            text: `Apakah Anda yakin ingin menyetujui penukaran ${code}? Stok barang akan dikunci sementara.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Setujui',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#0284c7', // sky-600
            cancelButtonColor: '#6b7280', // gray-500
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('operasional.tukar-poin.approve', id));
            }
        });
    };

    const handleReject = (id: number, code: string) => {
        Swal.fire({
            title: 'Tolak Penukaran?',
            text: `Apakah Anda yakin ingin menolak penukaran ${code}? Poin nasabah akan dikembalikan otomatis.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Tolak',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#dc2626', // red-600
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('operasional.tukar-poin.reject', id));
            }
        });
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const formatTime = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusInfo = (status: string) => {
        const s = status ? status.trim().toLowerCase() : '';
        switch (s) {
            case 'menunggu': return { label: 'Menunggu', color: 'bg-slate-500 text-white' };
            case 'disetujui': return { label: 'Siap Diambil', color: 'bg-sky-500 text-white' };
            case 'selesai': return { label: 'Selesai', color: 'bg-emerald-500 text-white' };
            case 'kadaluwarsa': return { label: 'Kadaluwarsa', color: 'bg-slate-200 text-slate-500' };
            case 'dibatalkan': return { label: 'Batal', color: 'bg-rose-500 text-white' };
            default: return { label: status ? status : 'Tidak dikenal', color: 'bg-amber-400 text-white' };
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Permintaan Penukaran Poin" />

            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Permintaan Penukaran Poin</h1>
                </div>
            </div>

            <div className="bg-white py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 mb-6">
                    <div className="flex flex-1 items-center gap-4">
                        <TableSearch 
                            value={search} 
                            onChange={setSearch} 
                            placeholder="Cari Kode atau Nasabah..."
                            className="flex-1 rounded-sm"
                        />
                        <select 
                            value={status} 
                            onChange={(e) => setStatus(e.target.value)}
                            className="rounded-sm border-gray-200 text-sm focus:border-sky-600 focus:ring-sky-600 py-2 bg-gray-50"
                        >
                            <option value="">Status</option>
                            <option value="menunggu">Menunggu</option>
                            <option value="disetujui">Siap Diambil</option>
                            <option value="selesai">Selesai</option>
                            <option value="kadaluwarsa">Kadaluwarsa</option>
                            <option value="dibatalkan">Batal</option>
                        </select>
                    </div>
                    <PerPageSelector 
                        value={perPage} 
                        onChange={handlePerPageChange} 
                    />
                </div>

                <Table>
                    <THead>
                        <TR isHeader className='whitespace-nowrap bg-neutral-50'>
                            <TH className="font-bold text-gray-700 uppercase p-4 text-xs tracking-wider">Kode</TH>
                            <TH className="font-bold text-gray-700 uppercase p-4 text-xs tracking-wider">Nasabah</TH>
                            <TH className="font-bold text-gray-700 uppercase p-4 text-xs tracking-wider text-right">Poin</TH>
                            <TH className="font-bold text-gray-700 uppercase p-4 text-xs tracking-wider">Tanggal Request</TH>
                            <TH className="font-bold text-gray-700 uppercase p-4 text-xs tracking-wider">Status</TH>
                            <TH className="font-bold text-gray-700 uppercase p-4 text-xs tracking-wider text-center">Aksi</TH>
                        </TR>
                    </THead>
                    <TBody>
                        {transaksi.data.length > 0 ? (
                            transaksi.data.map((item, index) => (
                                <TR key={item.id} index={index} className='whitespace-nowrap border-b border-gray-50 hover:bg-neutral-50 transition-colors'>
                                    <TD className="text-gray-900 font-normal py-4">{item.kode_penukaran}</TD>
                                    <TD className="py-4">
                                        <div className="flex flex-col">
                                            <span className="text-gray-800 font-normal">{item.member?.profil?.nama || '-'}</span>
                                        </div>
                                    </TD>
                                    <TD className="text-right text-gray-900 font-normal py-4">
                                        {new Intl.NumberFormat('id-ID').format(item.total_poin)}
                                    </TD>
                                    <TD className="py-4">
                                        <div className="flex flex-col text-xs text-gray-600">
                                            <span className="font-normal text-xs">{formatDate(item.tanggal)}</span>
                                            <span className="text-gray-400 text-xs">{formatTime(item.tanggal)}</span>
                                        </div>
                                    </TD>
                                    <TD className="py-4">
                                        {(() => {
                                            const statusInfo = getStatusInfo(item.status);
                                            return (
                                                <span className={`px-3 py-1.5 text-[9px] font-medium uppercase tracking-widest ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            );
                                        })()}
                                    </TD>
                                    <TD className="text-center py-4">
                                        <Link href={route('operasional.tukar-poin.show', item.id)}>
                                            <Button className="bg-amber-500 text-white hover:bg-amber-600 p-2 rounded-sm">
                                                <Loader2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </Link>
                                    </TD>
                                </TR>
                            ))
                        ) : (
                            <TR>
                                <TD colSpan={6} className="text-center py-16 text-gray-300">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-sm font-medium">Data transaksi tidak ditemukan.</span>
                                    </div>
                                </TD>
                            </TR>
                        )}
                    </TBody>
                </Table>

                <div className="px-4 py-4 mt-2 border-t border-gray-50">
                    <Pagination links={transaksi.links} meta={transaksi.meta} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
