import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, ShieldCheck, Eye } from 'lucide-react';
import { Table, THead, TBody, TR, TH, TD, TableSearch, Pagination, PerPageSelector } from '@/Components/Base/Table';
import Button from '@/Components/Base/Button';
import Alert from '@/Components/Base/Alert';
import Avatar from '@/Components/Avatar';
import { useState, useCallback } from 'react';
import { debounce } from '@/lib/debounce';

interface Profil {
    id: number;
    nama: string;
    jabatan: string;
    no_hp: string;
    foto_profil?: string | null;
}

interface Staff {
    id: number;
    username: string;
    email: string;
    peran: 'admin' | 'petugas';
    is_aktif: boolean;
    profil: Profil;
}

interface Props {
    staff: {
        data: Staff[];
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

export default function Index({ staff, filters }: Props) {
    const { delete: destroy } = useForm();
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = useCallback(
        debounce((query: string) => {
            router.get(
                route('master.staff.index'),
                { search: query, per_page: staff.meta.per_page },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 500),
        [staff.meta.per_page]
    );

    const onSearchChange = (value: string) => {
        setSearch(value);
        handleSearch(value);
    };

    const handlePerPageChange = (perPage: number) => {
        router.get(
            route('master.staff.index'),
            { search, per_page: perPage },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDelete = (id: number) => {
        Alert.confirm({
            title: 'Hapus Staff?',
            text: 'Data staff dan profilnya akan dihapus permanen.',
            confirmButtonText: 'Ya, Hapus',
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('master.staff.destroy', id), {
                    onSuccess: () => {
                        Alert.success({
                            title: 'Terhapus!',
                            text: 'Data staff berhasil dihapus.',
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
            <Head title="Manajemen Staff & Petugas" />

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Manajemen Staff</h1>
                    </div>
                    <Link href={route('master.staff.create')}>
                        <Button variant="primary" size="sm" className="w-full md:w-auto">
                            <Plus className="w-4 h-4 me-2" />
                            Tambah Staff
                        </Button>
                    </Link>
                </div>

                <div className="bg-white overflow-hidden py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 mb-4">
                        <PerPageSelector value={staff.meta.per_page} onChange={handlePerPageChange} />
                        <TableSearch 
                            value={search} 
                            onChange={onSearchChange} 
                            placeholder="Cari nama staff atau jabatan..." 
                        />
                    </div>

                    <Table>
                        <THead>
                            <TR isHeader className="whitespace-nowrap">
                                <TH>Staff / Petugas</TH>
                                <TH>Jabatan</TH>
                                <TH>Peran</TH>
                                <TH>Email</TH>
                                <TH>Telepon</TH>
                                <TH>Status</TH>
                                <TH className="text-center">Aksi</TH>
                            </TR>
                        </THead>
                        <TBody>
                            {staff.data.length > 0 ? (
                                staff.data.map((item, index) => (
                                    <TR className="whitespace-nowrap" key={item.id} index={(staff.meta.current_page - 1) * staff.meta.per_page + index}>
                                        <TD>
                                            <div className="flex items-center whitespace-nowrap">
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
                                            <div className="text-sm font-medium text-slate-600 whitespace-nowrap">{item.profil.jabatan || '-'}</div>
                                        </TD>
                                        <TD>
                                            <span className={`px-2 py-0.5 text-[9px] font-bold text-white rounded-sm uppercase tracking-wider ${
                                                item.peran === 'admin' ? 'bg-kabta-purple' : 'bg-blue-600'
                                            }`}>
                                                {item.peran}
                                            </span>
                                        </TD>
                                        <TD>
                                            <div className="text-slate-600 flex items-center text-sm whitespace-nowrap">
                                                {item.email}
                                            </div>
                                        </TD>
                                        <TD>
                                            <div className="text-slate-600 flex items-center text-sm whitespace-nowrap">
                                                {item.profil.no_hp || '-'}
                                            </div>
                                        </TD>
                                        <TD>
                                            <span className={`px-3 py-1.5 text-[9px] font-medium text-white uppercase tracking-wider whitespace-nowrap ${
                                                item.is_aktif ? 'bg-emerald-500' : 'bg-red-500'
                                            }`}>
                                                {item.is_aktif ? 'Aktif' : 'Non-Aktif'}
                                            </span>
                                        </TD>
                                        <TD className="text-center">
                                            <div className="flex justify-center space-x-2 whitespace-nowrap">
                                                <Link href={route('master.staff.show', item.id)}>
                                                    <Button className="bg-amber-500 text-white hover:bg-amber-600 p-2 rounded-sm shadow-xs" title="Detail">
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Button>
                                                </Link>
                                                <Link href={route('master.staff.edit', item.id)}>
                                                    <Button className="bg-amber-500 text-white hover:bg-amber-600 p-2 rounded-sm shadow-xs" title="Edit">
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    className="bg-red-600 text-white hover:bg-red-700 p-2 rounded-sm shadow-xs" 
                                                    title="Hapus"
                                                    onClick={() => handleDelete(item.id)}
                                                    disabled={item.id === 1}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </TD>
                                    </TR>
                                ))
                            ) : (
                                <TR>
                                    <TD colSpan={8} className="py-12 text-center text-slate-400">
                                        <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>Belum ada data staff tersedia.</p>
                                    </TD>
                                </TR>
                            )}
                        </TBody>
                    </Table>

                    <Pagination 
                        links={staff.links} 
                        meta={staff.meta} 
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
