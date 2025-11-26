import React from 'react';
import type { AppNotification } from '../types';
import { XMarkIcon, BellIcon, InformationCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, TrashIcon } from './icons';

const timeAgo = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;

    const years = Math.floor(days / 365);
    return `${years}y ago`;
};


const NOTIFICATION_ICONS = {
    info: <InformationCircleIcon className="h-6 w-6 text-blue-400" />,
    success: <CheckCircleIcon className="h-6 w-6 text-green-400" />,
    warning: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />,
};

interface NotificationPanelProps {
    notifications: AppNotification[];
    onClose: () => void;
    onMarkAsRead: (id: string) => void;
    onClearAll: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose, onMarkAsRead, onClearAll }) => {
    return (
        <div className="fixed inset-0 bg-zinc-900/90 backdrop-blur-md flex justify-end z-50">
            <div className="bg-zinc-800 w-full max-w-sm h-full flex flex-col border-l border-zinc-700">
                <header className="flex items-center justify-between p-4 border-b border-zinc-700">
                    <div className="flex items-center gap-3">
                        <BellIcon />
                        <h2 className="font-bold text-lg text-white">Notifications</h2>
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-700">
                        <XMarkIcon />
                    </button>
                </header>

                {notifications.length > 0 ? (
                    <>
                        <div className="flex-grow overflow-y-auto p-2">
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={() => onMarkAsRead(notification.id)}
                                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${notification.read ? 'opacity-60' : 'bg-zinc-700/50 hover:bg-zinc-700'}`}
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        {NOTIFICATION_ICONS[notification.type]}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-sm text-zinc-200 leading-snug">{notification.message}</p>
                                        <p className="text-xs text-zinc-400 mt-1">{timeAgo(notification.timestamp)}</p>
                                    </div>
                                    {!notification.read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1 flex-shrink-0 self-center"></div>}
                                </div>
                            ))}
                        </div>
                        <footer className="p-4 border-t border-zinc-700">
                             <button onClick={onClearAll} className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                                <TrashIcon className="w-5 h-5" />
                                Clear All Notifications
                            </button>
                        </footer>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center text-zinc-500 p-4">
                        <BellIcon />
                        <p className="mt-2 font-semibold">All caught up!</p>
                        <p className="text-sm">You have no new notifications.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;
