'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutGrid,
    Store,
    Users,
    Megaphone,
    Settings,
    LogOut,
    PackageSearch,
    BookOpen,
    Layers,
    PencilLine,
    ShoppingBag,
    ChevronDown
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState, useEffect } from 'react';

interface NavItem {
    name: string;
    href?: string;
    icon: any;
    isGroup?: boolean;
    subItems?: NavItem[];
}

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { clearAuth } = useAuthStore();

    const navItems: NavItem[] = [
        { name: 'Overview', href: '/admin/dashboard', icon: LayoutGrid },
        {
            name: 'Shop Management',
            icon: Store,
            isGroup: true,
            subItems: [
                { name: 'Books', href: '/admin/shop/books', icon: BookOpen },
                { name: 'Categories', href: '/admin/shop/categories', icon: Layers },
                { name: 'Authors', href: '/admin/shop/authors', icon: PencilLine },
            ]
        },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
        { name: 'Marketing', href: '/admin/marketing', icon: Megaphone },
        { name: 'System', href: '/admin/system', icon: Settings },
    ];

    const [isShopOpen, setIsShopOpen] = useState(false);

    // Auto-open Shop Management if a sub-item is active
    useEffect(() => {
        const isSubItemActive = navItems.find(item => item.isGroup)?.subItems?.some(sub =>
            pathname === sub.href || pathname?.startsWith(`${sub.href}/`)
        );
        if (isSubItemActive) setIsShopOpen(true);
    }, [pathname]);

    const handleLogout = () => {
        clearAuth();
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        router.push('/login');
    };

    return (
        <aside className="w-64 shrink-0 bg-[#F6F5F2] border-r border-[#EAE8E3]/60 flex flex-col h-full font-sans">
            {/* Logo Section */}
            <div className="h-24 flex flex-col justify-center px-8 border-b border-transparent">
                <Link href="/admin/dashboard" className="transition-opacity hover:opacity-90">
                    <h1 className="text-[26px] font-serif font-bold text-[#161B22] tracking-tight">Book shop</h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mt-1">Staff Terminal</p>
                </Link>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;

                    if (item.isGroup) {
                        const isAnySubActive = item.subItems?.some(sub =>
                            pathname === sub.href || pathname?.startsWith(`${sub.href}/`)
                        );

                        return (
                            <Collapsible
                                key={item.name}
                                open={isShopOpen}
                                onOpenChange={setIsShopOpen}
                                className="w-full"
                            >
                                <CollapsibleTrigger className="w-full">
                                    <div
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium cursor-pointer group ${isAnySubActive
                                            ? 'text-[#161B22]'
                                            : 'text-gray-500 hover:bg-[#EBE9E3] hover:text-[#161B22]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <Icon className={`w-5 h-5 ${isAnySubActive ? 'text-[#872D1E]' : 'text-gray-400'}`} />
                                            <span className="text-[14px]">{item.name}</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 text-gray-400 ${isShopOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-1 mt-1 overflow-hidden transition-all data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
                                    {item.subItems?.map((sub) => {
                                        const isSubActive = pathname === sub.href || (sub.href && pathname?.startsWith(`${sub.href}/`));
                                        const SubIcon = sub.icon;
                                        return (
                                            <Link
                                                key={sub.name}
                                                href={sub.href || "#"}
                                                className={`flex items-center gap-3.5 pl-12 pr-4 py-2.5 rounded-xl transition-all font-medium ${isSubActive
                                                    ? 'bg-white/60 text-[#161B22]'
                                                    : 'text-gray-500 hover:text-[#161B22]'
                                                    }`}
                                            >
                                                <SubIcon className={`w-4 h-4 ${isSubActive ? 'text-[#872D1E]' : 'text-gray-400'}`} />
                                                <span className="text-[13px]">{sub.name}</span>
                                            </Link>
                                        );
                                    })}
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    }

                    const isActive = (item.href && pathname === item.href) || (item.href && pathname?.startsWith(`${item.href}/`));
                    return (
                        <Link
                            key={item.name}
                            href={item.href || "#"}
                            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                ? 'bg-white shadow-[0_2px_10px_rgb(0,0,0,0.03)] text-[#161B22]'
                                : 'text-gray-500 hover:bg-[#EBE9E3] hover:text-[#161B22]'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-[#872D1E]' : 'text-gray-400'}`} />
                            <span className="text-[14px]">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions Section */}
            <div className="p-6 space-y-4 pt-4 border-t border-transparent">
                <div className="space-y-1 px-1">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg transition-colors text-gray-500 hover:bg-[#ffe5e5] hover:text-[#C52A1A] font-medium"
                    >
                        <LogOut className="w-[18px] h-[18px] text-[#C52A1A]" />
                        <span className="text-[14px] text-[#C52A1A]">Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
