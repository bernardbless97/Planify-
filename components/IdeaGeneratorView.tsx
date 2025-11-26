
import React, { useState } from 'react';
import { XMarkIcon, LightBulbIcon } from './icons';
import { generateLearningIdea } from '../services/geminiService';

interface IdeaGeneratorViewProps {
    onClose: () => void;
}

const IdeaGeneratorView: React.FC<IdeaGeneratorViewProps> = ({ onClose }) => {
    const [subject, setSubject] = useState('');
    const [topic, setTopic] = useState('');
    const [idea, setIdea] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !topic) {
            setError("Please fill in both subject and topic.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setIdea(null);

        const result = await generateLearningIdea(subject, topic);

        if (result) {
            setIdea(result);
        } else {
            setError("Failed to generate a learning idea. Please try again.");
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-zinc-900/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-800 rounded-2xl w-full max-w-sm p-6 relative text-white border border-zinc-700">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
                    <XMarkIcon />
                </button>
                
                <div className="flex items-center gap-3 text-zinc-300 mb-4">
                    <LightBulbIcon />
                    <h2 className="text-xl font-bold text-white">New Learning Idea</h2>
                </div>

                {!idea && !isLoading && (
                    <form onSubmit={handleGenerate} className="space-y-4">
                        <div>
                            <label htmlFor="idea-subject" className="text-sm font-medium text-zinc-300 block mb-2">Subject</label>
                            <input
                                id="idea-subject"
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g., Physics"
                                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg p-2 text-sm text-white placeholder-zinc-400 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="idea-topic" className="text-sm font-medium text-zinc-300 block mb-2">Topic</label>
                            <textarea
                                id="idea-topic"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., Newton's Laws of Motion"
                                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg p-2 text-sm text-white placeholder-zinc-400 focus:ring-blue-500 focus:border-blue-500"
                                rows={3}
                            />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed">
                            {isLoading ? 'Generating...' : 'Generate Idea'}
                        </button>
                        {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
                    </form>
                )}

                {isLoading && (
                    <div className="text-center py-8">
                        <div className="animate-pulse">Brewing a fresh idea for you...</div>
                    </div>
                )}
                
                {idea && (
                    <div className="space-y-4">
                        <div className="bg-zinc-700/50 p-4 rounded-lg max-h-64 overflow-y-auto">
                           <p className="whitespace-pre-wrap text-zinc-200 text-sm leading-relaxed">{idea}</p>
                        </div>
                         <button onClick={() => { setIdea(null); setSubject(''); setTopic(''); setError(null); }} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            Generate Another
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IdeaGeneratorView;
