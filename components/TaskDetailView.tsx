import React, { useState, useEffect } from 'react';
import type { StudyTask, Subtask } from '../types';
import { ChevronLeftIcon, PencilIcon, CheckCircleIcon, ChevronUpIcon, PlusIcon } from './icons';

interface TaskDetailViewProps {
    task: StudyTask;
    onClose: () => void;
    onUpdateTask: (updatedTask: StudyTask) => void;
    onMarkComplete: () => void;
}

const FALLBACK_IMAGE_URL = "https://images.unsplash.com/photo-1532187643623-dbf26353d38c?q=80&w=900&auto=format&fit=crop";

const SubtaskItem: React.FC<{ subtask: Subtask, onToggle: () => void }> = ({ subtask, onToggle }) => (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-700/50">
        <button onClick={onToggle} className="flex-shrink-0">
            {subtask.completed ? (
                <CheckCircleIcon className="w-6 h-6 text-green-500" />
            ) : (
                <div className="w-6 h-6 border-2 border-zinc-500 rounded-full"></div>
            )}
        </button>
        <span className={`flex-grow text-sm ${subtask.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
            {subtask.text}
        </span>
    </div>
);

const TaskDetailView: React.FC<TaskDetailViewProps> = ({ task, onClose, onUpdateTask, onMarkComplete }) => {
    const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks);
    
    // Auto-calculate progress based on subtasks
    const progress = Math.round(
        subtasks.length > 0
            ? (subtasks.filter(st => st.completed).length / subtasks.length) * 100
            : task.status === 'completed' ? 100 : 0
    );
    
    // Update parent task when progress changes
    useEffect(() => {
        if (progress !== task.progress) {
            onUpdateTask({ ...task, progress });
        }
    }, [progress, task, onUpdateTask]);

    const handleToggleSubtask = (subtaskId: number) => {
        const updatedSubtasks = subtasks.map(st =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        setSubtasks(updatedSubtasks);
        onUpdateTask({ ...task, subtasks: updatedSubtasks });
    };

    const handleAddSubtask = () => {
        const text = window.prompt("Enter new subtask description:");
        if (text && text.trim()) {
            const newSubtask: Subtask = {
                id: Date.now(),
                text: text.trim(),
                completed: false,
            };
            const updatedSubtasks = [...subtasks, newSubtask];
            setSubtasks(updatedSubtasks);
            onUpdateTask({ ...task, subtasks: updatedSubtasks });
        }
    };

    return (
        <div className="w-full space-y-4">
            {/* Header */}
            <div className="relative h-44 rounded-2xl overflow-hidden">
                <img src={task.imageUrl || FALLBACK_IMAGE_URL} alt={task.subject} className="w-full h-full object-cover brightness-75" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <button onClick={onClose} className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-colors"><ChevronLeftIcon /></button>
                        <button className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-colors"><PencilIcon /></button>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white shadow-md">{task.topic}</h1>
                        <p className="text-sm font-semibold text-blue-300">{task.subject}</p>
                    </div>
                </div>
            </div>

            {/* Meta Info */}
            <div className="flex justify-around bg-zinc-800 p-3 rounded-xl text-center text-sm">
                <div>
                    <p className="text-zinc-400 text-xs">Day</p>
                    <p className="font-semibold">{task.day}</p>
                </div>
                <div>
                    <p className="text-zinc-400 text-xs">Time</p>
                    <p className="font-semibold">{task.timeSlot}</p>
                </div>
                <div>
                    <p className="text-zinc-400 text-xs">Type</p>
                    <p className="font-semibold">Assignment</p>
                </div>
            </div>

            {/* Progress */}
            <div className="bg-zinc-800 p-4 rounded-xl">
                 <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-zinc-300">Progress</label>
                    <span className="text-sm font-bold text-blue-400">{progress}%</span>
                 </div>
                 <div className="w-full bg-zinc-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            
            {/* Description */}
            <div className="bg-zinc-800 p-4 rounded-xl">
                <h3 className="font-bold text-lg mb-2">Description</h3>
                <p className="text-sm text-zinc-300 leading-relaxed">{task.description}</p>
            </div>

            {/* Subtasks */}
            <div className="bg-zinc-800 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg">Subtasks</h3>
                    <ChevronUpIcon className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="space-y-1">
                    {subtasks.map(st => <SubtaskItem key={st.id} subtask={st} onToggle={() => handleToggleSubtask(st.id)} />)}
                </div>
                <button onClick={handleAddSubtask} className="w-full mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-blue-400 hover:bg-zinc-700/50 p-2 rounded-lg transition-colors">
                    <PlusIcon className="w-5 h-5" />
                    Add subtask
                </button>
            </div>

            {/* Mark as Completed */}
            <button onClick={onMarkComplete} disabled={task.status === 'completed'} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed">
                {task.status === 'completed' ? 'Completed' : 'Mark as completed'}
            </button>
        </div>
    );
}

export default TaskDetailView;