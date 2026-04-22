import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Save } from 'lucide-react';
import Button from '@/Components/Base/Button';
import Label from '@/Components/Base/Label';
import Input from '@/Components/Base/Input';
import InputError from '@/Components/InputError';
import { FormEventHandler } from 'react';
import Checkbox from '@/Components/Checkbox';

interface Question {
    id: number;
    pertanyaan: string;
    opsi_a: string;
    opsi_b: string;
    opsi_c: string;
    opsi_d: string;
    jawaban_benar: string;
    penjelasan: string | null;
    is_active: boolean;
}

export default function Edit({ question }: { question: Question }) {
    const { data, setData, put, processing, errors } = useForm({
        pertanyaan: question.pertanyaan || '',
        opsi_a: question.opsi_a || '',
        opsi_b: question.opsi_b || '',
        opsi_c: question.opsi_c || '',
        opsi_d: question.opsi_d || '',
        jawaban_benar: question.jawaban_benar || 'A',
        penjelasan: question.penjelasan || '',
        is_active: Boolean(question.is_active),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('gamifikasi.kuis.update', question.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Soal #${question.id}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('gamifikasi.kuis.index')}>
                        <Button variant="secondary" className="p-2 bg-white text-slate-500 hover:text-slate-700">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Edit Soal Kuis</h1>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <form onSubmit={submit} className="p-6 md:p-8 space-y-8">

                        {/* Section: Pertanyaan */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Informasi Soal</h3>

                            <div className="space-y-5">
                                <div>
                                    <Label value="Pertanyaan Lengkap" required />
                                    <textarea
                                        id="pertanyaan"
                                        className="mt-1 block w-full border-slate-300 focus:border-sankara-green focus:ring-sankara-green rounded-md shadow-sm sm:text-sm resize-y"
                                        rows={3}
                                        value={data.pertanyaan}
                                        onChange={(e) => setData('pertanyaan', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.pertanyaan} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* Section: Opsi Jawaban */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Opsi Pilihan Ganda</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label value="Pilihan A" required />
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 font-bold sm:text-sm">
                                            A
                                        </span>
                                        <input
                                            type="text"
                                            id="opsi_a"
                                            className="flex-1 block w-full min-w-0 rounded-none rounded-r-md border-slate-300 focus:border-sankara-green focus:ring-sankara-green sm:text-sm"
                                            value={data.opsi_a}
                                            onChange={(e) => setData('opsi_a', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.opsi_a} className="mt-2" />
                                </div>

                                <div>
                                    <Label value="Pilihan B" required />
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 font-bold sm:text-sm">
                                            B
                                        </span>
                                        <input
                                            type="text"
                                            id="opsi_b"
                                            className="flex-1 block w-full min-w-0 rounded-none rounded-r-md border-slate-300 focus:border-sankara-green focus:ring-sankara-green sm:text-sm"
                                            value={data.opsi_b}
                                            onChange={(e) => setData('opsi_b', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.opsi_b} className="mt-2" />
                                </div>

                                <div>
                                    <Label value="Pilihan C" required />
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 font-bold sm:text-sm">
                                            C
                                        </span>
                                        <input
                                            type="text"
                                            id="opsi_c"
                                            className="flex-1 block w-full min-w-0 rounded-none rounded-r-md border-slate-300 focus:border-sankara-green focus:ring-sankara-green sm:text-sm"
                                            value={data.opsi_c}
                                            onChange={(e) => setData('opsi_c', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.opsi_c} className="mt-2" />
                                </div>

                                <div>
                                    <Label value="Pilihan D" required />
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 font-bold sm:text-sm">
                                            D
                                        </span>
                                        <input
                                            type="text"
                                            id="opsi_d"
                                            className="flex-1 block w-full min-w-0 rounded-none rounded-r-md border-slate-300 focus:border-sankara-green focus:ring-sankara-green sm:text-sm"
                                            value={data.opsi_d}
                                            onChange={(e) => setData('opsi_d', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.opsi_d} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* Section: Pengaturan Jawaban */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Kunci & Penjelasan</h3>

                            <div className="space-y-6">
                                <div className="max-w-xs">
                                    <Label value="Kunci Jawaban Benar" required />
                                    <select
                                        id="jawaban_benar"
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-sankara-green focus:border-sankara-green sm:text-sm rounded-md"
                                        value={data.jawaban_benar}
                                        onChange={(e) => setData('jawaban_benar', e.target.value)}
                                    >
                                        <option value="A">Pilihan A</option>
                                        <option value="B">Pilihan B</option>
                                        <option value="C">Pilihan C</option>
                                        <option value="D">Pilihan D</option>
                                    </select>
                                    <InputError message={errors.jawaban_benar} className="mt-2" />
                                </div>

                                <div>
                                    <Label value="Penjelasan Jawaban (Opsional)" />
                                    <textarea
                                        id="penjelasan"
                                        className="mt-1 block w-full border-slate-300 focus:border-sankara-green focus:ring-sankara-green rounded-md shadow-sm sm:text-sm resize-y text-slate-600"
                                        rows={3}
                                        value={data.penjelasan}
                                        onChange={(e) => setData('penjelasan', e.target.value)}
                                    />
                                    <InputError message={errors.penjelasan} className="mt-2" />
                                </div>

                                <div className="block mt-4">
                                    <label className="flex items-center">
                                        <Checkbox
                                            name="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                        />
                                        <span className="ms-3 text-sm text-slate-600">Aktifkan soal ini agar muncul di aplikasi mobile</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                            <Link href={route('gamifikasi.kuis.index')}>
                                <Button type="button" variant="secondary">
                                    Batal
                                </Button>
                            </Link>
                            <Button type="submit" variant="primary" disabled={processing}>
                                <Save className="w-4 h-4 me-2" />
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
