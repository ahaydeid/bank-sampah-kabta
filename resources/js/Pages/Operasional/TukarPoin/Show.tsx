import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Table, THead, TBody, TR, TH, TD } from '@/Components/Base/Table';
import { ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import Button from '@/Components/Base/Button';

interface Props {
    transaksi: any;
}

export default function Show({ transaksi }: Props) {
    const handleApprove = () => {
        Swal.fire({
            title: 'Setujui Penukaran?',
            text: `Apakah Anda yakin ingin menyetujui penukaran ${transaksi.kode_penukaran}? Stok barang akan dikunci sementara.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Setujui',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#0284c7', // sky-600
            cancelButtonColor: '#6b7280', // gray-500
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('operasional.tukar-poin.approve', transaksi.id));
            }
        });
    };

    const handleReject = () => {
        Swal.fire({
            title: 'Tolak Penukaran?',
            text: `Apakah Anda yakin ingin menolak penukaran ${transaksi.kode_penukaran}? Poin nasabah akan dikembalikan otomatis.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Tolak',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#dc2626', // red-600
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('operasional.tukar-poin.reject', transaksi.id));
            }
        });
    };

    const handleUndoApprove = () => {
        Swal.fire({
            title: 'Batalkan Persetujuan?',
            text: `Apakah Anda yakin ingin membatalkan persetujuan untuk ${transaksi.kode_penukaran}? Status akan kembali menjadi "Menunggu" dan stok akan dikembalikan ke gudang.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Batalkan Persetujuan',
            cancelButtonText: 'Kembali',
            confirmButtonColor: '#e11d48', // rose-600
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('operasional.tukar-poin.undo-approve', transaksi.id));
            }
        });
    };

    const handleUndoReject = () => {
        Swal.fire({
            title: 'Batalkan Penolakan?',
            text: `Apakah Anda yakin ingin membatalkan penolakan untuk ${transaksi.kode_penukaran}? Status akan kembali menjadi "Menunggu" dan poin nasabah akan dipotong kembali.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Batalkan Penolakan',
            cancelButtonText: 'Kembali',
            confirmButtonColor: '#0284c7', // sky-600 (use neutral or sky slightly safer)
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('operasional.tukar-poin.undo-reject', transaksi.id));
            }
        });
    };

    const handleFinalize = () => {
        Swal.fire({
            title: 'Selesaikan Penolakan?',
            text: `Pastikan penolakan sudah final. Transaksi akan ditandai sebagai Selesai (Ditolak) dan tidak bisa dibatalkan lagi.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Selesaikan',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#10b981', // emerald-500
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('operasional.tukar-poin.finalize', transaksi.id));
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

    const getStatusInfo = (item: any) => {
        const status = item.status;
        const s = status ? status.trim().toLowerCase() : '';
        
        // if (s === 'disetujui' && item.tanggal_selesai) {
        //     return { label: 'Selesai', color: 'bg-emerald-600 text-white' };
        // }

        switch (s) {
            case 'menunggu': return { label: 'Menunggu', color: 'bg-slate-500 text-white' };
            case 'disetujui': return { label: 'Disetujui', color: 'bg-sky-600 text-white' };
            // case 'selesai': return { label: 'Selesai', color: 'bg-emerald-600 text-white' }; // Handled above
            case 'kadaluwarsa': return { label: 'Kadaluwarsa', color: 'bg-slate-200 text-slate-500' };
            case 'dibatalkan': return { label: 'Ditolak', color: 'bg-rose-600 text-white' };
            default: return { label: status ? status : 'Tidak dikenal', color: 'bg-gray-400 text-white' };
        }
    };

    const statusInfo = getStatusInfo(transaksi.status);

    const isOutOfStock = (item: any) => item.reward && item.reward.stok < item.jumlah;

    return (
        <AuthenticatedLayout>
            <Head title={`Detail Penukaran ${transaksi.kode_penukaran}`} />

            <div className="mb-6 px-1">
                <Link 
                    href={route('operasional.tukar-poin')}
                    className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
                >
                    <ArrowLeft size={16} className="me-2" />
                    Kembali
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   {/* Header with ID and Status */}
            <div className="flex items-center gap-4 mb-8">
                <h1 className="text-2xl font-black text-gray-800 tracking-tighter uppercase">{transaksi.kode_penukaran}</h1>
                {(() => {
                    const status = getStatusInfo(transaksi);
                    return (
                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm ${status.color}`}>
                            {status.label}
                        </span>
                    );
                })()}
            </div>


                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white overflow-hidden">
                        <div className="px-6 py-4 font-bold text-gray-700 uppercase text-[10px] tracking-widest">
                            Daftar Barang Reward
                        </div>
                        <Table>
                            <THead>
                                <TR isHeader className="bg-neutral-25">
                                    <TH className="font-bold text-gray-600 text-[10px] uppercase p-4 tracking-widest">Nama Barang</TH>
                                    <TH className="font-bold text-gray-600 text-[10px] uppercase p-4 tracking-widest text-center">Jumlah</TH>
                                    <TH className="font-bold text-gray-600 text-[10px] uppercase p-4 tracking-widest text-right">Poin</TH>
                                </TR>
                            </THead>
                            <TBody>
                                {transaksi.detail.map((item: any, index: number) => (
                                    <TR key={item.id} index={index} className="border-b border-gray-50">
                                        <TD className="py-4">
                                            <div className="flex flex-col">
                                                <span className="text-gray-800 font-normal">{item.reward?.nama_reward || '-'}</span>
                                                {transaksi.status === 'menunggu' && isOutOfStock(item) && (
                                                    <span className="text-[10px] text-rose-600 font-bold mt-1 uppercase tracking-tight">
                                                        STOK TIDAK CUKUP ({item.reward?.stok})
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{item.reward?.kategori_reward}</span>
                                            </div>
                                        </TD>
                                        <TD className="text-center font-normal text-gray-700 py-4">{item.jumlah}</TD>
                                        <TD className="text-right font-normal text-gray-900 py-4">
                                            {new Intl.NumberFormat('id-ID').format(item.subtotal_poin)}
                                        </TD>
                                    </TR>
                                ))}
                            </TBody>
                            <tfoot className="bg-neutral-50">
                                <TR>
                                    <TD colSpan={2} className="text-right font-bold text-gray-600 p-4 text-[10px] uppercase tracking-widest">Total Biaya Poin:</TD>
                                    <TD className="text-right text-lg font-bold text-gray-900 p-4">
                                        {new Intl.NumberFormat('id-ID').format(transaksi.total_poin)}
                                    </TD>
                                </TR>
                            </tfoot>
                        </Table>
                    </div>

                    <div className="bg-white rounded-sm border border-gray-200 shadow-xs p-6">
                        <h3 className="font-bold text-gray-700 uppercase text-[10px] tracking-widest mb-6 pb-2 border-b border-gray-50">
                            Informasi Tambahan
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest mb-1">Admin Approval</p>
                                    <p className="text-xs font-normal text-gray-700">
                                        {transaksi.admin?.profil?.nama || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest mb-1">Diserahkan Oleh</p>
                                    <p className="text-xs font-normal text-gray-700">
                                        {transaksi.petugas?.profil?.nama || '-'}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest mb-1">Lokasi Pengambilan</p>
                                    <p className="text-xs font-normal text-gray-700">
                                        {transaksi.pos?.nama_pos || '-'}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                        {transaksi.tanggal_selesai ? 'Waktu Selesai' : 'Batas Waktu Pengambilan'}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                        {transaksi.tanggal_selesai 
                            ? `${formatDate(transaksi.tanggal_selesai)} ${formatTime(transaksi.tanggal_selesai)}`
                            : (transaksi.expired_at 
                                ? `${formatDate(transaksi.expired_at)} ${formatTime(transaksi.expired_at)}` 
                                : '-')
                        }
                    </span>
                </div>    
                                </div>
                            </div>
                        </div>
                    </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-sm border border-gray-200 shadow-xs p-6">
                        <h3 className="font-bold text-gray-700 uppercase text-[10px] tracking-widest mb-6 pb-2 border-b border-gray-50">
                            Data Nasabah
                        </h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm">
                                {transaksi.member?.profil?.nama?.charAt(0) || 'N'}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-sm leading-none mb-1">{transaksi.member?.profil?.nama || '-'}</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-50">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Saldo Poin</span>
                                <span className="font-bold text-gray-700 text-xs text-right">
                                    {new Intl.NumberFormat('id-ID').format(transaksi.member?.profil?.saldo_poin || 0)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-50 rounded-sm border border-gray-200 p-6">
                        <h4 className="font-bold text-gray-700 text-[10px] uppercase tracking-widest mb-4">Penting</h4>
                        <ul className="text-[11px] text-gray-500 space-y-3">
                            <li className="flex gap-2">
                                <span className="text-gray-300">•</span>
                                <span className="font-normal leading-relaxed">Pastikan ketersediaan stok fisik barang sebelum menyetujui.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-gray-300">•</span>
                                <span className="font-normal leading-relaxed">Sekali disetujui, stok barang akan langsung dikurangi di gudang.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-gray-300">•</span>
                                <span className="font-normal leading-relaxed">Poin sudah dipotong saat nasabah melakukan checkout.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {transaksi.status === 'menunggu' && (
                <div className="flex justify-end items-center gap-3 mt-8 pb-10">
                    <Button 
                        variant="danger"
                        onClick={handleReject}
                        className="bg-rose-600 hover:bg-rose-700 text-[10px] font-bold py-2.5 px-8 tracking-widest"
                    >
                        Tolak
                    </Button>
                    <Button 
                        variant="info"
                        onClick={handleApprove}
                        className="bg-sky-600 hover:bg-sky-700 text-[10px] font-bold py-2.5 px-8 tracking-widest"
                    >
                        Setujui
                    </Button>
                </div>
            )}

            {transaksi.status === 'disetujui' && !transaksi.tanggal_selesai && (
                <div className="flex justify-end items-center gap-3 mt-8 pb-10">
                    <Button 
                        variant="danger"
                        onClick={handleUndoApprove}
                        className="bg-rose-600 hover:bg-rose-700 text-[10px] font-bold py-2.5 px-8 tracking-widest"
                    >
                        Batalkan Persetujuan
                    </Button>
                </div>
            )}

            {transaksi.status === 'dibatalkan' && !transaksi.tanggal_selesai && (
                <div className="flex justify-end gap-3 mt-8">
                    <Button 
                        variant="info"
                        onClick={handleUndoReject}
                        className="text-[10px] font-bold py-2.5 px-8 tracking-widest"
                    >
                        Batalkan Penolakan
                    </Button>
                    <Button 
                        variant="success"
                        onClick={handleFinalize}
                        className="text-[10px] font-bold py-2.5 px-8 tracking-widest"
                    >
                        Selesaikan
                    </Button>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
