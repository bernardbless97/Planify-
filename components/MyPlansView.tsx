import React from 'react';
import type { StudyPlan } from '../types';
import { DocumentTextIcon } from './icons';

interface MyPlansViewProps {
    plans: StudyPlan[];
    onSelectPlan: (planId: string) => void;
    activePlanId: string | null;
}

const MyPlansView: React.FC<MyPlansViewProps> = ({ plans, onSelectPlan, activePlanId }) => {
    return (
        <>
            <header className="flex justify-between items-center text-zinc-300">
                <div className="w-6 h-6"></div>
                <div className="font-bold text-sm">My Saved Plans</div>
                <DocumentTextIcon />
            </header>

            <div className="w-full space-y-4">
                {plans.length > 0 ? (
                    plans.map(plan => (
                        <button
                            key={plan.id}
                            onClick={() => onSelectPlan(plan.id)}
                            className={`w-full text-left bg-zinc-800 p-4 rounded-xl border-2 transition-colors ${plan.id === activePlanId ? 'border-blue-500' : 'border-transparent hover:border-zinc-600'}`}
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg text-white truncate">{plan.title}</h3>
                                {plan.id === activePlanId && (
                                     <span className="text-xs font-bold bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">Active</span>
                                )}
                            </div>
                            <div className="text-xs text-zinc-400 mt-2 flex gap-4">
                                <span>
                                    Created: {new Date(plan.createdAt).toLocaleDateString()}
                                </span>
                                <span>
                                    Tasks: {plan.tasks.length}
                                </span>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="text-center text-zinc-500 p-10">
                        <p>You haven't created any study plans yet.</p>
                        <p className="mt-2 text-sm">Go to the "Planner" tab to generate your first one!</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default MyPlansView;
