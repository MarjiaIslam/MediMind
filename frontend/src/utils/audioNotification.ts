/**
 * Audio Notification Service
 * Provides sound alerts for medicine reminders with customizable ringtones
 */

// Sound types available for medicine reminders
export type SoundType = 'default' | 'gentle' | 'bell' | 'melody' | 'urgent' | 'none';

// Get user's preferred notification sound from localStorage
export const getUserNotificationSound = (): SoundType => {
    try {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            return (userData.notificationSound as SoundType) || 'default';
        }
    } catch (e) {
        console.error('Error getting user notification sound:', e);
    }
    return 'default';
};

/**
 * Play a specific ringtone type
 * @param soundType - Type of sound to play
 */
export const playRingtone = async (soundType: SoundType = 'default'): Promise<void> => {
    if (soundType === 'none') return;
    
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        switch (soundType) {
            case 'gentle':
                await playGentleChime(audioContext);
                break;
            case 'bell':
                await playBellSound(audioContext);
                break;
            case 'melody':
                await playSoftMelody(audioContext);
                break;
            case 'urgent':
                await playUrgentSound(audioContext);
                break;
            default:
                await playDefaultSound(audioContext);
        }
    } catch (error) {
        console.error('Error playing ringtone:', error);
    }
};

// Default sound - two pleasant beeps
const playDefaultSound = async (ctx: AudioContext): Promise<void> => {
    const playBeep = (startTime: number, freq: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        osc.start(startTime);
        osc.stop(startTime + 0.3);
    };
    playBeep(ctx.currentTime, 800);
    playBeep(ctx.currentTime + 0.35, 1000);
};

// Gentle chime - soft ascending tones
const playGentleChime = async (ctx: AudioContext): Promise<void> => {
    const notes = [523, 659, 784]; // C5, E5, G5
    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        const startTime = ctx.currentTime + i * 0.2;
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
        osc.start(startTime);
        osc.stop(startTime + 0.4);
    });
};

// Bell sound - rich harmonic bell tone
const playBellSound = async (ctx: AudioContext): Promise<void> => {
    const frequencies = [440, 880, 1320, 1760]; // Harmonics
    const gains = [0.4, 0.2, 0.1, 0.05];
    
    frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(gains[i], ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.5);
    });
};

// Soft melody - pleasant musical phrase
const playSoftMelody = async (ctx: AudioContext): Promise<void> => {
    const notes = [
        { freq: 523, time: 0 },     // C5
        { freq: 587, time: 0.15 },  // D5
        { freq: 659, time: 0.3 },   // E5
        { freq: 784, time: 0.45 },  // G5
        { freq: 659, time: 0.6 },   // E5
    ];
    
    notes.forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'triangle';
        const startTime = ctx.currentTime + time;
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
        osc.start(startTime);
        osc.stop(startTime + 0.2);
    });
};

// Urgent sound - attention-grabbing double beep
const playUrgentSound = async (ctx: AudioContext): Promise<void> => {
    for (let i = 0; i < 2; i++) {
        const startTime = ctx.currentTime + i * 0.3;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 900;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
        osc.start(startTime);
        osc.stop(startTime + 0.15);
    }
};

/**
 * Play a sound alert for medicine reminder using user's preferred sound
 * @param type - Type of alert: 'reminder' | 'success'
 */
export const playMedicineAlert = async (type: 'reminder' | 'success' = 'reminder'): Promise<void> => {
    const userSound = getUserNotificationSound();
    
    if (userSound === 'none') return;
    
    if (type === 'success') {
        // Always use gentle chime for success
        await playRingtone('gentle');
    } else {
        // Use user's preferred sound for reminders
        await playRingtone(userSound);
    }
};

/**
 * Play a double beep alert (more noticeable)
 * Used for urgent reminders - respects user's sound preference
 */
export const playUrgentAlert = async (): Promise<void> => {
    const userSound = getUserNotificationSound();
    
    if (userSound === 'none') return;
    
    // Play user's preferred sound, but repeat it for urgency
    await playRingtone(userSound);
    
    // Play a second time after a short delay for urgency
    setTimeout(() => {
        playRingtone(userSound);
    }, 800);
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
