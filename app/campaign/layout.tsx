'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';

export default function CampaignLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const steps = [
        { name: 'Brief', path: '/campaign/location', icon: 'check_circle' }, // Location is Step 1 in mockup
        { name: 'Specs', path: '/campaign/products', icon: 'check_circle' },
        { name: 'Design Studio', path: '/campaign/design', icon: 'view_in_ar' },
        { name: 'Checkout', path: '/campaign/roi', icon: 'shopping_cart' }, // Mapping ROI to Checkout/Final step
    ];

    return (
        <div className="flex flex-col overflow-hidden bg-bg-dark text-black">
            {/* Shared Campaign Header */}
            <header className="flex items-center justify-between border-b border-border-dark bg-bg-dark px-6 py-3 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="size-8 text-primary flex items-center justify-center">
                        <svg viewBox="0 0 48 48" className="size-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor" />
                        </svg>
                    </Link>
                    <h2 className="text-lg font-bold">Campaign Wizard</h2>
                </div>

                {/* Stepper Navigation */}
                <div className="hidden md:flex items-center gap-1 bg-surface-dark p-1 rounded-full border border-border-dark">
                    {steps.map((step) => {
                        const isActive = pathname.includes(step.path);
                        return (
                            <Link
                                key={step.name}
                                href={step.path}
                                className={clsx(
                                    "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-primary text-bg-dark font-bold shadow-sm"
                                        : "text-text-dim hover:text-white"
                                )}
                            >
                                <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
                                <span>{step.name}</span>
                            </Link>
                        );
                    })}
                </div>

                <div className="flex items-center gap-4">
                    <div className="size-9 rounded-full border border-border-dark bg-cover bg-center" style={{ backgroundImage: "url('/assets/avatar.jpg')" }}></div>
                </div>
            </header>

            {/* Main Page Content */}
            <div className="flex-1 overflow-hidden relative">
                {children}
            </div>
        </div>
    );
}