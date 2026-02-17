export default function ApplicationLogo({ className = '' }: { className?: string }) {
    return (
        <div className={`flex flex-col items-center gap-1 ${className}`}>
            <div className={`flex items-center gap-3`}>
                <span className="text-3xl font-black tracking-tighter uppercase text-kabta-purple leading-none">
                    Bank <span className="text-kabta-gold">Sampah</span>
                </span>
            </div>
        </div>
    );
}
