import InputError from '@/Components/InputError';
import Label from '@/Components/Base/Label';
import Button from '@/Components/Base/Button';
import Input from '@/Components/Base/Input';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Daftar" />

            <div className="mb-6 text-center">
                <h2 className="text-2xl font-black text-kabta-purple uppercase tracking-tight">Daftar Akun Baru</h2>
                <div className="h-1 w-10 bg-kabta-gold mx-auto mt-2"></div>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <Label htmlFor="name" value="Nama Lengkap" />

                    <Input
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Masukkan nama lengkap"
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <Label htmlFor="email" value="Alamat Email" />

                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="contoh@kabta.id"
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <Label htmlFor="password" value="Password" />

                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Minimal 8 karakter"
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <Label
                        htmlFor="password_confirmation"
                        value="Konfirmasi Password"
                    />

                    <Input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        placeholder="Ulangi password"
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="pt-2">
                    <Button className="w-full" size="lg" disabled={processing}>
                        Daftar Sekarang
                    </Button>
                </div>

                <div className="text-center pt-4">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                        Sudah punya akun?{' '}
                        <Link href={route('login')} className="text-kabta-purple font-bold hover:underline">
                            Masuk Disini
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
