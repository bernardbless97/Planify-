import type { StudyTask } from '../types';

let scheduledNotificationTimeouts: number[] = [];

/**
 * Checks if Notification API is supported and requests permission if it hasn't been granted or denied.
 */
export const requestPermission = () => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
};

/**
 * Sends an immediate browser notification.
 * @param title - The title of the notification.
 * @param body - The body text of the notification.
 */
export const sendNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
    }
};

/**
 * Schedules notifications for each task in a study plan.
 * @param schedule - A map where keys are date strings and values are arrays of study tasks.
 */
export const scheduleNotificationsForPlan = (schedule: Map<string, StudyTask[]>) => {
    const now = new Date();

    schedule.forEach((tasks, dateKey) => {
        tasks.forEach(task => {
            const [year, month, day] = dateKey.split('-').map(Number);
            const timeString = task.timeSlot.split('-')[0].trim();
            
            let hours = 0;
            let minutes = 0;

            if (timeString.includes('AM') || timeString.includes('PM')) {
                const [time, modifier] = timeString.split(' ');
                [hours, minutes] = time.split(':').map(Number);
                if (modifier && modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
                if (modifier && modifier.toUpperCase() === 'AM' && hours === 12) hours = 0; // Handle 12 AM (midnight)
            } else if (timeString.includes(':')) {
                [hours, minutes] = timeString.split(':').map(Number);
            }

            const notificationDate = new Date(year, month - 1, day, hours, minutes);

            if (notificationDate > now) {
                const delay = notificationDate.getTime() - now.getTime();
                const timeoutId = setTimeout(() => {
                    sendNotification(
                        `Time for ${task.subject}!`,
                        `Let's start: ${task.topic}`
                    );
                }, delay);
                scheduledNotificationTimeouts.push(timeoutId as unknown as number);
            }
        });
    });
};

/**
 * Clears all pending notifications that were scheduled with setTimeout.
 */
export const clearAllScheduledNotifications = () => {
    scheduledNotificationTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    scheduledNotificationTimeouts = [];
};
