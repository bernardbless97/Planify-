
import React from 'react';
import type { ProfileStats, User } from '../types';
import { 
    ChevronLeftIcon, PencilIcon, ClockIcon, ExclamationTriangleIcon, CheckBadgeIcon, FireIcon,
    AtSymbolIcon, KeyIcon, ArrowLeftOnRectangleIcon, ChevronRightIcon
} from './icons';

interface ProfileViewProps {
    user: User;
    onLogout: () => void;
    stats: ProfileStats;
}

const StatCard = ({ icon, value, label, sublabel, colorClass }: { icon: React.ReactNode, value: number, label: string, sublabel: string, colorClass: string }) => (
    <div className={`p-4 rounded-xl flex flex-col gap-1 ${colorClass}`}>
        <div className="flex items-center gap-2 text-sm font-semibold">
            {icon}
            <span>{label}</span>
        </div>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-xs opacity-70">{sublabel}</p>
    </div>
);

const SettingsItem = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-3 text-left hover:bg-zinc-700/50 rounded-lg transition-colors">
        <div className="flex items-center gap-4">
            {icon}
            <span className="font-medium">{label}</span>
        </div>
        <ChevronRightIcon />
    </button>
);

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout, stats }) => {
    
    const handleNotImplemented = (feature: string) => {
        alert(`${feature} is not implemented in this demo.`);
    };

    return (
        <div className="w-full space-y-6">
            <header className="flex justify-between items-center text-white">
                <button className="p-2 rounded-full hover:bg-zinc-700 invisible"><ChevronLeftIcon /></button>
                <div className="font-bold text-lg">Profile</div>
                <button onClick={() => handleNotImplemented('Editing profile')} className="p-2 rounded-full hover:bg-zinc-700"><PencilIcon /></button>
            </header>
            
            <div className="flex flex-col items-center gap-2 text-center">
                <img 
                    src={user.picture || `https://i.pravatar.cc/150?u=${user.email}`} 
                    alt="User Avatar" 
                    className="w-24 h-24 rounded-full border-4 border-zinc-700 object-cover" 
                />
                <div className="mt-2">
                    <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                    <p className="text-sm text-zinc-400">{user.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full text-white">
                <StatCard 
                    icon={<ClockIcon className="w-5 h-5" />}
                    value={stats.pendingTasks}
                    label="Pending Tasks"
                    sublabel="Total in active plan"
                    colorClass="bg-yellow-500/10 text-yellow-300"
                />
                <StatCard 
                    icon={<ExclamationTriangleIcon className="w-5 h-5" />}
                    value={stats.overdueTasks}
                    label="Overdue Tasks"
                    sublabel="Total"
                    colorClass="bg-red-500/10 text-red-400"
                />
                <StatCard 
                    icon={<CheckBadgeIcon className="w-5 h-5" />}
                    value={stats.completedLast7Days}
                    label="Task Completed"
                    sublabel="Last 7 days"
                    colorClass="bg-green-500/10 text-green-400"
                />
                <StatCard 
                    icon={<FireIcon className="w-5 h-5" />}
                    value={stats.streak}
                    label="Your Streak"
                    sublabel="Total streak"
                    colorClass="bg-purple-500/10 text-purple-400"
                />
            </div>

            <div className="w-full bg-zinc-800 p-2 rounded-xl text-white">
                <SettingsItem icon={<AtSymbolIcon className="w-6 h-6 text-zinc-400" />} label="Change Email" onClick={() => handleNotImplemented('Change Email')} />
                <SettingsItem icon={<KeyIcon className="w-6 h-6 text-zinc-400" />} label="Change Password" onClick={() => handleNotImplemented('Change Password')} />
                <SettingsItem icon={<ArrowLeftOnRectangleIcon className="w-6 h-6 text-zinc-400" />} label="Log out" onClick={onLogout} />
            </div>
            
            <div className="text-center pt-2">
                <button onClick={() => handleNotImplemented('Delete Account')} className="text-red-500 hover:text-red-400 font-medium text-sm">
                    Delete Account
                </button>
            </div>
        </div>
    );
};

export default ProfileView;