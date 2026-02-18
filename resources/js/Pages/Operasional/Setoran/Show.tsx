import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, X } from 'lucide-react';
import Alert from '@/Components/Base/Alert';
import Button from '@/Components/Base/Button';
import { Table, THead, TBody, TR, TH, TD } from '@/Components/Base/Table';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import Avatar from '@/Components/Avatar';

interface Props {
    transaksi: any;
}

export default function Show({ transaksi }: Props) {
    const { patch, delete: destroy, processing } = useForm();
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    const handleStatusUpdate = (status: 'berhasil' | 'dibatalkan') => {
        const action = status === 'berhasil' ? 'Mengaktifkan Kembali' : 'Batalkan';
        const label = status === 'berhasil' ? 'mengaktifkan kembali' : 'batalkan';
        
        Alert.confirm({
            title: `${action}?`,
            text: `Apakah Anda yakin ingin ${label} transaksi ini?`,
            confirmButtonText: `Ya, ${action}`,
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('operasional.setoran.update-status', transaksi.id), { status }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Alert.success({
                            title: 'Berhasil!',
                            text: `Transaksi berhasil ${status === 'berhasil' ? 'diaktifkan' : 'dibatalkan'}.`,
                            timer: 1500,
                            showConfirmButton: false,
                        });
                    }
                });
            }
        });
    };


    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'berhasil': return 'bg-emerald-600 text-white';
            case 'dibatalkan': return 'bg-red-600 text-white';
            default: return 'bg-emerald-600 text-white';
        }
    };

    const photos = transaksi.foto_bukti || [];

    return (
        <AuthenticatedLayout>
            <Head title={`Detail Transaksi #${transaksi.kode_transaksi}`} />

            <div className="mb-6">
                <Link 
                    href={route('operasional.setoran.index')}
                    className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
                >
                    <ArrowLeft size={16} className="me-2" />
                    Kembali
                </Link>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Detail Transaksi</h1>
                            <p className="text-sm text-slate-500 italic">#{transaksi.kode_transaksi}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {transaksi.status === 'dibatalkan' ? (
                            <Button 
                                onClick={() => handleStatusUpdate('berhasil')}
                                disabled={processing}
                                variant="primary"
                                className="bg-emerald-600 hover:bg-emerald-700 rounded-sm"
                            >
                                <CheckCircle size={14} className="me-2" />
                                Aktifkan Kembali
                            </Button>
                        ) : (
                            <Button 
                                onClick={() => handleStatusUpdate('dibatalkan')}
                                disabled={processing}
                                variant="danger"
                                className="bg-red-600 text-xs hover:bg-red-700 rounded-sm"
                            >
                                <X size={15} className="me-2" />
                                Batalkan Transaksi
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: General Info & Items */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Status Label */}
                    <div className={`px-4 py-3 flex items-center justify-between ${getStatusStyles(transaksi.status)}`}>
                        <div className="flex items-center gap-2">
                            <span className="font-medium uppercase tracking-widest text-xs">
                                Status Transaksi: {transaksi.status === 'dibatalkan' ? 'Dibatalkan' : 'Berhasil'}
                            </span>
                        </div>
                        <span className="text-xs opacity-80 italic font-medium">Update: {formatDate(transaksi.updated_at)}</span>
                    </div>

                    {/* Waste Items Table */}
                    <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-center">Rincian Sampah</h3>
                        </div>
                        <Table>
                            <THead>
                                <TR>
                                    <TH className="ps-6 font-bold text-slate-800">Jenis Sampah</TH>
                                    <TH className="font-bold text-slate-800">Kategori</TH>
                                    <TH className="text-center font-bold text-slate-800">Berat</TH>
                                    <TH className="text-end pe-6 font-bold text-slate-800">Poin</TH>
                                </TR>
                            </THead>
                            <TBody>
                                {transaksi.detail?.map((item: any) => (
                                    <TR key={item.id}>
                                        <TD className="ps-6 text-slate-600 text-sm">
                                            {item.sampah?.nama_sampah}
                                        </TD>
                                        <TD className="text-xs text-slate-500 uppercase">
                                            {item.sampah?.kategori}
                                        </TD>
                                        <TD className="text-center text-sm">
                                            {Number(item.berat).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                        </TD>
                                        <TD className="text-end pe-6 text-sm text-slate-700">
                                            {Number(item.subtotal_poin).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </TD>
                                    </TR>
                                ))}
                            </TBody>
                            <tfoot>
                                <tr className="bg-slate-50">
                                    <td colSpan={2} className="px-6 py-4 text-xs font-bold text-slate-500 tracking-widest border-t border-slate-100 text-center">Ringkasan Penimbangan</td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-800 border-t border-slate-100">{Number(transaksi.total_berat).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg</td>
                                    <td className="px-6 py-4 text-end pe-6 font-bold text-slate-800 border-t border-slate-100">{Number(transaksi.total_poin).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} poin</td>
                                </tr>
                            </tfoot>
                        </Table>
                    </div>

                    {/* Proof Photos */}
                    <div className="bg-white rounded-sm border border-slate-200 overflow-hidden p-6">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b pb-2">Foto Bukti</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {photos.length > 0 ? (
                                photos.map((photo: string, i: number) => (
                                    <div 
                                        key={i} 
                                        className="aspect-video rounded-sm overflow-hidden bg-slate-100 border border-slate-200 transition-all duration-300 cursor-zoom-in hover:opacity-90"
                                        onClick={() => setSelectedPhoto(photo)}
                                    >
                                        <img 
                                            src={photo} 
                                            alt={`Bukti ${i+1}`} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="md:col-span-3 py-10 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-sm text-slate-400">
                                    <span className="text-xs font-medium italic">Tidak ada lampiran foto</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Identity & Meta */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Nasabah & PIC Info */}
                    <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 space-y-8">
                            {/* Member */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b pb-1">Data Nasabah</h3>
                                <div className="flex items-center gap-4">
                                    <Avatar 
                                        src={transaksi.member?.profil?.foto_profil ? `/storage/${transaksi.member.profil.foto_profil}` : null} 
                                        name={transaksi.member?.profil?.nama}
                                        size="md"
                                    />
                                    <div>
                                        <p className="font-semibold text-slate-800">{transaksi.member?.profil?.nama || 'N/A'}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-tight">NIK: {transaksi.member?.profil?.nik || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Petugas */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b pb-1">Petugas (PIC)</h3>
                                <div className="flex items-center gap-4">
                                    <Avatar 
                                        src={transaksi.petugas?.profil?.foto_profil ? `/storage/${transaksi.petugas.profil.foto_profil}` : null} 
                                        name={transaksi.petugas?.profil?.nama}
                                        size="md"
                                    />
                                    <div>
                                        <p className="font-semibold text-slate-800">{transaksi.petugas?.profil?.nama || 'Sistem Terintegrasi'}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-tight">{transaksi.petugas?.profil?.jabatan || 'Petugas Lapangan'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="bg-white rounded-sm border border-slate-200 p-6">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b pb-2">
                            Log Transaksi
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Lokasi Setor</p>
                                    <p className="text-sm font-semibold text-slate-700">{transaksi.pos?.nama_pos || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Tanggal Input</p>
                                    <p className="text-sm font-semibold text-slate-700">{formatDate(transaksi.tanggal_waktu)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Waktu Selesai</p>
                                    <p className="text-sm font-semibold text-slate-700">{formatTime(transaksi.tanggal_waktu)} WIB</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Image Preview Modal */}
            <Modal show={!!selectedPhoto} onClose={() => setSelectedPhoto(null)} maxWidth="3xl">
                <div className="p-2 bg-white relative">
                    <button 
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="rounded-sm overflow-hidden shadow-sm">
                        <img 
                            src={selectedPhoto || ''} 
                            alt="Bukti Preview" 
                            className="w-full h-auto max-h-[85vh] object-contain mx-auto"
                        />
                    </div>
                    <div className="mt-4 flex justify-between items-center px-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Preview Foto Bukti</span>
                        <a 
                            href={selectedPhoto || ''} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-600 hover:text-emerald-700 underline"
                        >
                            Buka di Tab Baru
                        </a>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
