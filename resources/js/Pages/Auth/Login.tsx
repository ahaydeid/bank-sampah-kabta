import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />

            {processing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 transition-all duration-300">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-kabta-purple/20 border-t-kabta-purple rounded-full animate-spin"></div>
                            <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-kabta-purple animate-pulse" />
                        </div>
                        <div className="text-kabta-purple font-bold tracking-[0.3em] uppercase text-xs animate-pulse">
                            Memproses...
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                    Log In
                </h2>
                <p className="mt-2 text-md font-medium text-gray-600 uppercase">
                    Bank Sampah Kabta
                </p>
            </div>

            {status && (
                <div className="mb-6 text-sm font-medium text-kabta-purple bg-purple-50 p-4 rounded-xl border border-purple-100">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                {/* Login Field (Email) */}
                <div className="group">
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-500 tracking-[0.2em] mb-1">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="w-full bg-transparent border-0 border-b-2 border-slate-100 focus:border-kabta-purple focus:ring-0 px-0 py-2 text-sm placeholder-slate-200 transition-all"
                        autoComplete="username"
                        placeholder="admin@kabta.id"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                {/* Password Field */}
                <div className="group relative">
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-500 tracking-[0.2em] mb-1">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="w-full bg-transparent border-0 border-b-2 border-slate-100 focus:border-kabta-purple focus:ring-0 px-0 py-2 text-sm placeholder-slate-200 transition-all pr-10"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-kabta-purple transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1" />
                </div>

                {/* Auxiliary Actions */}
                <div className="flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-xs text-gray-600 hover:text-kabta-purple/80 transition-colors tracking-widest"
                        >
                            Lupa password?
                        </Link>
                    )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-kabta-purple text-white font-medium py-2 rounded-full text-md hover:bg-kabta-purple/90 transition-all disabled:opacity-50"
                    >
                        Masuk Sekarang
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
