import React from 'react';
import { BellIcon, BatteryIcon, LightBulbIcon, SparklesIcon, CalendarIcon, AcademicCapIcon, BeakerIcon, BookOpenIcon, CheckCircleIcon } from './icons';
import type { StudyPlan, StudyTask } from '../types';

const ActionButton = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 text-zinc-300 hover:text-white transition-colors w-20 text-center">
        {icon}
        <span className="text-xs">{label}</span>
    </button>
);

interface PlannerViewProps {
    subjects: string;
    setSubjects: (value: string) => void;
    deadline: string;
    setDeadline: (value: string) => void;
    hoursPerDay: string;
    setHoursPerDay: (value: string) => void;
    additionalInfo: string;
    setAdditionalInfo: (value: string) => void;
    studyPlan: StudyPlan | null;
    isLoading: boolean;
    error: string | null;
    handleGeneratePlan: (e: React.FormEvent) => Promise<void>;
    setActiveTimerMode: (mode: 'focus' | 'break' | null) => void;
    setIsIdeaGeneratorOpen: (isOpen: boolean) => void;
    setIsAssistantOpen: (isOpen: boolean) => void;
    handleToggleTaskStatus: (taskId: number) => void;
    onSelectTask: (task: StudyTask) => void;
    planProgress: number;
    completedTasks: number;
    totalTasks: number;
    onOpenNotifications: () => void;
    unreadCount: number;
}


const PlannerView: React.FC<PlannerViewProps> = (props) => {
    const {
        subjects, setSubjects, deadline, setDeadline, hoursPerDay, setHoursPerDay,
        additionalInfo, setAdditionalInfo,
        studyPlan, isLoading, error, handleGeneratePlan,
        setActiveTimerMode, setIsIdeaGeneratorOpen, setIsAssistantOpen,
        handleToggleTaskStatus,
        onSelectTask,
        planProgress, completedTasks, totalTasks,
        onOpenNotifications, unreadCount
    } = props;

    return (
        <>
            {/* Header */}
            <header className="flex justify-between items-center text-zinc-300">
                <button onClick={onOpenNotifications} className="relative p-1 rounded-full hover:bg-zinc-700 transition-colors">
                    <BellIcon />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                    )}
                </button>
                <div className="font-bold text-sm">Planify</div>
                <AcademicCapIcon />
            </header>

            {/* Hero Section */}
            <div className="relative text-left rounded-xl overflow-hidden h-48">
                <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=900&auto=format&fit=crop" alt="A collection of books" className="w-full h-full object-cover filter grayscale brightness-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <h1 className="text-5xl font-bold text-white tracking-tight" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>Planify</h1>
                </div>
            </div>
            
             {/* Status Bar */}
            <div className="bg-zinc-800 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 text-zinc-400 text-sm">
                        <BatteryIcon />
                        <span>Plan Progress</span>
                    </div>
                    <div className="text-sm font-bold text-white">
                        {totalTasks > 0 
                            ? <>{planProgress}% / <span className="text-zinc-400">{completedTasks} of {totalTasks} tasks</span></>
                            : <>100 % / <span className="text-zinc-400">Ready to plan!</span></>
                        }
                    </div>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-1.5 mt-2">
                    <div className="bg-white h-1.5 rounded-full transition-all duration-500" style={{ width: `${totalTasks > 0 ? planProgress : 100}%` }}></div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-zinc-800 p-3 rounded-xl flex justify-around">
                <ActionButton icon={<SparklesIcon />} label="Focus Mode" onClick={() => setActiveTimerMode('focus')} />
                <ActionButton icon={<BeakerIcon />} label="Take a Break" onClick={() => setActiveTimerMode('break')} />
                <ActionButton icon={<LightBulbIcon />} label="New Idea" onClick={() => setIsIdeaGeneratorOpen(true)} />
                <ActionButton icon={<SparklesIcon />} label="AI Assistant" onClick={() => setIsAssistantOpen(true)} />
            </div>
            
            {/* Main Content: Plan Generator */}
                <div className="bg-zinc-800 p-4 rounded-xl">
                <div className="flex items-center gap-3 text-zinc-300 mb-4">
                    <BookOpenIcon />
                    <h2 className="font-bold text-lg">Create a New Study Plan</h2>
                </div>

                <form onSubmit={handleGeneratePlan} className="space-y-4">
                    <div>
                        <label htmlFor="subjects" className="text-sm font-medium text-zinc-300 block mb-2">Subjects / Topics</label>
                        <textarea
                            id="subjects"
                            value={subjects}
                            onChange={(e) => setSubjects(e.target.value)}
                            placeholder="e.g., Calculus Chapter 3, World History: The Renaissance"
                            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg p-2 text-sm text-white placeholder-zinc-400 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                            disabled={isLoading}
                        />
                    </div>
                     <div>
                        <label htmlFor="additional-info" className="text-sm font-medium text-zinc-300 block mb-2">Additional Notes (Optional)</label>
                        <textarea
                            id="additional-info"
                            value={additionalInfo}
                            onChange={(e) => setAdditionalInfo(e.target.value)}
                            placeholder="e.g., 'Focus on practical examples', 'I prefer shorter study sessions'"
                            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg p-2 text-sm text-white placeholder-zinc-400 focus:ring-blue-500 focus:border-blue-500"
                            rows={2}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label htmlFor="deadline" className="text-sm font-medium text-zinc-300 block mb-2">Deadline</label>
                            <input
                                id="deadline"
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg p-2 text-sm text-white placeholder-zinc-400 focus:ring-blue-500 focus:border-blue-500"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="hours" className="text-sm font-medium text-zinc-300 block mb-2">Hours/Day</label>
                            <input
                                id="hours"
                                type="number"
                                value={hoursPerDay}
                                onChange={(e) => setHoursPerDay(e.target.value)}
                                placeholder="e.g., 3"
                                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg p-2 text-sm text-white placeholder-zinc-400 focus:ring-blue-500 focus:border-blue-500"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed">
                        {isLoading ? 'Generating Plan...' : 'Generate Plan'}
                    </button>
                </form>
            </div>

            {isLoading && (
                <div className="text-center p-8 text-zinc-400">
                    <div className="animate-pulse">Crafting your personalized study plan...</div>
                </div>
            )}

            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-xl text-sm">{error}</div>}
            
            {studyPlan && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-center mt-4">Your Active Study Plan</h2>
                    {studyPlan.tasks.map((task: StudyTask) => (
                        <button key={task.id} 
                            onClick={() => onSelectTask(task)}
                            className={`w-full text-left bg-zinc-800 p-4 rounded-xl border-l-4 transition-all ${task.status === 'completed' ? 'border-green-500 opacity-70' : 'border-blue-500 hover:bg-zinc-700'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg text-white">{task.subject}</h3>
                                <span className="text-xs font-mono bg-zinc-700 px-2 py-1 rounded-full text-zinc-300">{task.day}</span>
                            </div>
                            <p className="text-sm text-zinc-400 font-semibold">{task.topic}</p>
                            <p className="text-sm text-zinc-300 mt-2">{task.task}</p>
                            <div className="flex justify-between items-center mt-4">
                                <p className="text-xs text-zinc-500">{task.timeSlot}</p>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent opening detail view when completing
                                        handleToggleTaskStatus(task.id);
                                    }}
                                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                                        task.status === 'completed' 
                                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                                    }`}
                                >
                                    {task.status === 'completed' && <CheckCircleIcon className="w-4 h-4" />}
                                    <span>{task.status === 'completed' ? 'Completed' : 'Mark as Complete'}</span>
                                </button>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </>
    );
};

export default PlannerView;