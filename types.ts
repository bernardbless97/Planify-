
export interface Subtask {
  id: number;
  text: string;
  completed: boolean;
}

export interface StudyTask {
  id: number;
  status: 'pending' | 'completed';
  day: string;
  timeSlot: string;
  subject: string;
  topic: string;
  task: string;
  description: string;
  progress: number;
  subtasks: Subtask[];
  completedAt?: string;
  imageUrl?: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  createdAt: string;
  deadline: string;
  tasks: StudyTask[];
}

export interface GroundingChunk {
    web: {
        uri: string;
        title: string;
    }
}

export interface ResourceResult {
    summary: string;
    sources: GroundingChunk[];
}

export interface ProfileStats {
    pendingTasks: number;
    overdueTasks: number;
    completedLast7Days: number;
    streak: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    picture?: string;
}

export interface AppNotification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}