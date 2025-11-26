
import React, { useState, useEffect } from 'react';
import StudyPlanner from './components/StudyPlanner';
import LoginView from './components/LoginView';
import { getCurrentUser, logout } from './services/authService';
import type { User } from './types';

function App() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const user = getCurrentUser();
        setCurrentUser(user);
        setIsLoading(false);
    }, []);

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
    };
    
    const handleLogout = () => {
        logout();
        setCurrentUser(null);
    };

    if (isLoading) {
        return <div className="bg-zinc-900 min-h-screen"></div>;
    }

    return (
        <div className="font-sans">
            {currentUser ? (
                <StudyPlanner user={currentUser} onLogout={handleLogout} />
            ) : (
                <LoginView onLoginSuccess={handleLoginSuccess} />
            )}
        </div>
    );
}

export default App;
