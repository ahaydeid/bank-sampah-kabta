import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function UnderDevelopment() {
    return (
        <div className="flex items-center bg-white justify-center min-h-[80vh]">
            <Head title="Under Development" />
            <div className="text-center">
                <img
                    src="/images/underdev.gif"
                    alt="Under development"
                    className="mx-auto object-contain w-80"
                />

                <h1 className="text-xl font-semibold mt-4 text-gray-600 uppercase tracking-tight">
                    Fitur Sedang Dalam Pengembangan
                </h1>
                <p className="text-slate-400 text-sm mt-2">
                    Kami sedang mengerjakan fitur ini. Silakan kembali lagi nanti!
                </p>
            </div>
        </div>
    );
}

UnderDevelopment.layout = (page: any) => <AuthenticatedLayout children={page} />;
