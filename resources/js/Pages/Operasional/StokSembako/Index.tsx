import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
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
import { AlertCircle, Package, TrendingDown, Info, Settings2 } from 'lucide-react';
import Button from '@/Components/Base/Button';

interface Props {
    reward: {
        data: any[];
        links: any[];
        meta: any;
    };
    pos_lokasi: any[];
    filters: {
        search?: string;
        pos_id?: string | number;
        per_page?: number;
    };
}

export default function Index({ reward, pos_lokasi, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [posId, setPosId] = useState(filters.pos_id || '');
    const [perPage, setPerPage] = useState(filters.per_page || 10);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const params: any = { search, per_page: perPage };
            if (posId) params.pos_id = posId;
            
            router.get(route('operasional.stok-sembako'), params, { preserveState: true });
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, posId]);

    const handlePerPageChange = (val: number) => {
        setPerPage(val);
        router.get(route('operasional.stok-sembako'), { search, per_page: val, pos_id: posId }, { preserveState: true });
    };

    const getStockStatus = (stok: number) => {
        if (stok === 0) return { label: 'HABIS', color: 'bg-rose-500 text-white' };
        if (stok < 10) return { label: 'MENIPIS', color: 'bg-amber-500 text-white' };
        return { label: 'TERSEDIA', color: 'bg-emerald-500 text-white' };
    };

    return (
        <AuthenticatedLayout>
            <Head title="Monitoring Stok Sembako" />

            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Monitoring Stok Sembako</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={route('operasional.stok-sembako.edit')}>
                        <Button variant='warning' size='sm'>
                            <Settings2 className="w-4 h-4 mr-2" />
                            Kelola Stok
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="bg-white py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 mb-6">
                    <div className="flex flex-1 items-center gap-4">
                        <TableSearch 
                            value={search} 
                            onChange={setSearch} 
                            placeholder="Cari Barang..."
                            className="flex-1 max-w-sm rounded-sm border-gray-300"
                        />
                        <select 
                            value={posId} 
                            onChange={(e) => setPosId(e.target.value)}
                            className="rounded-sm border-gray-300 text-xs focus:border-gray-800 focus:ring-gray-800 py-2 bg-white min-w-[200px]"
                        >
                            <option value="">Semua Pos (Pilih Pos)</option>
                            {pos_lokasi.map((pos) => (
                                <option key={pos.id} value={pos.id}>{pos.nama_pos}</option>
                            ))}
                        </select>
                    </div>
                    <PerPageSelector 
                        value={perPage} 
                        onChange={handlePerPageChange} 
                    />
                </div>

                <Table>
                    <THead>
                        <TR isHeader className='whitespace-nowrap bg-gray-50/50'>
                            <TH className="font-bold text-gray-700 uppercase p-4 text-[10px] tracking-widest border-b border-gray-100">Nama Barang</TH>
                            <TH className="font-bold text-gray-700 uppercase p-4 text-[10px] tracking-widest border-b border-gray-100">Kategori</TH>
                            <TH className="font-bold text-gray-700 uppercase p-4 text-[10px] tracking-widest border-b border-gray-100 text-right">Poin</TH>
                            <TH className="font-bold text-gray-700 uppercase p-4 text-[10px] tracking-widest border-b border-gray-100 text-center">Stok</TH>
                            <TH className="font-bold text-gray-700 uppercase p-4 text-[10px] tracking-widest border-b border-gray-100 text-center">Status</TH>
                        </TR>
                    </THead>
                    <TBody>
                        {reward.data.length > 0 ? (
                            reward.data.map((item, index) => {
                                const stok = item.stok_saat_ini ?? 0;
                                const status = getStockStatus(stok);
                                
                                return (
                                    <TR key={item.id} index={index} className='whitespace-nowrap border-b border-gray-50 hover:bg-gray-50/30 transition-colors'>
                                        <TD className="py-3 px-4">
                                            <span className="font-normal text-gray-800 text-sm">{item.nama_reward}</span>
                                        </TD>
                                        <TD className="py-3 px-4 text-sm font-normal text-gray-500">
                                            {item.kategori_reward}
                                        </TD>
                                        <TD className="text-right py-3 px-4 text-sm font-normal text-gray-700">
                                            {new Intl.NumberFormat('id-ID').format(item.poin_tukar)}
                                        </TD>
                                        <TD className="text-center py-3 px-4">
                                            <span className={`text-sm font-normal ${stok < 10 ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                                                {stok}
                                            </span>
                                        </TD>
                                        <TD className="text-center py-3 px-4">
                                            <span className={`px-3 py-1.5 text-[9px] font-medium uppercase tracking-wider ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </TD>
                                    </TR>
                                );
                            })
                        ) : (
                            <TR>
                                <TD colSpan={5} className="text-center py-20 text-gray-400">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-sm font-medium text-gray-500">
                                            {posId 
                                                ? 'Belum ada barang yang didaftarkan di unit ini.' 
                                                : 'Data barang tidak ditemukan.'}
                                        </span>
                                        {posId && (
                                            <Link href={route('operasional.stok-sembako.edit', { pos_id: posId })}>
                                                <span className="text-xs text-blue-600 font-bold hover:underline mt-2">Kelola Katalog Berang &rarr;</span>
                                            </Link>
                                        )}
                                    </div>
                                </TD>
                            </TR>
                        )}
                    </TBody>
                </Table>

                <div className="px-4 py-4 mt-2 border-t border-gray-50">
                    <Pagination links={reward.links} meta={reward.meta} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

const CheckCircle = ({ size, className }: { size?: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size ?? 24} height={size ?? 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
