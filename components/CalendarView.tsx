import React, { useState, useMemo, useEffect } from 'react';
import type { StudyTask } from '../types';
import { Bars3Icon, ChevronLeftIcon, ChevronRightIcon } from './icons';

const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

const getTaskTypeAndColor = (task: StudyTask): { type: string, color: string } => {
    const text = `${task.subject.toLowerCase()} ${task.topic.toLowerCase()}`;
    if (text.includes('class')) return { type: 'Class', color: 'bg-purple-500/20 border-purple-400 text-purple-300' };
    if (text.includes('exam')) return { type: 'Exam', color: 'bg-green-500/20 border-green-400 text-green-300' };
    if (text.includes('break') || text.includes('lunch') || text.includes('soccer') || text.includes('bus home')) return { type: 'Xtra', color: 'bg-orange-500/20 border-orange-400 text-orange-300' };
    return { type: 'Task', color: 'bg-teal-500/20 border-teal-400 text-teal-300' };
};

const timeToDecimal = (timeStr: string): number => {
    const [time, modifier] = timeStr.trim().split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    minutes = minutes || 0;
    if (modifier) {
        if (modifier.toUpperCase() === 'PM' && hours < 12) {
            hours += 12;
        }
        if (modifier.toUpperCase() === 'AM' && hours === 12) {
            hours = 0;
        }
    }
    return hours + minutes / 60;
};


interface CalendarViewProps {
    schedule: Map<string, StudyTask[]>;
    onSelectTask: (task: StudyTask) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ schedule, onSelectTask }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const weekDays = useMemo(() => {
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1) - 3); // Center the week around selected date
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + i);
            return date;
        });
    }, [selectedDate]);
    
    const tasksForSelectedDay = useMemo(() => {
        const dateKey = selectedDate.toISOString().split('T')[0];
        return schedule.get(dateKey) || [];
    }, [selectedDate, schedule]);

    const handleDateChange = (amount: number) => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + amount);
            return newDate;
        });
    };

    const timelineHours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

    return (
        <div className="w-full space-y-4">
            {/* Header */}
            <header className="flex justify-between items-center text-white">
                <button className="p-2 rounded-full hover:bg-zinc-700"><Bars3Icon /></button>
                <div className="flex items-center gap-2">
                    <button onClick={() => handleDateChange(-1)} className="p-1 rounded-full hover:bg-zinc-700"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <span className="font-bold text-sm w-28 text-center">{selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', weekday: 'short' })}</span>
                    <button onClick={() => handleDateChange(1)} className="p-1 rounded-full hover:bg-zinc-700"><ChevronRightIcon className="w-5 h-5" /></button>
                </div>
                <button onClick={() => setSelectedDate(new Date())} className="text-sm font-semibold bg-blue-600/50 border border-blue-500 px-3 py-1 rounded-lg hover:bg-blue-600/80 transition-colors">Today</button>
            </header>

            {/* Week Strip */}
            <div className="flex justify-between items-center gap-2">
                {weekDays.map(day => (
                    <button 
                        key={day.toISOString()} 
                        onClick={() => setSelectedDate(day)}
                        className={`flex flex-col items-center p-2 rounded-lg w-12 transition-colors ${isSameDay(day, selectedDate) ? 'bg-blue-600 text-white' : 'hover:bg-zinc-700'}`}>
                        <span className="text-xs font-medium uppercase">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="text-lg font-bold">{day.getDate()}</span>
                    </button>
                ))}
            </div>

            {/* Timeline */}
            <div className="bg-zinc-800 rounded-xl p-4">
                {tasksForSelectedDay.length === 0 ? (
                    <div className="text-center text-zinc-500 py-20">
                        <p>No tasks scheduled for this day.</p>
                        <p className="text-sm mt-1">Enjoy your break!</p>
                    </div>
                ) : (
                    <div className="relative flex">
                        {/* Time Column */}
                        <div className="w-12 text-right pr-2 text-xs font-mono text-zinc-400 flex-shrink-0">
                            {timelineHours.map(hour => (
                                <div key={hour} className="h-16 flex items-start justify-end relative -top-2">
                                    {hour % 12 === 0 ? 12 : hour % 12} {hour < 12 || hour === 24 ? 'AM' : 'PM'}
                                </div>
                            ))}
                        </div>
                        {/* Events Column */}
                        <div className="relative flex-grow border-l border-zinc-700">
                             {timelineHours.map(hour => (
                                <div key={hour} className="h-16 border-b border-zinc-700/50"></div>
                            ))}
                            {tasksForSelectedDay.map(task => {
                                const [startStr, endStr] = task.timeSlot.split('-').map(s => s.trim());
                                const startHour = timeToDecimal(startStr);
                                const endHour = timeToDecimal(endStr);
                                const top = (startHour - timelineHours[0]) * 4; // 4rem (h-16) per hour
                                const height = (endHour - startHour) * 4;
                                const {type, color} = getTaskTypeAndColor(task);

                                return (
                                    <button
                                        key={task.id}
                                        onClick={() => onSelectTask(task)}
                                        className={`absolute w-[calc(100%-0.5rem)] left-2 p-2 rounded-lg text-left border ${color}`}
                                        style={{ top: `${top}rem`, height: `${height}rem` }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold text-sm text-white">{task.subject}</span>
                                            <span className="text-xs font-semibold">{type}</span>
                                        </div>
                                        <p className="text-xs text-zinc-300 mt-1">{task.topic}</p>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarView;