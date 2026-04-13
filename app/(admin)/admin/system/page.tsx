'use client';

import { useState } from 'react';
import {
    ChevronRight,
    Settings,
    Store,
    Save,
    ShieldCheck,
    Activity,
    Loader2,
    Check,
    BookOpen,
    Tag,
    Trash2,
    Pencil,
    Package,
    Users,
    LogIn,
    LogOut,
    PlusCircle,
    XCircle,
    AlertTriangle,
    RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ─── Audit Log Mock ───────────────────────────────────────────────────────────
type AuditAction =
    | 'CREATE_BOOK' | 'UPDATE_BOOK' | 'DELETE_BOOK'
    | 'CREATE_CATEGORY' | 'UPDATE_CATEGORY' | 'DELETE_CATEGORY'
    | 'UPDATE_ORDER_STATUS' | 'CANCEL_ORDER'
    | 'ADMIN_LOGIN' | 'ADMIN_LOGOUT'
    | 'UPDATE_SETTINGS';

interface AuditLog {
    id: number;
    action: AuditAction;
    admin: string;
    target: string;
    detail: string;
    timestamp: string;
    severity: 'info' | 'warning' | 'danger';
}

const ACTION_CONFIG: Record<AuditAction, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
    CREATE_BOOK:        { label: 'Book Created',       icon: <BookOpen className="w-4 h-4" />,    color: 'text-[#2F7E4C]',    bg: 'bg-[#F0FBF4]' },
    UPDATE_BOOK:        { label: 'Book Updated',       icon: <Pencil className="w-4 h-4" />,      color: 'text-blue-600',     bg: 'bg-blue-50' },
    DELETE_BOOK:        { label: 'Book Deleted',       icon: <Trash2 className="w-4 h-4" />,      color: 'text-[#C52A1A]',    bg: 'bg-[#FFF4F3]' },
    CREATE_CATEGORY:    { label: 'Category Created',   icon: <Tag className="w-4 h-4" />,         color: 'text-[#2F7E4C]',    bg: 'bg-[#F0FBF4]' },
    UPDATE_CATEGORY:    { label: 'Category Updated',   icon: <Tag className="w-4 h-4" />,         color: 'text-blue-600',     bg: 'bg-blue-50' },
    DELETE_CATEGORY:    { label: 'Category Deleted',   icon: <Trash2 className="w-4 h-4" />,      color: 'text-[#C52A1A]',    bg: 'bg-[#FFF4F3]' },
    UPDATE_ORDER_STATUS:{ label: 'Order Updated',      icon: <Package className="w-4 h-4" />,     color: 'text-purple-600',   bg: 'bg-purple-50' },
    CANCEL_ORDER:       { label: 'Order Cancelled',    icon: <XCircle className="w-4 h-4" />,     color: 'text-amber-600',    bg: 'bg-amber-50' },
    ADMIN_LOGIN:        { label: 'Admin Login',        icon: <LogIn className="w-4 h-4" />,       color: 'text-[#2F7E4C]',    bg: 'bg-[#F0FBF4]' },
    ADMIN_LOGOUT:       { label: 'Admin Logout',       icon: <LogOut className="w-4 h-4" />,      color: 'text-gray-500',     bg: 'bg-gray-100' },
    UPDATE_SETTINGS:    { label: 'Settings Changed',   icon: <Settings className="w-4 h-4" />,    color: 'text-[#EE6337]',    bg: 'bg-[#FFF4EC]' },
};

