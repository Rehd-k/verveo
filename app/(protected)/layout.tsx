'use client';

import { useAuth } from "@/store/authStore";
import { useCampaign } from "@/store/campaignStore";
import { Radar, LayoutDashboard, Megaphone, ChartLine, CreditCard, Settings2, LogOut, CirclePlus } from 'lucide-react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { campaigns, fetchCampaigns } = useCampaign();
    const [loading, setLoading] = useState(true);
    const [showWizard, setShowWizard] = useState(false);


    const handleLogout = () => {
        logout();
        router.push('/');
    };

    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        // Fetch campaigns
        fetchCampaigns(user.id || '');
        setLoading(false);
    }, [user, router, fetchCampaigns]);

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background-dark">
                <div className="animate-spin">
                    <span className="material-symbols-outlined text-4xl text-primary">
                        autorenew
                    </span>
                </div>
            </div>
        );
    }

    return <section className="bg-background-light dark:bg-background-dark font-display text-white min-h-screen w-full flex">
        {/* Sidebar Navigation */}
        <aside className="md:w-52 fixed hidden h-screen  bg-card-dark border-r border-white/5 md:flex flex-col justify-between shrink-0 z-20">
            <div className="flex flex-col gap-6 p-4">
                {/* Brand */}
                <div className="flex items-center gap-3 px-2">
                    <div className="bg-linear-to-tr from-primary to-blue-400 size-8 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <Radar />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-white text-sm font-bold tracking-tight">
                            Addizi
                        </h1>
                        <p className="text-text-secondary text-xs font-medium uppercase tracking-wider">
                            War Room
                        </p>
                    </div>
                </div>
                {/* Nav Links */}
                <nav className="flex flex-col gap-2">
                    <Link
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 border-l-2 border-primary"
                        href="/dashboard"
                    >
                        <span className="material-symbols-outlined text-primary">
                            <LayoutDashboard className="size-4" />
                        </span>
                        <span className="text-white text-xs font-medium">Dashboard</span>
                    </Link>
                    <Link
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                        href="/campaign/design"
                    >
                        <Megaphone className="size-4" />
                        <span className="text-xs font-medium">Campaigns</span>
                    </Link>
                    <Link
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                        href="/dashboard/analytics"
                    >
                        <ChartLine className="size-4" />
                        <span className="text-xs font-medium">Analytics</span>
                    </Link>
                    <Link
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                        href="/settings"
                    >
                        <CreditCard className="size-4" />
                        <span className="text-xs font-medium">Billing</span>
                    </Link>
                </nav>
            </div>
            <div className="flex flex-col p-4 gap-2">
                {/* CTA */}
                <button
                    onClick={() => setShowWizard(true)}
                    className="w-full cursor-pointer flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 transition-colors text-white h-10 rounded-lg text-xs font-semibold shadow-lg shadow-primary/20">
                    <CirclePlus className="size-4" />
                    Create Campaign
                </button>
                {/* User Menu */}
                <div className="flex flex-col gap-1 border-t border-white/5 pt-4">
                    <Link
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5"
                        href="/dashboard/settings"
                    >
                        <Settings2 className="size-4" />
                        <span className="text-xs font-medium size-4">Settings</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5"

                    >
                        <LogOut className="size-4" />
                        <span className="text-xs font-medium">Log Out</span>
                    </button>
                </div>
                {/* User Profile Snippet */}
                <div className="flex items-center gap-3 px-2 pb-2">
                    <div
                        className="size-8 rounded-full bg-cover bg-center ring-2 ring-white/10"
                        data-alt="User profile picture"
                        style={{
                            backgroundImage:
                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAO4SEWzfe7ZQKw7yxHXADkn_h9gzSSpg1m6rhdaWFIDqvU5W_x5ZthQ7a_44Q9IcptrbNYXzjxHODg3h6zEXnlyEmkWeyU0WF0oOJQv54iSFlqqZCe_pli29_IPrxEcS6KM8LnTR6kFSvamhl9z3aX8LxJVeH45LGhz5YqelQambxlaOcWmPjEERffHKJgbUIbzLZjQjJfOQqmVXw_YJ15iMX7XTtvJECXooPZkUz4f6XdXtF551K_V5Lvo7jeZ_eCndaejTZjWaI")'
                        }}
                    ></div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium text-white truncate">
                            {user.name}
                        </span>
                        <span className="text-xs text-text-secondary truncate">
                            Advertiser Admin
                        </span>
                    </div>
                </div>
            </div>
        </aside>
        <main className="w-full h-full flex">
            <div className="md:w-52"></div>
            {children}
        </main>
    </section>

}