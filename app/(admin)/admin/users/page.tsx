'use client';

import { useState, useEffect } from 'react';
import {
    Search,
    ChevronRight,
    Loader2,
    AlertCircle,
    Users,
    ShieldCheck,
    UserX,
    UserCheck,
    Mail,
    Phone,
    Calendar,
} from 'lucide-react';
import { UserResponse } from '@/types/auth.types';
import apiClient from '@/lib/api/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';

type RoleFilter = 'all' | 'admin' | 'user';
type StatusFilter = 'all' | 'active' | 'locked';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters (client-side — list is bounded)
    const [filterName, setFilterName] = useState('');
    const [filterRole, setFilterRole] = useState<RoleFilter>('all');
    const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');

    // Detail dialog
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

    // Fetch all users (admin endpoint)
    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/users/admin');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Client-side filtering
    const filtered = users.filter((u) => {
        const nameMatch =
            u.fullName?.toLowerCase().includes(filterName.toLowerCase()) ||
            u.username.toLowerCase().includes(filterName.toLowerCase()) ||
            u.email.toLowerCase().includes(filterName.toLowerCase());

        const roleMatch =
            filterRole === 'all' ||
            (filterRole === 'admin' && u.roles.includes('ROLE_ADMIN')) ||
            (filterRole === 'user' && !u.roles.includes('ROLE_ADMIN'));

        const statusMatch =
            filterStatus === 'all' ||
            (filterStatus === 'active' && u.enabled && u.accountNonLocked) ||
            (filterStatus === 'locked' && (!u.enabled || !u.accountNonLocked));

        return nameMatch && roleMatch && statusMatch;
    });

    // Stats
    const totalAdmins = users.filter((u) => u.roles.includes('ROLE_ADMIN')).length;
    const totalActive = users.filter((u) => u.enabled && u.accountNonLocked).length;
    const totalLocked = users.filter((u) => !u.enabled || !u.accountNonLocked).length;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getInitial = (user: UserResponse) =>
        (user.fullName || user.username || '?').charAt(0).toUpperCase();

    return (
        <div className="flex flex-col min-h-screen bg-[#FCFBFA] font-sans">

            {/* Breadcrumbs + Header */}
            <div className="px-8 lg:px-12 pt-8 pb-4 space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    <span>Admin</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-[#EE6337]">Users</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-serif font-bold text-[#161B22] tracking-tight">
                            User Directory
                        </h1>
                        <p className="text-[14px] text-gray-500 font-medium italic">
                            Browse and monitor all registered members of the bookstore.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="px-8 lg:px-12 py-2">
                <div className="flex flex-wrap gap-4">
                    {[
                        { label: 'Total Members', value: users.length, icon: <Users className="w-5 h-5 text-[#EE6337]" />, bg: 'bg-[#F4F2EC]' },
                        { label: 'Administrators', value: totalAdmins, icon: <ShieldCheck className="w-5 h-5 text-[#0A192F]" />, bg: 'bg-[#EDF2FF]' },
                        { label: 'Active Accounts', value: totalActive, icon: <UserCheck className="w-5 h-5 text-[#2F7E4C]" />, bg: 'bg-[#F0FBF4]' },
                        { label: 'Locked Accounts', value: totalLocked, icon: <UserX className="w-5 h-5 text-[#C52A1A]" />, bg: 'bg-[#FFF4F3]' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white border border-[#EAE8E3]/50 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-sm">
                            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
                                <p className="text-2xl font-serif font-bold text-[#161B22]">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="px-8 lg:px-12 py-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#EAE8E3]/50 flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[220px] group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#EE6337] transition-colors" />
                        <Input
                            placeholder="Search by name, username or email..."
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            className="pl-10 h-11 bg-[#F6F5F2] border-transparent focus:bg-white focus:border-[#EE6337]/50 rounded-xl transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Role filter */}
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value as RoleFilter)}
                            className="h-11 px-4 bg-[#F6F5F2] border-transparent rounded-xl text-[14px] font-medium text-gray-600 outline-none hover:bg-[#EBE9E3] transition-colors cursor-pointer"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>

                        {/* Status filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
                            className="h-11 px-4 bg-[#F6F5F2] border-transparent rounded-xl text-[14px] font-medium text-gray-600 outline-none hover:bg-[#EBE9E3] transition-colors cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="locked">Locked</option>
                        </select>

                        <Button
                            variant="outline"
                            className="h-11 px-4 border-[#EAE8E3] rounded-xl text-gray-500 hover:text-[#161B22] hover:bg-[#F6F5F2]"
                            onClick={() => {
                                setFilterName('');
                                setFilterRole('all');
                                setFilterStatus('all');
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="px-8 lg:px-12 py-4 flex-1">
                <div className="bg-white rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-[#EAE8E3]/50 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-[#F8F6F2] hover:bg-[#F8F6F2] border-b border-[#EAE8E3]">
                                <TableHead className="w-16 px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500">#</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500">Member</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500">Contact</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500">Role</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500 text-center">Status</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500">Joined</TableHead>
                                <TableHead className="px-6 py-5 text-[10px] uppercase tracking-widest font-bold text-gray-500 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#EE6337] opacity-60" />
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-4">
                                            Loading Members...
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
                                        <div className="max-w-xs mx-auto space-y-2">
                                            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
                                            <p className="text-[17px] font-serif font-bold text-[#161B22]">No members found</p>
                                            <p className="text-sm text-gray-400">
                                                Try adjusting your search or filters.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((user, index) => {
                                    const isAdmin = user.roles.includes('ROLE_ADMIN');
                                    const isActive = user.enabled && user.accountNonLocked;

                                    return (
                                        <TableRow
                                            key={user.id}
                                            className="group hover:bg-[#FAF9F6] border-b border-[#EAE8E3]/40 transition-colors cursor-pointer"
                                            onClick={() => setSelectedUser(user)}
                                        >
                                            {/* Index */}
                                            <TableCell className="px-6 py-4">
                                                <span className="text-[12px] font-bold text-gray-300">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                            </TableCell>

                                            {/* Member */}
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border border-[#EAE8E3] shadow-sm shrink-0">
                                                        <AvatarImage src={user.avatar || ''} alt={user.fullName || user.username} />
                                                        <AvatarFallback className="bg-[#cd5227] text-white text-sm font-bold">
                                                            {getInitial(user)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-[15px] font-serif font-bold text-[#161B22] group-hover:text-[#EE6337] transition-colors leading-tight">
                                                            {user.fullName || '—'}
                                                        </p>
                                                        <p className="text-[12px] text-gray-400 font-medium">@{user.username}</p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Contact */}
                                            <TableCell className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <p className="text-[13px] text-gray-600 font-medium flex items-center gap-1.5">
                                                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                        {user.email}
                                                    </p>
                                                    {user.phoneNumber && (
                                                        <p className="text-[12px] text-gray-400 font-medium flex items-center gap-1.5">
                                                            <Phone className="w-3.5 h-3.5 shrink-0" />
                                                            {user.phoneNumber}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Role */}
                                            <TableCell className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map((role) => (
                                                        <Badge
                                                            key={role}
                                                            variant="outline"
                                                            className={`text-[10px] px-2 py-0 font-bold uppercase tracking-tight border ${isAdmin
                                                                ? 'border-[#0A192F]/30 bg-[#EDF2FF] text-[#0A192F]'
                                                                : 'border-gray-200 bg-transparent text-gray-500'
                                                                }`}
                                                        >
                                                            {role.replace('ROLE_', '')}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${isActive
                                                    ? 'bg-[#F0FBF4] text-[#2F7E4C]'
                                                    : 'bg-[#FFF4F3] text-[#C52A1A]'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#2F7E4C]' : 'bg-[#C52A1A]'}`} />
                                                    {isActive ? 'Active' : 'Locked'}
                                                </span>
                                            </TableCell>

                                            {/* Joined */}
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-[13px] text-gray-500 font-medium">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                    {formatDate(user.createdAt)}
                                                </div>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-[12px] font-bold text-gray-400 hover:text-[#EE6337] hover:bg-[#EE6337]/10 rounded-lg transition-all"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedUser(user);
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>

                    {/* Footer */}
                    {!isLoading && filtered.length > 0 && (
                        <div className="px-8 py-5 bg-[#F8F6F2]/50 border-t border-[#EAE8E3] flex items-center justify-between">
                            <p className="text-[12px] font-medium text-gray-400">
                                Showing{' '}
                                <span className="text-[#161B22] font-bold">{filtered.length}</span>
                                {' '}of{' '}
                                <span className="text-[#161B22] font-bold">{users.length}</span>
                                {' '}members
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* User Detail Dialog */}
            {selectedUser && (
                <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                    <DialogContent className="sm:max-w-[480px] bg-white rounded-[24px] p-0 border-none shadow-2xl font-sans">
                        {/* Top gradient strip */}
                        <div className="h-2 rounded-t-[24px] bg-gradient-to-r from-[#0A192F] via-[#EE6337] to-[#cd5227]" />

                        <div className="px-8 py-8 space-y-6">
                            {/* Avatar + Name */}
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border-2 border-[#EAE8E3] shadow-md">
                                    <AvatarImage src={selectedUser.avatar || ''} />
                                    <AvatarFallback className="bg-[#cd5227] text-white text-2xl font-bold">
                                        {getInitial(selectedUser)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <DialogTitle className="text-2xl font-serif font-bold text-[#161B22] leading-tight">
                                        {selectedUser.fullName || selectedUser.username}
                                    </DialogTitle>
                                    <p className="text-[13px] text-gray-400 font-medium">@{selectedUser.username}</p>
                                </div>
                            </div>

                            <DialogDescription className="sr-only">
                                User details for {selectedUser.fullName || selectedUser.username}
                            </DialogDescription>

                            {/* Details grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Email', value: selectedUser.email },
                                    { label: 'Phone', value: selectedUser.phoneNumber || '—' },
                                    { label: 'Gender', value: selectedUser.gender || '—' },
                                    { label: 'Date of Birth', value: formatDate(selectedUser.dateOfBirth) },
                                    { label: 'Address', value: selectedUser.address || '—' },
                                    { label: 'Joined', value: formatDate(selectedUser.createdAt) },
                                ].map(({ label, value }) => (
                                    <div key={label} className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#EE6337]">{label}</p>
                                        <p className="text-[14px] font-semibold text-[#161B22] truncate" title={value}>{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Roles + Status */}
                            <div className="flex items-center justify-between pt-2 border-t border-[#EAE8E3]">
                                <div className="flex gap-2">
                                    {selectedUser.roles.map((role) => (
                                        <Badge
                                            key={role}
                                            className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${selectedUser.roles.includes('ROLE_ADMIN')
                                                ? 'bg-[#EDF2FF] text-[#0A192F] border border-[#0A192F]/20'
                                                : 'bg-[#F4F2EC] text-gray-600 border border-gray-200'
                                                }`}
                                        >
                                            {role.replace('ROLE_', '')}
                                        </Badge>
                                    ))}
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${selectedUser.enabled && selectedUser.accountNonLocked
                                    ? 'bg-[#F0FBF4] text-[#2F7E4C]'
                                    : 'bg-[#FFF4F3] text-[#C52A1A]'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${selectedUser.enabled && selectedUser.accountNonLocked ? 'bg-[#2F7E4C]' : 'bg-[#C52A1A]'}`} />
                                    {selectedUser.enabled && selectedUser.accountNonLocked ? 'Active' : 'Locked'}
                                </span>
                            </div>

                            <Button
                                className="w-full h-11 bg-[#0A192F] hover:bg-[#162A4B] text-white rounded-xl font-semibold tracking-wide shadow-md transition-all active:scale-95"
                                onClick={() => setSelectedUser(null)}
                            >
                                Close
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
