import React, { useState } from 'react';
import { findResources } from '../services/geminiService';
import type { ResourceResult } from '../types';
import { GlobeIcon } from './icons';

const ResourcesView: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ResourceResult | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) {
            setError("Please enter a search query.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);

        const response = await findResources(query);
        if (response) {
            setResult(response);
        } else {
            setError("Sorry, something went wrong while fetching resources. Please try again.");
        }
        setIsLoading(false);
    };

    return (
        <>
            <header className="flex justify-between items-center text-zinc-300">
                <div className="w-6 h-6"></div>
                <div className="font-bold text-sm">Find Resources</div>
                <GlobeIcon />
            </header>

            <div className="bg-zinc-800 p-4 rounded-xl w-full">
                <h2 className="font-bold text-lg mb-3 text-white">Syllabus Finder</h2>
                <p className="text-sm text-zinc-400 mb-4">Enter a subject to find syllabus resources, like "NCERT Physics class 12 syllabus".</p>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for a syllabus..."
                        className="flex-grow bg-zinc-700 border border-zinc-600 rounded-lg p-2.5 text-sm text-white placeholder-zinc-400 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed">
                        {isLoading ? '...' : 'Find'}
                    </button>
                </form>
            </div>

            {isLoading && (
                <div className="text-center p-8 text-zinc-400">
                    <div className="animate-pulse">Searching the web for you...</div>
                </div>
            )}
            
            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-xl text-sm">{error}</div>}

            {result && (
                 <div className="space-y-4 w-full">
                    <div className="bg-zinc-800 p-4 rounded-xl">
                        <h3 className="font-bold text-lg mb-3 text-white">Summary</h3>
                        <p className="whitespace-pre-wrap text-zinc-200 text-sm leading-relaxed">{result.summary}</p>
                    </div>

                    {result.sources && result.sources.length > 0 && (
                        <div className="bg-zinc-800 p-4 rounded-xl">
                            <h3 className="font-bold text-lg mb-3 text-white">Sources</h3>
                            <ul className="space-y-3">
                                {result.sources.map((source, index) => (
                                    <li key={index}>
                                        <a 
                                            href={source.web.uri} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="block p-3 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors"
                                        >
                                            <p className="font-semibold text-blue-400 text-sm truncate">{source.web.title}</p>
                                            <p className="text-xs text-zinc-400 truncate">{source.web.uri}</p>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default ResourcesView;