const MOCK_LOGS: AuditLog[] = [
    { id: 1,  action: 'UPDATE_SETTINGS',    admin: 'system',   target: 'Shop Name',          detail: 'Changed shop name to "Book Corner"',           timestamp: '2026-04-09T22:47:00Z', severity: 'info' },
    { id: 2,  action: 'DELETE_BOOK',        admin: 'system',   target: 'Book #0042',         detail: 'Soft-deleted "The Great Gatsby"',               timestamp: '2026-04-09T21:30:00Z', severity: 'danger' },
    { id: 3,  action: 'UPDATE_ORDER_STATUS',admin: 'system',   target: 'Order #00018',       detail: 'Status changed PENDING → SHIPPING',             timestamp: '2026-04-09T20:15:00Z', severity: 'info' },
    { id: 4,  action: 'CREATE_CATEGORY',    admin: 'system',   target: 'Category: Poetry',   detail: 'New category "Poetry" added',                   timestamp: '2026-04-09T19:55:00Z', severity: 'info' },
    { id: 5,  action: 'CANCEL_ORDER',       admin: 'system',   target: 'Order #00015',       detail: 'Order cancelled by admin',                      timestamp: '2026-04-09T18:40:00Z', severity: 'warning' },
    { id: 6,  action: 'ADMIN_LOGIN',        admin: 'system',   target: 'Dashboard',          detail: 'Admin session started from 192.168.1.1',        timestamp: '2026-04-09T17:00:00Z', severity: 'info' },
    { id: 7,  action: 'UPDATE_BOOK',        admin: 'system',   target: 'Book #0038',         detail: 'Updated price of "Clean Code" from $40→$45',    timestamp: '2026-04-09T16:20:00Z', severity: 'info' },
    { id: 8,  action: 'CREATE_BOOK',        admin: 'system',   target: 'Book #0051',         detail: 'Added "Effective Java" to catalog',             timestamp: '2026-04-09T15:05:00Z', severity: 'info' },
    { id: 9,  action: 'DELETE_CATEGORY',    admin: 'system',   target: 'Category: Travel',   detail: 'Category "Travel" removed',                     timestamp: '2026-04-09T14:30:00Z', severity: 'danger' },
    { id: 10, action: 'ADMIN_LOGOUT',       admin: 'system',   target: 'Dashboard',          detail: 'Admin session ended',                           timestamp: '2026-04-09T13:00:00Z', severity: 'info' },
];

const SEVERITY_CONFIG = {
    info:    { dot: 'bg-[#2F7E4C]',  row: '' },
    warning: { dot: 'bg-amber-500',  row: 'bg-amber-50/30' },
    danger:  { dot: 'bg-[#C52A1A]',  row: 'bg-[#FFF4F3]/40' },
};

