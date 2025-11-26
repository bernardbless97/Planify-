import React, { useState, useEffect, useMemo } from 'react';
import { XMarkIcon } from './icons';
import { sendNotification } from '../services/notificationService';

const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

interface TimerViewProps {
    mode: 'focus' | 'break';
    onClose: () => void;
}

const TimerView: React.FC<TimerViewProps> = ({ mode, onClose }) => {
    const FOCUS_DURATION = 25 * 60; // 25 minutes

    const [stage, setStage] = useState<'selection' | 'timer'>(mode === 'focus' ? 'timer' : 'selection');
    const [initialTime, setInitialTime] = useState<number>(mode === 'focus' ? FOCUS_DURATION : 0);
    const [timeLeft, setTimeLeft] = useState<number>(mode === 'focus' ? FOCUS_DURATION : 0);
    const [isRunning, setIsRunning] = useState<boolean>(mode === 'focus' ? true : false);

    useEffect(() => {
        if (!isRunning) return;

        if (timeLeft <= 0) {
            setIsRunning(false);
            if (mode === 'focus') {
                sendNotification('Focus session complete!', 'Time to take a short break.');
            } else {
                sendNotification("Break's over!", "Let's get back to studying.");
            }
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [isRunning, timeLeft, mode]);

    const handleSelectBreak = (minutes: number) => {
        const durationInSeconds = minutes * 60;
        setInitialTime(durationInSeconds);
        setTimeLeft(durationInSeconds);
        setStage('timer');
        setIsRunning(true);
    };

    const handleStartPause = () => {
        if (timeLeft > 0) {
            setIsRunning(!isRunning);
        }
    };

    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(initialTime);
    };
    
    const radius = 110;
    const circumference = 2 * Math.PI * radius;
    const progress = initialTime > 0 ? (timeLeft / initialTime) : 0;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="fixed inset-0 bg-zinc-900/90 backdrop-blur-md flex flex-col items-center justify-center z-50 text-white">
            <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
                <XMarkIcon />
            </button>

            {stage === 'selection' && mode === 'break' ? (
                <div className="flex flex-col items-center gap-6">
                    <h2 className="text-3xl font-bold">Take a Break</h2>
                    <p className="text-zinc-400">Choose your break duration.</p>
                    <div className="flex gap-4">
                        <button onClick={() => handleSelectBreak(5)} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">5 min</button>
                        <button onClick={() => handleSelectBreak(10)} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">10 min</button>
                        <button onClick={() => handleSelectBreak(15)} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">15 min</button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-8">
                    <h2 className="text-2xl font-bold text-zinc-300 tracking-wider uppercase">
                        {mode === 'focus' ? 'Focus Mode' : 'Break Time'}
                    </h2>
                    <div className="relative w-64 h-64 flex items-center justify-center">
                        <svg className="w-full h-full" viewBox="0 0 256 256">
                            <circle className="text-zinc-800" strokeWidth="12" stroke="currentColor" fill="transparent" r={radius} cx="128" cy="128" />
                            <circle 
                                className="text-blue-500"
                                strokeWidth="12"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r={radius}
                                cx="128"
                                cy="128"
                                style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                                transform="rotate(-90 128 128)"
                            />
                        </svg>
                        <div className="absolute text-5xl font-mono tracking-tighter">
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={handleReset} className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
                            Reset
                        </button>
                        <button onClick={handleStartPause} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
                            {isRunning ? 'Pause' : 'Start'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimerView;