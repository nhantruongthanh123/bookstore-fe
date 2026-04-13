'use client';

import { useState } from 'react';
import {
    ChevronRight,
    Megaphone,
    Mail,
    Tag,
    Gift,
    TrendingUp,
    Users,
    Eye,
    MousePointerClick,
    Percent,
    Plus,
    Sparkles,
    CalendarDays,
    Copy,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_CAMPAIGNS = [
    { id: 1, name: 'Summer Reading Sale', type: 'Discount', discount: 20, code: 'SUMMER20', active: true, uses: 142, expires: '2026-08-31' },
    { id: 2, name: 'New Member Welcome', type: 'Discount', discount: 15, code: 'WELCOME15', active: true, uses: 89, expires: '2026-12-31' },
    { id: 3, name: 'Flash Friday', type: 'Discount', discount: 30, code: 'FLASH30', active: false, uses: 310, expires: '2026-04-01' },
    { id: 4, name: 'Loyalty Reward', type: 'Gift', discount: 0, code: 'LOYAL10', active: true, uses: 54, expires: '2026-06-30' },
];

const MOCK_STATS = [
    { label: 'Total Campaigns', value: '4', icon: <Megaphone className="w-5 h-5 text-[#EE6337]" />, bg: 'bg-[#FFF4EC]', change: '+2 this month' },
    { label: 'Promo Code Uses', value: '595', icon: <Tag className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-50', change: '+48 this week' },
    { label: 'Revenue via Promos', value: '$12,430', icon: <TrendingUp className="w-5 h-5 text-[#2F7E4C]" />, bg: 'bg-[#F0FBF4]', change: '+$1,200 this week' },
    { label: 'Email Subscribers', value: '1,842', icon: <Mail className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50', change: '+34 this week' },
];

type Campaign = typeof MOCK_CAMPAIGNS[0];

export default function AdminMarketingPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
    const [showForm, setShowForm] = useState(false);
    const [newCampaign, setNewCampaign] = useState({ name: '', code: '', discount: '', expires: '' });
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const toggleCampaign = (id: number) => {
        setCampaigns((prev) =>
            prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
        );
    };

    const handleCreateCampaign = () => {
        if (!newCampaign.name || !newCampaign.code) return;
        setCampaigns((prev) => [
            ...prev,
            {
                id: Date.now(),
                name: newCampaign.name,
                type: 'Discount',
                discount: Number(newCampaign.discount) || 0,
                code: newCampaign.code.toUpperCase(),
                active: true,
                uses: 0,
                expires: newCampaign.expires || '—',
            },
        ]);
        setNewCampaign({ name: '', code: '', discount: '', expires: '' });
        setShowForm(false);
    };

    const copyCode = (id: number, code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#FCFBFA] font-sans">

            {/* Breadcrumbs + Header */}
            <div className="px-8 lg:px-12 pt-8 pb-4 space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    <span>Admin</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-[#EE6337]">Marketing</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-serif font-bold text-[#161B22] tracking-tight">Marketing Hub</h1>
                        <p className="text-[14px] text-gray-500 font-medium italic">
                            Manage promotions, promo codes, and customer outreach campaigns.
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowForm(true)}
                        className="bg-[#0A192F] hover:bg-[#162A4B] text-white px-6 py-6 rounded-xl shadow-lg transition-all active:scale-95 group"
                    >
                        <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                        <span className="font-semibold tracking-wide">New Campaign</span>
                    </Button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="px-8 lg:px-12 py-2">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {MOCK_STATS.map((s) => (
                        <div key={s.label} className="bg-white border border-[#EAE8E3]/50 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
                            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
                                {s.icon}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate">{s.label}</p>
                                <p className="text-xl font-serif font-bold text-[#161B22]">{s.value}</p>
                                <p className="text-[10px] text-[#2F7E4C] font-bold">{s.change}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* New Campaign Form */}
            {showForm && (
                <div className="px-8 lg:px-12 py-4">
                    <div className="bg-white rounded-[24px] border border-[#EAE8E3]/50 shadow-sm p-7 space-y-5">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#EE6337]" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">New Promo Campaign</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Campaign Name</Label>
                                <Input placeholder="e.g. Summer Sale" value={newCampaign.name}
                                    onChange={(e) => setNewCampaign((p) => ({ ...p, name: e.target.value }))}
                                    className="h-11 bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Promo Code</Label>
                                <Input placeholder="e.g. SUMMER20" value={newCampaign.code}
                                    onChange={(e) => setNewCampaign((p) => ({ ...p, code: e.target.value }))}
                                    className="h-11 bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 rounded-xl uppercase" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Discount %</Label>
                                <Input type="number" placeholder="e.g. 20" value={newCampaign.discount}
                                    onChange={(e) => setNewCampaign((p) => ({ ...p, discount: e.target.value }))}
                                    className="h-11 bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Expiry Date</Label>
                                <Input type="date" value={newCampaign.expires}
                                    onChange={(e) => setNewCampaign((p) => ({ ...p, expires: e.target.value }))}
                                    className="h-11 bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 rounded-xl" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={handleCreateCampaign}
                                className="bg-[#0A192F] hover:bg-[#162A4B] text-white px-6 rounded-xl font-semibold shadow-md active:scale-95">
                                Create Campaign
                            </Button>
                            <Button variant="ghost" onClick={() => setShowForm(false)}
                                className="text-gray-500 hover:text-[#161B22] font-semibold">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Campaigns Table */}
            <div className="px-8 lg:px-12 py-4 flex-1">
                <div className="bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-[#EAE8E3]/50 overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-[1fr_140px_100px_100px_100px_80px_80px] px-6 py-4 bg-[#F8F6F2] border-b border-[#EAE8E3] text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        <span>Campaign</span>
                        <span>Promo Code</span>
                        <span>Discount</span>
                        <span>Uses</span>
                        <span>Expires</span>
                        <span className="text-center">Active</span>
                        <span></span>
                    </div>

                    <div className="divide-y divide-[#EAE8E3]/40">
                        {campaigns.map((c) => (
                            <div key={c.id} className={`grid grid-cols-[1fr_140px_100px_100px_100px_80px_80px] px-6 py-4 items-center hover:bg-[#FAF9F6] transition-colors ${!c.active ? 'opacity-60' : ''}`}>
                                {/* Name */}
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#F4F2EC] rounded-lg flex items-center justify-center">
                                        {c.type === 'Gift' ? <Gift className="w-4 h-4 text-[#EE6337]" /> : <Tag className="w-4 h-4 text-[#EE6337]" />}
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-serif font-bold text-[#161B22]">{c.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{c.type}</p>
                                    </div>
                                </div>
                                {/* Code */}
                                <div className="flex items-center gap-2">
                                    <code className="text-[12px] font-bold text-[#161B22] bg-[#F4F2EC] px-2.5 py-1 rounded-lg tracking-wider">
                                        {c.code}
                                    </code>
                                    <button onClick={() => copyCode(c.id, c.code)}
                                        className="text-gray-300 hover:text-[#EE6337] transition-colors">
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    {copiedId === c.id && <span className="text-[10px] text-[#2F7E4C] font-bold">Copied!</span>}
                                </div>
                                {/* Discount */}
                                <div className="flex items-center gap-1">
                                    {c.discount > 0 ? (
                                        <>
                                            <Percent className="w-3 h-3 text-[#EE6337]" />
                                            <span className="text-[14px] font-bold text-[#161B22]">{c.discount}%</span>
                                        </>
                                    ) : (
                                        <span className="text-[12px] text-gray-400 font-medium">—</span>
                                    )}
                                </div>
                                {/* Uses */}
                                <div className="flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-[13px] font-bold text-[#161B22]">{c.uses}</span>
                                </div>
                                {/* Expires */}
                                <div className="flex items-center gap-1.5">
                                    <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-[12px] text-gray-500 font-medium">{c.expires}</span>
                                </div>
                                {/* Toggle */}
                                <div className="flex justify-center">
                                    <button onClick={() => toggleCampaign(c.id)} className="transition-colors">
                                        {c.active
                                            ? <ToggleRight className="w-7 h-7 text-[#2F7E4C]" />
                                            : <ToggleLeft className="w-7 h-7 text-gray-300" />}
                                    </button>
                                </div>
                                {/* Status pill */}
                                <div>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.active ? 'bg-[#F0FBF4] text-[#2F7E4C]' : 'bg-gray-100 text-gray-400'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${c.active ? 'bg-[#2F7E4C]' : 'bg-gray-400'}`} />
                                        {c.active ? 'Live' : 'Off'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="px-6 py-4 bg-[#F8F6F2]/50 border-t border-[#EAE8E3] text-[12px] font-medium text-gray-400">
                        {campaigns.filter((c) => c.active).length} active campaign{campaigns.filter((c) => c.active).length !== 1 ? 's' : ''} of {campaigns.length} total
                    </div>
                </div>

                {/* Email Blast Section */}
                <div className="mt-6 bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-[#EAE8E3]/50 overflow-hidden">
                    <div className="px-7 py-5 bg-[#F8F6F2]/80 border-b border-[#EAE8E3]">
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-[#EE6337]" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Newsletter Blast</p>
                        </div>
                    </div>
                    <div className="px-7 py-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Subject Line</Label>
                                <Input placeholder="e.g. 🎉 Flash Sale — 30% off everything this weekend!"
                                    className="h-11 bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Audience</Label>
                                <select className="w-full h-11 px-4 bg-[#F6F5F2] border-transparent rounded-xl text-[14px] font-medium text-gray-600 outline-none hover:bg-[#EBE9E3] transition-colors">
                                    <option>All subscribers (1,842)</option>
                                    <option>Active users only</option>
                                    <option>New signups (last 30 days)</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">Message Preview</Label>
                            <textarea rows={3}
                                placeholder="Write your email body or promotion message here..."
                                className="w-full px-4 py-3 bg-[#F6F5F2] border border-transparent focus:bg-white focus:border-[#EE6337]/50 rounded-xl text-[14px] text-gray-700 placeholder:text-gray-400 outline-none resize-none transition-all" />
                        </div>
                        <div className="flex gap-3">
                            <Button className="bg-[#0A192F] hover:bg-[#162A4B] text-white px-6 rounded-xl font-semibold shadow-md active:scale-95">
                                <Mail className="w-4 h-4 mr-2" />
                                Send Newsletter
                            </Button>
                            <Button variant="outline" className="border-[#EAE8E3] text-gray-500 rounded-xl hover:bg-[#F6F5F2]">
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
