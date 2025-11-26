
import type { User } from '../types';

// Mock user database
const MOCK_USER: User = {
    id: '1',
    name: 'Robert Smith',
    email: 'robert.wilson@msl.com',
};
const MOCK_PASSWORD = 'password123';

const USER_STORAGE_KEY = 'planify_user';

export const login = async (email: string, password: string): Promise<User | null> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (email.toLowerCase() === MOCK_USER.email && password === MOCK_PASSWORD) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(MOCK_USER));
        return MOCK_USER;
    }
    return null;
};

export const loginWithGoogle = async (credential: string): Promise<User> => {
    // Decode JWT token
    const payload = JSON.parse(atob(credential.split('.')[1]));
    
    const user: User = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
};

export const logout = (): void => {
    localStorage.removeItem(USER_STORAGE_KEY);
};

export const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    if (!userJson) {
        return null;
    }
    try {
        return JSON.parse(userJson) as User;
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        return null;
    }
};