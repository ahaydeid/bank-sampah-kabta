import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { Save, ArrowLeft, Package, MapPin, Search, Plus, X, ImagePlus } from 'lucide-react';
import { FormEventHandler, useEffect, useState, useCallback, useRef } from 'react';
import Button from '@/Components/Base/Button';
import Input from '@/Components/Base/Input';
import Label from '@/Components/Base/Label';
import Alert from '@/Components/Base/Alert';
import { Table, THead, TBody, TR, TH, TD, TableSearch, Pagination, PerPageSelector } from '@/Components/Base/Table';
import { debounce } from '@/lib/debounce';

interface Reward {
    id: number;
    nama_reward: string;
    kategori_reward: string;
    stok_saat_ini: number;
}

interface Props {
    rewards: {
        data: Reward[];
        links: any[];
        meta: any;
    };
    pos_lokasi: any[];
    filters: {
        pos_id?: string | number;
        search?: string;
        per_page?: number;
    };
}

export default function Manage({ rewards, pos_lokasi, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        pos_id: filters.pos_id || (pos_lokasi.length > 0 ? pos_lokasi[0].id : ''),
        stok: (rewards.data || []).reduce((acc: any, reward) => {
            acc[reward.id] = reward.stok_saat_ini;
            return acc;
        }, {}),
    });

    // ─── Form untuk tambah kategori sembako (modal) ───────────────────
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const {
        data: kategoriData,
        setData: setKategoriData,
        post: postKategori,
        processing: processingKategori,
        errors: kategoriErrors,
        reset: resetKategori,
    } = useForm({
        nama_reward: '',
        poin_tukar: 0,
        kategori_reward: 'Sembako',
        foto: null as File | null,
        _redirect_back: 'stok-sembako',
    });

    const handleFilter = useCallback(
        debounce((query: string, posId: string | number) => {
            router.get(
                route('operasional.stok-sembako.edit'),
                { search: query, pos_id: posId, per_page: rewards.meta.per_page },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 500),
        [rewards.meta.per_page]
    );

    const onSearchChange = (value: string) => {
        setSearch(value);
        handleFilter(value, data.pos_id);
    };

    const handlePosChange = (id: string) => {
        setData('pos_id', id);
        router.get(route('operasional.stok-sembako.edit'), { pos_id: id, per_page: rewards.meta.per_page }, { preserveState: false });
    };

    const handlePerPageChange = (per_page: number) => {
        router.get(
            route('operasional.stok-sembako.edit'),
            { pos_id: data.pos_id, search, per_page },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        Alert.confirm({
            title: 'Simpan Perubahan Stok?',
            text: 'Jumlah stok untuk semua barang di halaman ini akan diperbarui.',
            confirmButtonText: 'Ya, Simpan',
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('operasional.stok-sembako.update'), {
                    onSuccess: () => {
                        Alert.success({
                            title: 'Berhasil!',
                            text: 'Stok sembako telah diperbarui.',
                        });
                    }
                });
            }
        });
    };

    // ─── Modal Handlers ───────────────────────────────────────────────
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setKategoriData('foto', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleOpenModal = () => {
        resetKategori();
        setPreviewUrl(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetKategori();
        setPreviewUrl(null);
    };

    const handleSubmitKategori: FormEventHandler = (e) => {
        e.preventDefault();

        Alert.confirm({
            title: 'Tambah Kategori Sembako?',
            text: 'Data ini akan ditambahkan ke katalog sembako.',
            confirmButtonText: 'Ya, Tambah',
        }).then((result) => {
            if (result.isConfirmed) {
                postKategori(route('master.reward.store'), {
                    onSuccess: () => {
                        handleCloseModal();
                        Alert.success({
                            title: 'Berhasil!',
                            text: 'Kategori sembako baru berhasil ditambahkan.',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                        // Refresh halaman
                        router.reload();
                    },
                });
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Kelola Stok Sembako" />

            <div className="mb-8 border-b border-slate-200 pb-4">
                <Link
                    href={route('operasional.stok-sembako')}
                    className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
                >
                    <ArrowLeft size={16} className="me-2" />
                    Kembali
                </Link>
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">
                        Kelola Stok Sembako
                    </h2>
                    <Button
                        type="button"
                        onClick={handleOpenModal}
                        className="bg-sankara-green text-white hover:bg-sankara-green/90 uppercase tracking-widest font-bold text-[8px] rounded-sm px-2 h-[30px] shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Tambah Kategori
                    </Button>
                </div>
            </div>

            <div className="py-2">
                <div className="mx-auto">
                    <div className="bg-white overflow-hidden shadow-xs rounded-sm border border-gray-200">
                        <div className="p-8">
                            <form onSubmit={submit} className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Daftar Stok di Unit</h3>
                                            <p className="text-xs text-gray-400 font-normal mt-0.5">Input jumlah stok terkini untuk unit lokasi terpilih.</p>
                                        </div>
                                        <div className="h-10 w-px bg-gray-100 hidden md:block" />
                                        <div className="min-w-[240px]">
                                            <select
                                                value={data.pos_id}
                                                onChange={(e) => handlePosChange(e.target.value)}
                                                className="w-full rounded-sm border-gray-300 text-sm focus:border-gray-800 focus:ring-gray-800 bg-white text-gray-800"
                                            >
                                                {pos_lokasi.map((pos) => (
                                                    <option key={pos.id} value={pos.id}>{pos.nama_pos}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <PerPageSelector value={rewards.meta.per_page} onChange={handlePerPageChange} />
                                        <TableSearch
                                            value={search}
                                            onChange={onSearchChange}
                                            placeholder="Cari nama barang..."
                                            className="max-w-xs text-sm rounded-sm border-gray-300"
                                        />
                                    </div>
                                </div>

                                {rewards.data.length > 0 ? (
                                    <div className="space-y-6">
                                        <Table>
                                            <THead>
                                                <TR isHeader className="whitespace-nowrap border-b border-gray-100">
                                                    <TH className="font-bold text-gray-500 uppercase p-4 text-[11px] tracking-wider text-left">Nama Barang</TH>
                                                    <TH className="font-bold text-gray-500 uppercase p-4 text-[11px] tracking-wider text-left">Kategori</TH>
                                                    <TH className="font-bold text-gray-500 uppercase p-4 text-[11px] tracking-wider text-center w-48">Jumlah Stok</TH>
                                                </TR>
                                            </THead>
                                            <TBody>
                                                {rewards.data.map((reward, index) => (
                                                    <TR key={reward.id} index={index} className="whitespace-nowrap border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                                        <TD className="py-5 px-4 text-left">
                                                            <span className="font-medium text-gray-800 text-sm">{reward.nama_reward}</span>
                                                        </TD>
                                                        <TD className="py-5 px-4 text-sm font-medium text-gray-500 text-left">
                                                            {reward.kategori_reward}
                                                        </TD>
                                                        <TD className="py-5 px-4 text-center">
                                                            <Input
                                                                type="number"
                                                                value={data.stok[reward.id]}
                                                                onChange={(e) => setData('stok', {
                                                                    ...data.stok,
                                                                    [reward.id]: e.target.value
                                                                })}
                                                                className="w-full bg-gray-50 border-gray-200 text-gray-900 rounded-sm text-sm py-2 focus:border-gray-800 focus:ring-gray-800 text-center font-medium"
                                                                placeholder="0"
                                                            />
                                                        </TD>
                                                    </TR>
                                                ))}
                                            </TBody>
                                        </Table>

                                        <div className="flex flex-col md:flex-row justify-between items-center pt-6 gap-4 border-t border-gray-100 mt-4">
                                            <Pagination links={rewards.links} meta={rewards.meta} />

                                            <Button
                                                type="submit"
                                                className="bg-gray-900 text-white hover:bg-black uppercase tracking-widest font-bold text-[10px] rounded-sm px-6 h-[42px]"
                                                isLoading={processing}
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                Simpan Stok
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-5 text-center bg-gray-50/30 rounded-sm border border-dashed border-gray-200">
                                        <div className="max-w-xs mx-auto text-center">
                                            <Package className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                                            <p className="text-gray-500 font-semibold text-sm">Belum Ada Barang</p>
                                            <p className="text-gray-400 text-xs mt-1">Tambahkan kategori sembako baru terlebih dahulu.</p>
                                            <button
                                                type="button"
                                                onClick={handleOpenModal}
                                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-sankara-green hover:text-sankara-green/80 transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Tambah Kategori Sembako
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Modal: Tambah Kategori Sembako ─── */}
            {showModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={handleCloseModal}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">Tambah Kategori Sembako</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Tambahkan barang baru ke katalog sembako</p>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmitKategori} className="p-6 space-y-5">
                            {/* Foto Upload */}
                            <div>
                                <Label value="Foto Barang" className="text-gray-700 font-semibold mb-1.5 text-sm" />
                                <div
                                    className="mt-1 relative group cursor-pointer border-2 border-dashed border-slate-200 hover:border-sankara-green/40 rounded-lg transition-colors flex flex-col items-center justify-center h-36 bg-slate-50/50 overflow-hidden"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100">Ganti foto</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1.5 text-slate-400">
                                            <ImagePlus className="w-8 h-8" />
                                            <span className="text-xs font-medium">Klik untuk upload foto</span>
                                            <span className="text-[10px] text-slate-300">JPG, PNG, max 2MB</span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                {/* @ts-ignore */}
                                {kategoriErrors.foto && <p className="text-red-500 text-xs mt-1">{kategoriErrors.foto}</p>}
                            </div>

                            {/* Nama Barang */}
                            <div>
                                <Label value="Nama Barang" className="text-gray-700 font-semibold mb-1.5 text-sm" />
                                <Input
                                    type="text"
                                    value={kategoriData.nama_reward}
                                    onChange={(e) => setKategoriData('nama_reward', e.target.value)}
                                    className="w-full rounded-sm border-gray-300 focus:border-sankara-green focus:ring-sankara-green/20 text-sm"
                                    placeholder="Contoh: Beras 5kg, Minyak Goreng 1L"
                                />
                                {kategoriErrors.nama_reward && <p className="text-red-500 text-xs mt-1">{kategoriErrors.nama_reward}</p>}
                            </div>

                            {/* Kategori + Poin row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label value="Kategori" className="text-gray-700 font-semibold mb-1.5 text-sm" />
                                    <Input
                                        type="text"
                                        value={kategoriData.kategori_reward}
                                        onChange={(e) => setKategoriData('kategori_reward', e.target.value)}
                                        className="w-full rounded-sm border-gray-300 focus:border-sankara-green focus:ring-sankara-green/20 text-sm"
                                        placeholder="Sembako"
                                    />
                                    {kategoriErrors.kategori_reward && <p className="text-red-500 text-xs mt-1">{kategoriErrors.kategori_reward}</p>}
                                </div>
                                <div>
                                    <Label value="Poin yang Dibutuhkan" className="text-gray-700 font-semibold mb-1.5 text-sm" />
                                    <Input
                                        type="number"
                                        value={kategoriData.poin_tukar}
                                        onChange={(e) => setKategoriData('poin_tukar', Number(e.target.value))}
                                        className="w-full rounded-sm border-gray-300 focus:border-sankara-green focus:ring-sankara-green/20 text-sm"
                                        placeholder="0"
                                    />
                                    {kategoriErrors.poin_tukar && <p className="text-red-500 text-xs mt-1">{kategoriErrors.poin_tukar}</p>}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Batal
                                </button>
                                <Button
                                    type="submit"
                                    isLoading={processingKategori}
                                    className="bg-sankara-green text-white hover:bg-sankara-green/90 uppercase tracking-widest font-bold text-[10px] rounded-sm px-6 h-[40px] shadow-sm"
                                >
                                    <Save className="w-3.5 h-3.5 mr-1.5" />
                                    Simpan
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