function formatTimestamp(ts: string) {
    return new Date(ts).toLocaleString('en-US', {
        month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: true,
    });
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function AdminSystemPage() {
    // Shop settings state
    const [shopName, setShopName] = useState('Book Shop');
    const [shopTagline, setShopTagline] = useState('Curated literary collections for every reader.');
    const [supportEmail, setSupportEmail] = useState('support@bookshop.com');
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [savedSettings, setSavedSettings] = useState(false);

    // Audit log filter
    const [logFilter, setLogFilter] = useState<AuditAction | 'all'>('all');
    const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'danger'>('all');

    const filteredLogs = MOCK_LOGS.filter((l) => {
        const matchAction = logFilter === 'all' || l.action === logFilter;
        const matchSeverity = severityFilter === 'all' || l.severity === severityFilter;
        return matchAction && matchSeverity;
    });

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        // Simulate API call
        await new Promise((r) => setTimeout(r, 900));
        setIsSavingSettings(false);
        setSavedSettings(true);
        // Add audit log entry (in real app this comes from backend)
        setTimeout(() => setSavedSettings(false), 2500);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#FCFBFA] font-sans">

            {/* Breadcrumbs + Header */}
            <div className="px-8 lg:px-12 pt-8 pb-4 space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    <span>Admin</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-[#EE6337]">System</span>
                </div>
                <div className="space-y-1">
                    <h1 className="text-4xl font-serif font-bold text-[#161B22] tracking-tight">System Settings</h1>
                    <p className="text-[14px] text-gray-500 font-medium italic">
                        Configure the bookstore and monitor administrator activity.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="px-8 lg:px-12 py-4 flex-1 space-y-6">

                {/* ── Shop Settings ─────────────────────────────────── */}
                <div className="bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-[#EAE8E3]/50 overflow-hidden">
                    {/* Card header */}
                    <div className="px-7 py-5 bg-[#F8F6F2]/80 border-b border-[#EAE8E3] flex items-center gap-2">
                        <Store className="w-4 h-4 text-[#EE6337]" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Shop Identity</p>
                    </div>

                    <div className="px-7 py-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Shop Name */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">
                                Shop Name
                            </Label>
                            <Input
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                placeholder="e.g. Book Corner"
                                className="h-11 bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 rounded-xl transition-all"
                            />
                            <p className="text-[11px] text-gray-400 font-medium">
                                Displayed in the header and browser tab.
                            </p>
                        </div>

                        {/* Support Email */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">
                                Support Email
                            </Label>
                            <Input
                                type="email"
                                value={supportEmail}
                                onChange={(e) => setSupportEmail(e.target.value)}
                                placeholder="support@example.com"
                                className="h-11 bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 rounded-xl transition-all"
                            />
                            <p className="text-[11px] text-gray-400 font-medium">
                                Shown to customers for help requests.
                            </p>
                        </div>

                        {/* Tagline */}
                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">
                                Shop Tagline
                            </Label>
                            <Input
                                value={shopTagline}
                                onChange={(e) => setShopTagline(e.target.value)}
                                placeholder="e.g. Curated literary collections..."
                                className="h-11 bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 rounded-xl transition-all"
                            />
                        </div>

                        {/* Preview */}
                        <div className="md:col-span-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Live Preview</p>
                            <div className="bg-[#0A192F] rounded-2xl px-6 py-4 inline-flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#EE6337] rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-[15px] tracking-tight leading-tight">
                                        {shopName || 'Shop Name'}
                                    </p>
                                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">
                                        Staff Terminal
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-7 py-5 bg-[#F8F6F2]/50 border-t border-[#EAE8E3] flex items-center justify-between">
                        <p className="text-[12px] text-gray-400 font-medium">
                            Changes are applied immediately across all admin pages.
                        </p>
                        <Button
                            onClick={handleSaveSettings}
                            disabled={isSavingSettings}
                            className="bg-[#0A192F] hover:bg-[#162A4B] text-white px-6 rounded-xl shadow-md transition-all active:scale-95"
                        >
                            {isSavingSettings ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                            ) : savedSettings ? (
                                <><Check className="w-4 h-4 mr-2 text-green-400" />Saved!</>
                            ) : (
                                <><Save className="w-4 h-4 mr-2" />Save Settings</>
                            )}
                        </Button>
                    </div>
                </div>

                {/* ── Security Info ─────────────────────────────────── */}
                <div className="bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-[#EAE8E3]/50 overflow-hidden">
                    <div className="px-7 py-5 bg-[#F8F6F2]/80 border-b border-[#EAE8E3] flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#EE6337]" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Security Overview</p>
                    </div>
                    <div className="px-7 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Active Sessions', value: '1', color: 'text-[#2F7E4C]', note: 'Only yours' },
                            { label: 'Failed Logins (24h)', value: '0', color: 'text-[#2F7E4C]', note: 'All clear' },
                            { label: 'Admin Accounts', value: '1', color: 'text-[#161B22]', note: 'Superadmin' },
                            { label: 'Last Backup', value: 'Today', color: 'text-[#161B22]', note: '03:00 AM UTC' },
                        ].map((s) => (
                            <div key={s.label}>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{s.label}</p>
                                <p className={`text-2xl font-serif font-bold mt-1 ${s.color}`}>{s.value}</p>
                                <p className="text-[11px] text-gray-400 font-medium mt-0.5">{s.note}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Audit Logs ────────────────────────────────────── */}
                <div className="bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-[#EAE8E3]/50 overflow-hidden">
                    {/* Header row */}
                    <div className="px-7 py-5 bg-[#F8F6F2]/80 border-b border-[#EAE8E3] flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-[#EE6337]" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                Audit Logs
                                <span className="ml-2 text-gray-300">({filteredLogs.length} entries)</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Severity filter */}
                            <select
                                value={severityFilter}
                                onChange={(e) => setSeverityFilter(e.target.value as typeof severityFilter)}
                                className="h-9 px-3 bg-[#F6F5F2] border-transparent rounded-xl text-[12px] font-medium text-gray-600 outline-none hover:bg-[#EBE9E3] transition-colors cursor-pointer"
                            >
                                <option value="all">All Severity</option>
                                <option value="info">Info</option>
                                <option value="warning">Warning</option>
                                <option value="danger">Danger</option>
                            </select>

                            {/* Action filter */}
                            <select
                                value={logFilter}
                                onChange={(e) => setLogFilter(e.target.value as AuditAction | 'all')}
                                className="h-9 px-3 bg-[#F6F5F2] border-transparent rounded-xl text-[12px] font-medium text-gray-600 outline-none hover:bg-[#EBE9E3] transition-colors cursor-pointer"
                            >
                                <option value="all">All Actions</option>
                                {Object.entries(ACTION_CONFIG).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                ))}
                            </select>

                            <button
                                onClick={() => { setLogFilter('all'); setSeverityFilter('all'); }}
                                className="h-9 px-3 text-[12px] font-bold text-gray-400 hover:text-[#EE6337] transition-colors flex items-center gap-1.5 bg-[#F6F5F2] rounded-xl hover:bg-[#EBE9E3]"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="px-7 py-3 border-b border-[#EAE8E3]/50 flex items-center gap-5">
                        {[
                            { key: 'info', label: 'Info', dot: 'bg-[#2F7E4C]' },
                            { key: 'warning', label: 'Warning', dot: 'bg-amber-500' },
                            { key: 'danger', label: 'Danger', dot: 'bg-[#C52A1A]' },
                        ].map((s) => (
                            <div key={s.key} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                                {s.label}
                            </div>
                        ))}
                    </div>

                    {/* Log rows */}
                    {filteredLogs.length === 0 ? (
                        <div className="h-40 flex items-center justify-center">
                            <div className="text-center space-y-2">
                                <Activity className="w-8 h-8 text-gray-200 mx-auto" />
                                <p className="text-[13px] text-gray-400 font-medium">No logs match your filters.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#EAE8E3]/40">
                            {filteredLogs.map((log) => {
                                const actionCfg = ACTION_CONFIG[log.action];
                                const severityCfg = SEVERITY_CONFIG[log.severity];
                                return (
                                    <div
                                        key={log.id}
                                        className={`px-7 py-4 flex items-start gap-4 hover:bg-[#FAF9F6] transition-colors ${severityCfg.row}`}
                                    >
                                        {/* Severity dot */}
                                        <div className="mt-1.5 shrink-0">
                                            <span className={`w-2 h-2 rounded-full inline-block ${severityCfg.dot}`} />
                                        </div>

                                        {/* Action badge */}
                                        <div className={`w-8 h-8 ${actionCfg.bg} ${actionCfg.color} rounded-lg flex items-center justify-center shrink-0`}>
                                            {actionCfg.icon}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${actionCfg.bg} ${actionCfg.color}`}>
                                                    {actionCfg.label}
                                                </span>
                                                <span className="text-[12px] text-gray-400 font-medium">{log.target}</span>
                                            </div>
                                            <p className="text-[13px] text-gray-600 font-medium mt-1">{log.detail}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {log.admin}
                                                </span>
                                                <span className="text-[11px] text-gray-300">·</span>
                                                <span className="text-[11px] text-gray-400 font-medium">{formatTimestamp(log.timestamp)}</span>
                                            </div>
                                        </div>

                                        {/* Severity badge */}
                                        {log.severity !== 'info' && (
                                            <div className="shrink-0">
                                                {log.severity === 'danger' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFF4F3] text-[#C52A1A]">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Danger
                                                    </span>
                                                )}
                                                {log.severity === 'warning' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Warning
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="px-7 py-4 bg-[#F8F6F2]/50 border-t border-[#EAE8E3] text-[12px] text-gray-400 font-medium">
                        Showing {filteredLogs.length} of {MOCK_LOGS.length} log entries · Logs are retained for 90 days
                    </div>
                </div>
            </div>
        </div>
    );
}
