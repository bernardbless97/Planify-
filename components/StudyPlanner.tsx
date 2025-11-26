import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateStudyPlan } from '../services/geminiService';
import * as notificationService from '../services/notificationService';
import type { StudyPlan, StudyTask, ProfileStats, User, AppNotification } from '../types';
import TimerView from './TimerView';
import IdeaGeneratorView from './IdeaGeneratorView';
import { BookOpenIcon, SparklesIcon, GlobeIcon, UserIcon, DocumentTextIcon, CalendarIcon } from './icons';
import PlannerView from './PlannerView';
import CalendarView from './CalendarView';
import AssistantView from './AssistantView';
import ResourcesView from './ResourcesView';
import ProfileView from './ProfileView';
import MyPlansView from './MyPlansView';
import TaskDetailView from './TaskDetailView';
import NotificationPanel from './NotificationPanel';

const NavButton = ({ icon, label, onClick, isActive }: { icon: React.ReactNode, label: string, onClick?: () => void, isActive?: boolean }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 transition-colors w-20 text-center ${isActive ? 'text-blue-400' : 'text-zinc-400 hover:text-white'}`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
    </button>
);

interface StudyPlannerProps {
    user: User;
    onLogout: () => void;
}

const StudyPlanner: React.FC<StudyPlannerProps> = ({ user, onLogout }) => {
    const [activeView, setActiveView] = useState<'planner' | 'calendar' | 'resources' | 'profile' | 'my-plans'>('planner');
    const [subjects, setSubjects] = useState('');
    const [deadline, setDeadline] = useState('');
    const [hoursPerDay, setHoursPerDay] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    
    const [activeStudyPlan, setActiveStudyPlan] = useState<StudyPlan | null>(null);
    const [studyPlanHistory, setStudyPlanHistory] = useState<StudyPlan[]>([]);
    
    const [schedule, setSchedule] = useState<Map<string, StudyTask[]>>(new Map());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTimerMode, setActiveTimerMode] = useState<'focus' | 'break' | null>(null);
    const [isIdeaGeneratorOpen, setIsIdeaGeneratorOpen] = useState(false);
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    
    const [selectedTask, setSelectedTask] = useState<StudyTask | null>(null);
    
    const [profileStats, setProfileStats] = useState<ProfileStats>({
        pendingTasks: 0,
        overdueTasks: 0,
        completedLast7Days: 0,
        streak: 0,
    });

    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
    const notifiedOverdueTasks = useRef(new Set<number>());

    const addNotification = useCallback((message: string, type: AppNotification['type']) => {
        const newNotification: AppNotification = {
            id: Date.now().toString() + Math.random(),
            message,
            timestamp: new Date().toISOString(),
            read: false,
            type,
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 50));
    }, []);

    useEffect(() => {
        notificationService.requestPermission();
        addNotification(`Welcome back, ${user.name}! Let's get your study session organized.`, 'info');
    }, [user.name, addNotification]);

    useEffect(() => {
        // Reset overdue notifications when the plan changes
        notifiedOverdueTasks.current.clear();
    }, [activeStudyPlan?.id]);

    useEffect(() => {
        if (!activeStudyPlan) {
            setProfileStats({ pendingTasks: 0, overdueTasks: 0, completedLast7Days: 0, streak: 0 });
            return;
        }

        const today = new Date();
        const todayStart = new Date();
        todayStart.setHours(0,0,0,0);

        const totalPending = activeStudyPlan.tasks.filter(t => t.status === 'pending').length;
        
        let overdue = 0;
        const currentOverdueTaskIds = new Set<number>();
        // Overdue tasks are pending tasks scheduled before today
        schedule.forEach((tasksOnDay, dateKey) => {
            const [year, month, day] = dateKey.split('-').map(Number);
            const taskDate = new Date(year, month - 1, day);
            taskDate.setHours(12,0,0,0); // Avoid timezone shifts

            if (taskDate < todayStart) {
                tasksOnDay.forEach(task => {
                    const fullTask = activeStudyPlan.tasks.find(t => t.id === task.id);
                    if (fullTask?.status === 'pending') {
                        overdue++;
                        currentOverdueTaskIds.add(fullTask.id);
                    }
                });
            }
        });

        currentOverdueTaskIds.forEach(taskId => {
            if (!notifiedOverdueTasks.current.has(taskId)) {
                const task = activeStudyPlan.tasks.find(t => t.id === taskId);
                if (task) {
                    addNotification(`Task "${task.topic}" is overdue. Catch up when you can!`, 'warning');
                    notifiedOverdueTasks.current.add(taskId);
                }
            }
        });

        // Completed tasks are tasks completed in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 6); 
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const completedLast7Days = activeStudyPlan.tasks.filter(task => {
            if (task.status !== 'completed' || !task.completedAt) return false;
            const completedDate = new Date(task.completedAt);
            return completedDate >= sevenDaysAgo && completedDate <= today;
        }).length;

        // Calculate streak
        let streak = 0;
        if (overdue === 0) {
            const completionDates = new Set(
                activeStudyPlan.tasks
                    .filter(task => task.status === 'completed' && task.completedAt)
                    .map(task => new Date(task.completedAt!).toISOString().split('T')[0])
            );

            if (completionDates.size > 0) {
                let currentDate = new Date();
                // Check if a task was completed today to continue or start a streak
                if (completionDates.has(currentDate.toISOString().split('T')[0])) {
                    streak = 1;
                    // Go backwards from yesterday to count consecutive days
                    currentDate.setDate(currentDate.getDate() - 1);
                    while (completionDates.has(currentDate.toISOString().split('T')[0])) {
                        streak++;
                        currentDate.setDate(currentDate.getDate() - 1);
                    }
                }
            }
        } // If overdue > 0, streak remains 0

        setProfileStats({
            pendingTasks: totalPending,
            overdueTasks: overdue,
            completedLast7Days,
            streak: streak,
        });

    }, [activeStudyPlan, schedule, addNotification]);

    const createScheduleFromPlan = useCallback((plan: StudyPlan | null) => {
        if (!plan || !plan.tasks || plan.tasks.length === 0) {
            setSchedule(new Map());
            return;
        }

        const newSchedule = new Map<string, StudyTask[]>();
        const tasks = [...plan.tasks];

        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 1);
        startDate.setHours(0, 0, 0, 0);

        const deadlineDate = new Date(plan.deadline);
        deadlineDate.setHours(23, 59, 59, 999);

        const studyDays: Date[] = [];
        let currentDate = new Date(startDate);
        while (currentDate <= deadlineDate) {
            studyDays.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (studyDays.length === 0) {
            const targetDate = new Date() > deadlineDate ? startDate : deadlineDate;
            const dateKey = targetDate.toISOString().split('T')[0];
            newSchedule.set(dateKey, tasks);
        } else {
            const tasksPerDay = Math.ceil(tasks.length / studyDays.length);
            studyDays.forEach(day => {
                const dateKey = day.toISOString().split('T')[0];
                const tasksForDay = tasks.splice(0, tasksPerDay);
                if (tasksForDay.length > 0) {
                    newSchedule.set(dateKey, tasksForDay);
                }
            });
        }
        
        notificationService.clearAllScheduledNotifications();
        notificationService.scheduleNotificationsForPlan(newSchedule);

        setSchedule(newSchedule);
    }, []);

    useEffect(() => {
        createScheduleFromPlan(activeStudyPlan);
    }, [activeStudyPlan, createScheduleFromPlan]);
    
    const handleGeneratePlan = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subjects || !deadline || !hoursPerDay) {
            setError("Please fill in all fields.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setActiveStudyPlan(null);

        const tasks = await generateStudyPlan(subjects, deadline, hoursPerDay, additionalInfo);

        if (tasks) {
            const newPlan: StudyPlan = {
                id: Date.now().toString(),
                title: subjects.split(',')[0].trim() || 'New Study Plan',
                createdAt: new Date().toISOString(),
                deadline: deadline,
                tasks: tasks,
            };
            setActiveStudyPlan(newPlan);
            setStudyPlanHistory(prev => [...prev, newPlan]);
            addNotification(`Successfully generated a new study plan for "${newPlan.title}".`, 'success');
        } else {
            setError("Failed to generate a study plan. Please try again.");
        }
        setIsLoading(false);
    }, [subjects, deadline, hoursPerDay, additionalInfo, addNotification]);
    
    const handleToggleTaskStatus = (taskId: number) => {
        if (!activeStudyPlan) return;

        const updatedPlan: StudyPlan = {
            ...activeStudyPlan,
            tasks: activeStudyPlan.tasks.map(task => {
                if (task.id === taskId) {
                    const isCompleting = task.status === 'pending';
                    if (isCompleting) {
                        addNotification(`Great job! You've completed the task: "${task.topic}".`, 'success');
                    }
                    return { 
                        ...task, 
                        status: isCompleting ? 'completed' : 'pending',
                        progress: isCompleting ? 100 : task.progress,
                        completedAt: isCompleting ? new Date().toISOString() : undefined
                    };
                }
                return task;
            }),
        };
        setActiveStudyPlan(updatedPlan);
        setStudyPlanHistory(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    };

    const handleUpdateTask = (updatedTask: StudyTask) => {
        if (!activeStudyPlan) return;
        const updatedPlan = {
            ...activeStudyPlan,
            tasks: activeStudyPlan.tasks.map(t => t.id === updatedTask.id ? updatedTask : t),
        };
        setActiveStudyPlan(updatedPlan);
        setStudyPlanHistory(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
        if (selectedTask?.id === updatedTask.id) {
            setSelectedTask(updatedTask);
        }
    };

    const handleSelectPlan = (planId: string) => {
        const plan = studyPlanHistory.find(p => p.id === planId);
        if (plan) {
            setActiveStudyPlan(plan);
            setActiveView('planner');
        }
    };
    
    const completedTasks = activeStudyPlan?.tasks.filter(t => t.status === 'completed').length ?? 0;
    const totalTasks = activeStudyPlan?.tasks.length ?? 0;
    const planProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const handleMarkNotificationAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const handleClearAllNotifications = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="bg-zinc-900 text-white min-h-screen">
            {isNotificationPanelOpen && (
                <NotificationPanel
                    notifications={notifications}
                    onClose={() => setIsNotificationPanelOpen(false)}
                    onMarkAsRead={handleMarkNotificationAsRead}
                    onClearAll={handleClearAllNotifications}
                />
            )}
            <div className="max-w-sm mx-auto p-4 flex flex-col gap-4 pb-24">
                {selectedTask ? (
                    <TaskDetailView 
                        task={selectedTask}
                        onClose={() => setSelectedTask(null)}
                        onUpdateTask={handleUpdateTask}
                        onMarkComplete={() => {
                            handleToggleTaskStatus(selectedTask.id);
                            setSelectedTask(null);
                        }}
                    />
                ) : (
                    <>
                    {activeView === 'planner' && (
                        <PlannerView
                            subjects={subjects}
                            setSubjects={setSubjects}
                            deadline={deadline}
                            setDeadline={setDeadline}
                            hoursPerDay={hoursPerDay}
                            setHoursPerDay={setHoursPerDay}
                            additionalInfo={additionalInfo}
                            setAdditionalInfo={setAdditionalInfo}
                            studyPlan={activeStudyPlan}
                            isLoading={isLoading}
                            error={error}
                            handleGeneratePlan={handleGeneratePlan}
                            setActiveTimerMode={setActiveTimerMode}
                            setIsIdeaGeneratorOpen={setIsIdeaGeneratorOpen}
                            setIsAssistantOpen={setIsAssistantOpen}
                            handleToggleTaskStatus={handleToggleTaskStatus}
                            onSelectTask={setSelectedTask}
                            planProgress={planProgress}
                            completedTasks={completedTasks}
                            totalTasks={totalTasks}
                            onOpenNotifications={() => setIsNotificationPanelOpen(true)}
                            unreadCount={unreadCount}
                        />
                    )}
                    {activeView === 'calendar' && (
                        <CalendarView schedule={schedule} onSelectTask={setSelectedTask} />
                    )}
                    {activeView === 'resources' && (
                        <ResourcesView />
                    )}
                    {activeView === 'profile' && (
                        <ProfileView user={user} onLogout={onLogout} stats={profileStats} />
                    )}
                    {activeView === 'my-plans' && (
                        <MyPlansView 
                            plans={studyPlanHistory}
                            onSelectPlan={handleSelectPlan}
                            activePlanId={activeStudyPlan?.id || null}
                        />
                    )}
                    </>
                )}
            </div>

            {/* Bottom Nav */}
            <footer className="fixed bottom-0 left-0 right-0 bg-zinc-800/80 backdrop-blur-sm border-t border-zinc-700">
                <div className="max-w-sm mx-auto flex justify-around items-center p-3">
                    <NavButton icon={<BookOpenIcon />} label="Planner" isActive={activeView === 'planner'} onClick={() => setActiveView('planner')} />
                    <NavButton icon={<CalendarIcon />} label="Calendar" isActive={activeView === 'calendar'} onClick={() => setActiveView('calendar')} />
                    <NavButton icon={<DocumentTextIcon />} label="My Plans" isActive={activeView === 'my-plans'} onClick={() => setActiveView('my-plans')} />
                    <NavButton icon={<GlobeIcon />} label="Resources" isActive={activeView === 'resources'} onClick={() => setActiveView('resources')} />
                    <NavButton icon={<UserIcon />} label="Profile" isActive={activeView === 'profile'} onClick={() => setActiveView('profile')} />
                </div>
            </footer>
            
            {activeTimerMode && <TimerView mode={activeTimerMode} onClose={() => setActiveTimerMode(null)} />}
            {isIdeaGeneratorOpen && <IdeaGeneratorView onClose={() => setIsIdeaGeneratorOpen(false)} />}
            {isAssistantOpen && <AssistantView onClose={() => setIsAssistantOpen(false)} />}
        </div>
    );
};

export default StudyPlanner;