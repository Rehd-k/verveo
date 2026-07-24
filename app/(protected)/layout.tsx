'use client';

import { useAuth } from "@/store/authStore";
import { useCampaign } from "@/store/campaignStore";
import { Radar, LayoutDashboard, Megaphone, ChartLine, CreditCard, Settings2, LogOut, CirclePlus, BarChart3, Bell, Settings, User, MenuIcon, SidebarClose, Shield } from 'lucide-react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, logout, initialized } = useAuth();
    const pathname = usePathname();
    const { campaigns, fetchCampaigns } = useCampaign();
    const [loading, setLoading] = useState(true);
    const [showWizard, setShowWizard] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);


    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const toggleUserMenu = () => {
        setShowUserMenu((prev) => !prev);
    }

    useEffect(() => {
        if (!initialized) return;

        if (!user) {
            router.push('/auth/login');
            return;
        }

        if (user.role === 'retailer') {
            router.push('/retailer/dashboard');
            return;
        }

        fetchCampaigns(user.id || '');
        setLoading(false);
    }, [user, initialized, router, fetchCampaigns]);

    if (!initialized || loading || !user) {
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

    return <section className="font-display text-white min-h-screen grid grid-cols-7">
        {/* Sidebar Navigation */}
        <aside className={`${showUserMenu ? 'w-64 ' : 'w-20 hidden'} fixed  h-screen  bg-card-dark border-r border-white/5 md:flex flex flex-col justify-between shrink-0 z-50`}>
            <div className="flex flex-col gap-6 px-4 py-2">
                {/* Brand */}
                <div className="flex items-center gap-3 px-2">
                    <div className="bg-linear-to-tr from-primary to-blue-400 size-8 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <Radar />
                    </div>
                    <div className={`flex flex-col ${showUserMenu ? '' : 'hidden'}`}>
                        <h1 className="text-white text-sm font-bold tracking-tight">
                            Verveo
                        </h1>
                        <p className="text-text-secondary text-xs font-medium uppercase tracking-wider">
                            War Room
                        </p>
                    </div>
                    <button className={`flex items-center gap-4 ml-auto ${showUserMenu ? '' : 'hidden'}`} onClick={toggleUserMenu}>
                        <SidebarClose className="size-4" />
                    </button>
                </div>
                {/* Nav Links */}
                <nav className="flex flex-col gap-2">
                    <Link
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${pathname === '/dashboard' ? 'bg-primary/10 border-l-2 border-primary ' : ''}`}
                        href="/dashboard"
                    >

                        <LayoutDashboard className="size-4" />

                        <span className={`text-white text-xs font-medium ${showUserMenu ? '' : 'hidden'}`}>Dashboard</span>
                    </Link>
                    <Link
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${pathname.startsWith('/campaigns') ? 'bg-primary/10 border-l-2 border-primary ' : ''}`}

                        href="/campaigns"
                    >
                        <Megaphone className="size-4" />
                        <span className={`text-xs font-medium ${showUserMenu ? '' : 'hidden'}`}>Campaigns</span>
                    </Link>
                    <Link
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${pathname === '/analytics' ? 'bg-primary/10 border-l-2 border-primary ' : ''}`}
                        href="/analytics"
                    >
                        <ChartLine className="size-4" />
                        <span className={`text-xs font-medium  ${showUserMenu ? '' : 'hidden'}`}>Analytics</span>
                    </Link>
                    <Link
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${pathname === '/settings' ? 'bg-primary/10 border-l-2 border-primary ' : ''}`}
                        href="/settings"
                    >
                        <CreditCard className="size-4" />
                        <span className={`text-xs font-medium  ${showUserMenu ? '' : 'hidden'}`}>Billing</span>
                    </Link>
                    {user.role === 'admin' && (
                    <Link
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${pathname.startsWith('/admin') ? 'bg-primary/10 border-l-2 border-primary ' : ''}`}
                        href="/admin"
                    >
                        <Shield className="size-4" />
                        <span className={`text-xs font-medium  ${showUserMenu ? '' : 'hidden'}`}>Admin Panel</span>
                    </Link>
                    )}
                </nav>
            </div>
            <div className="flex flex-col p-4 gap-2">
                {/* CTA */}
                <Link
                    href={'/campaign'}
                    onClick={() => setShowWizard(true)}
                    className="w-full cursor-pointer flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 transition-colors text-white h-10 rounded-lg text-xs font-semibold shadow-lg shadow-primary/20">

                    <CirclePlus className="size-4" />
                    <span className={`${showUserMenu ? '' : 'hidden'}`}>
                        Create Campaign
                    </span>
                </Link>
                {/* User Menu */}
                <div className="flex flex-col gap-1 border-t border-white/5 pt-4">
                    <Link
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${pathname === '/dashboard/settings' ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        href="/dashboard/settings"
                    >
                        <Settings2 className="size-4" />
                        <span className={`text-xs font-medium size-4 ${showUserMenu ? '' : 'hidden'}`}>Settings</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-white/5"

                    >
                        <LogOut className="size-4" />
                        <span className={`text-xs font-medium ${showUserMenu ? '' : 'hidden'}`}>Log Out</span>
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
                    <div className={`flex flex-col overflow-hidden ${showUserMenu ? '' : 'hidden'}`}>
                        <span className="text-sm font-medium text-white truncate">
                            {user.name}
                        </span>
                        <span className="text-xs text-text-secondary truncate">
                            {user.role === 'admin' ? 'Admin' : user.role === 'retailer' ? 'Retailer' : 'Advertiser'}
                        </span>
                    </div>
                </div>
            </div>
        </aside>
        <main className="col-span-7">
            <div className="w-full h-full flex dark">
                <div className={`${showUserMenu ? 'md:w-78' : 'md:w-21'}`}></div>
                <div className="w-full  bg-blue-800">
                    {/* Top Navigation */}
                    <header className="flex items-center justify-between whitespace-nowrap border-b border-gray-500 border-solid  px-6 py-2 bg-background-dark z-20 shadow-sm w-full">
                        <button className="flex items-center gap-4" onClick={toggleUserMenu}>
                            <MenuIcon className="size-4" />
                        </button>
                        <div className="flex items-center gap-3">

                            <div className="h-8 w-px bg-gray-500 dark:bg-border-dark mx-2" />
                            <Link
                                href="/dashboard/settings"
                                className="flex items-center justify-center rounded-lg p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                            >
                                <Settings className="size-4" />
                            </Link>
                            <button className="flex items-center justify-center rounded-lg p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
                                <Bell className="size-4" />
                            </button>
                            <Link
                                href="/dashboard/settings"
                                className="flex items-center justify-center rounded-full p-2 bg-primary text-background-dark font-bold ml-2"
                            >
                                <User className="size-4" />
                            </Link>
                        </div>
                    </header>
                    {children}
                </div>

            </div>
        </main>
    </section>

}