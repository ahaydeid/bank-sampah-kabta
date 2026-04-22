import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Edit, Trash2, Settings2, Clock, Trophy, RefreshCw } from 'lucide-react';
import Alert from '@/Components/Base/Alert';
import { Table, THead, TBody, TR, TH, TD, TableSearch, Pagination, PerPageSelector } from '@/Components/Base/Table';
import Button from '@/Components/Base/Button';
import { useState, useCallback, FormEventHandler } from 'react';
import { debounce } from '@/lib/debounce';
import Modal from '@/Components/Modal';
import Label from '@/Components/Base/Label';
import Input from '@/Components/Base/Input';
import InputError from '@/Components/InputError';

interface Question {
    id: number;
    pertanyaan: string;
    opsi_a: string;
    opsi_b: string;
    opsi_c: string;
    opsi_d: string;
    jawaban_benar: string;
    is_active: boolean;
}

interface Props {
    questions: {
        data: Question[];
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
    settings: {
        waktu_total: number;
        poin_per_soal: number;
        max_percobaan: number;
    };
    filters: {
        search?: string;
        per_page?: string | number;
        status?: string;
        jawaban?: string;
    }
}

export default function Index({ questions, settings, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const handleSearch = useCallback(
        debounce((query: string) => {
            router.get(
                route('gamifikasi.kuis.index'),
                { ...filters, search: query, per_page: questions.meta.per_page },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 500),
        [questions.meta.per_page, filters]
    );

    const onSearchChange = (value: string) => {
        setSearch(value);
        handleSearch(value);
    };

    const handlePerPageChange = (perPage: number) => {
        router.get(
            route('gamifikasi.kuis.index'),
            { ...filters, search, per_page: perPage },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            route('gamifikasi.kuis.index'),
            { ...filters, search, [key]: value },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDelete = (id: number) => {
        Alert.delete({
            title: 'Hapus Soal?',
            text: 'Soal kuis ini akan dihapus secara permanen.',
            confirmButtonText: 'Ya, Hapus',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('gamifikasi.kuis.destroy', id), {
                    onSuccess: () => {
                        Alert.success({
                            title: 'Dihapus!',
                            text: 'Soal kuis telah berhasil dihapus.',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                    }
                });
            }
        });
    };

    // Form Pengaturan
    const { data, setData, post, processing, errors, reset } = useForm<{
        waktu_total: number | '';
        poin_per_soal: number | '';
        max_percobaan: number | '';
    }>({
        waktu_total: settings.waktu_total,
        poin_per_soal: settings.poin_per_soal,
        max_percobaan: settings.max_percobaan,
    });

    const submitSettings: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('gamifikasi.kuis.settings.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsSettingsModalOpen(false);
                Alert.success({
                    title: 'Berhasil!',
                    text: 'Pengaturan kuis telah diperbarui.',
                    timer: 1500,
                    showConfirmButton: false,
                });
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Kuis Sankara" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className='mb-2'>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kuis Sankara</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-slate-400 border-slate-400 text-slate-50 hover:bg-slate-500 flex-1 sm:flex-none justify-center whitespace-nowrap"
                            onClick={() => {
                                reset();
                                setIsSettingsModalOpen(true);
                            }}
                        >
                            <Settings2 className="w-4 h-4 me-2 text-slate-50 shrink-0" />
                            Pengaturan
                        </Button>
                        <Link href={route('gamifikasi.kuis.create')} className="flex-1 sm:flex-none">
                            <Button variant="primary" size="sm" className="w-full justify-center whitespace-nowrap">
                                <Plus className="w-4 h-4 me-2 shrink-0" />
                                Tambah Soal
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-100 rounded-lg p-3 flex items-center gap-3 shadow-sm">
                        <div className="w-8 h-8 bg-violet-100 text-violet-600 rounded flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Durasi Kuis</p>
                            <p className="text-base font-bold text-slate-800">{settings.waktu_total} Detik</p>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-lg p-3 flex items-center gap-3 shadow-sm">
                        <div className="w-8 h-8 bg-amber-100 text-amber-500 rounded flex items-center justify-center shrink-0">
                            <Trophy className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Poin / Soal</p>
                            <p className="text-base font-bold text-slate-800">{settings.poin_per_soal} Poin</p>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-lg p-3 flex items-center gap-3 shadow-sm">
                        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center shrink-0">
                            <RefreshCw className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Batas Harian</p>
                            <p className="text-base font-bold text-slate-800">
                                {settings.max_percobaan === 0 ? 'Tanpa Batas' : `${settings.max_percobaan}x / Hari`}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden py-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 px-4">
                        <PerPageSelector value={questions.meta.per_page} onChange={handlePerPageChange} />

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                            <select
                                className="w-full sm:w-auto text-sm border-slate-200 rounded-sm focus:border-sankara-green outline-none py-1.5 text-slate-600 bg-white"
                                value={filters.status || ''}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="">Semua Status</option>
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </select>

                            <select
                                className="w-full sm:w-auto text-sm border-slate-200 rounded-sm focus:border-sankara-green outline-none py-1.5 text-slate-600 bg-white"
                                value={filters.jawaban || ''}
                                onChange={(e) => handleFilterChange('jawaban', e.target.value)}
                            >
                                <option value="">Semua Kunci</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>

                            <TableSearch
                                value={search}
                                onChange={onSearchChange}
                                placeholder="Cari pertanyaan..."
                                className="w-full sm:max-w-[200px]"
                            />
                        </div>
                    </div>

                    <Table>
                        <THead>
                            <TR isHeader>
                                <TH>Pertanyaan</TH>
                                <TH>Jawaban Benar</TH>
                                <TH>Status</TH>
                                <TH className="text-right">Aksi</TH>
                            </TR>
                        </THead>
                        <TBody>
                            {questions.data.length > 0 ? (
                                questions.data.map((item, index) => (
                                    <TR key={item.id} index={(questions.meta.current_page - 1) * questions.meta.per_page + index}>
                                        <TD className="text-slate-800 font-medium">
                                            <div className="line-clamp-2 max-w-lg">{item.pertanyaan}</div>
                                        </TD>
                                        <TD>
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                                                {item.jawaban_benar}
                                            </span>
                                        </TD>
                                        <TD>
                                            <span className={`px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider rounded-md ${item.is_active ? 'bg-sankara-green' : 'bg-slate-400'
                                                }`}>
                                                {item.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </TD>
                                        <TD className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Link href={route('gamifikasi.kuis.edit', item.id)}>
                                                    <Button variant="warning" className="p-2 shadow-xs" title="Edit">
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="danger"
                                                    className="p-2 shadow-xs"
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
                                        <p className='text-sm'>Belum ada pertanyaan kuis tersedia.</p>
                                    </TD>
                                </TR>
                            )}
                        </TBody>
                    </Table>

                    <Pagination
                        links={questions.links}
                        meta={questions.meta}
                    />
                </div>
            </div>

            {/* Modal Pengaturan */}
            <Modal show={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} maxWidth="md">
                <form onSubmit={submitSettings} className="p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Pengaturan Kuis</h2>

                    <div className="space-y-5">
                        <div>
                            <Label value="Total Waktu Kuis (Detik)" required />
                            <Input
                                type="number"
                                className="mt-1 block w-full"
                                value={data.waktu_total}
                                placeholder="0"
                                onChange={(e) => setData('waktu_total', e.target.value === '' ? '' : parseInt(e.target.value))}
                            />
                            <InputError message={errors.waktu_total} className="mt-2" />
                            <p className="text-xs text-slate-500 mt-1">Durasi waktu timer untuk seluruh sesi kuis.</p>
                        </div>

                        <div>
                            <Label value="Poin per Soal Benar" required />
                            <Input
                                type="number"
                                className="mt-1 block w-full"
                                value={data.poin_per_soal}
                                placeholder="0"
                                onChange={(e) => setData('poin_per_soal', e.target.value === '' ? '' : parseInt(e.target.value))}
                            />
                            <InputError message={errors.poin_per_soal} className="mt-2" />
                            <p className="text-xs text-slate-500 mt-1">Jumlah poin saldo yang didapat nasabah untuk setiap jawaban benar.</p>
                        </div>

                        <div>
                            <Label value="Batas Percobaan Per Hari" required />
                            <Input
                                type="number"
                                className="mt-1 block w-full"
                                value={data.max_percobaan}
                                placeholder="0"
                                onChange={(e) => setData('max_percobaan', e.target.value === '' ? '' : parseInt(e.target.value))}
                            />
                            <InputError message={errors.max_percobaan} className="mt-2" />
                            <p className="text-xs text-slate-500 mt-1">Isi 0 untuk tanpa batas percobaan (unlimited).</p>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setIsSettingsModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" variant="primary" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
