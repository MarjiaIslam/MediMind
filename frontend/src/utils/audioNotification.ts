/**
 * Audio Notification Service
 * Provides sound alerts for medicine reminders
 */

// Create a simple beep sound using Web Audio API as fallback
const createBeepSound = (): AudioBuffer => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const duration = 1; // 1 second
    const frequency = 800; // Hz
    const audioBuffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = audioBuffer.getChannelData(0);
    
    // Create sine wave
    for (let i = 0; i < sampleRate * duration; i++) {
        data[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate) * 0.3; // 30% volume
    }
    
    return audioBuffer;
};

/**
 * Play a sound alert for medicine reminder
 * @param type - Type of alert: 'reminder' | 'success'
 */
export const playMedicineAlert = async (type: 'reminder' | 'success' = 'reminder'): Promise<void> => {
    try {
        // Try using a simple beep from Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const frequency = type === 'success' ? 1000 : 800; // Higher pitch for success
        const duration = type === 'success' ? 0.3 : 0.5; // Shorter for success
        const volume = 0.3;
        
        // Create oscillator for the beep
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.error('Error playing audio alert:', error);
        // Fallback: Use system notification sound if available
        fallbackNotificationSound();
    }
};

/**
 * Play a double beep alert (more noticeable)
 * Used for urgent reminders
 */
export const playUrgentAlert = async (): Promise<void> => {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const frequency = 900;
        const beepDuration = 0.2;
        const pauseDuration = 0.1;
        const volume = 0.4;
        
        // First beep
        let oscillator = audioContext.createOscillator();
        let gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + beepDuration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + beepDuration);
        
        // Second beep
        const startTime = audioContext.currentTime + beepDuration + pauseDuration;
        oscillator = audioContext.createOscillator();
        gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(volume, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + beepDuration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + beepDuration);
    } catch (error) {
        console.error('Error playing urgent alert:', error);
        fallbackNotificationSound();
    }
};

/**
 * Fallback notification using browser's native notification
 */
const fallbackNotificationSound = (): void => {
    // Some browsers support the notification sound
    if ('Notification' in window) {
        try {
            // Create a silent notification as fallback
            new Notification('Medicine Reminder', {
                tag: 'medicine-alert',
                requireInteraction: true
            });
        } catch (error) {
            console.error('Notification error:', error);
        }
    }
};

/**
 * Request permission for notifications (call once on app load)
 */
export const requestNotificationPermission = (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
        console.warn('Notifications not supported in this browser');
        return Promise.resolve('denied');
    }
    
    if (Notification.permission === 'granted') {
        return Promise.resolve('granted');
    }
    
    if (Notification.permission !== 'denied') {
        return Notification.requestPermission();
    }
    
    return Promise.resolve('denied');
};

/**
 * Send a notification with optional sound
 */
export const sendMedicineNotification = (
    title: string,
    options?: NotificationOptions & { playSound?: boolean }
): void => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        console.warn('Notifications not permitted');
        return;
    }
    
    try {
        const { playSound = true, ...notificationOptions } = options || {};
        
        new Notification(title, {
            icon: '/favicon.ico',
            tag: 'medicine-reminder',
            requireInteraction: true,
            ...notificationOptions
        });
        
        // Play sound if requested
        if (playSound) {
            playMedicineAlert('reminder');
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

/**
 * Send success notification with alert sound
 */
export const sendSuccessNotification = (message: string): void => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        console.warn('Notifications not permitted');
        return;
    }
    
    try {
        new Notification('✓ Success', {
            body: message,
            icon: '/favicon.ico',
            tag: 'medicine-success'
        });
        
        playMedicineAlert('success');
    } catch (error) {
        console.error('Error sending success notification:', error);
    }
};
