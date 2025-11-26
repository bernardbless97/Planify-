import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { SparklesIcon, UserIcon, PaperAirplaneIcon, XMarkIcon } from './icons';
import type { ChatMessage } from '../types';

interface AssistantViewProps {
    onClose: () => void;
}

const AssistantView: React.FC<AssistantViewProps> = ({ onClose }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initChat = () => {
             const ai = new GoogleGenAI({ apiKey: 'AIzaSyCCF5ekSZWRK6dq63lhF7aMIsPSmL_cK-Y' });
             const newChat = ai.chats.create({
                 model: 'gemini-2.5-flash',
                 config: {
                    systemInstruction: "You are Planify AI, a friendly and knowledgeable assistant for students. Your goal is to provide clear, concise, and helpful answers to their questions on any academic topic. Be encouraging and supportive.",
                 },
             });
             setChat(newChat);
             setMessages([{ role: 'model', text: "Hello! I'm your Planify AI Assistant. How can I help you with your studies today?" }]);
        };
        initChat();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chat) return;

        const userMessage: ChatMessage = { role: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await chat.sendMessageStream({ message: userMessage.text });
            
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of result) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = modelResponse;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-zinc-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-800 rounded-2xl w-full max-w-sm h-[90vh] flex flex-col text-white border border-zinc-700">
                <header className="flex justify-between items-center text-zinc-300 p-4 border-b border-zinc-700 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <SparklesIcon />
                        <div className="font-bold text-sm">AI Assistant</div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-700 transition-colors">
                        <XMarkIcon />
                    </button>
                </header>

                <div className="flex-grow overflow-y-auto space-y-6 p-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                                    <SparklesIcon />
                                </div>
                            )}
                            <div className={`max-w-xs p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-zinc-700 text-zinc-200 rounded-bl-none'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                             {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                                    <UserIcon />
                                </div>
                            )}
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                                <SparklesIcon />
                            </div>
                            <div className="max-w-xs p-3 rounded-2xl bg-zinc-700 text-zinc-200 rounded-bl-none">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 bg-zinc-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-zinc-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-zinc-500 rounded-full animate-pulse"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-4 flex items-center gap-2 border-t border-zinc-700 flex-shrink-0">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about a topic..."
                        className="flex-grow bg-zinc-700 border border-zinc-600 rounded-full py-2.5 px-4 text-sm text-white placeholder-zinc-500 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-full transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed flex items-center justify-center">
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AssistantView;