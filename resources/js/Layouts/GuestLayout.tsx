import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-6 font-sans">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col lg:flex-row min-h-[500px]">
                {/* Left Side: Illustration */}
                <div className="hidden lg:block lg:w-[45%] relative bg-kabta-purple/5">
                    <img 
                        src="/images/auth-login.webp" 
                        alt="Auth Illustration" 
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-kabta-purple/20 to-transparent"></div>
                </div>

                {/* Right Side: Form Content */}
                <div className="w-full lg:w-[55%] p-8 lg:p-12 flex flex-col justify-center bg-white">
                    {children}
                </div>
            </div>
        </div>
    );
}
