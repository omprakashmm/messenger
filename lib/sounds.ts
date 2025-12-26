/**
 * Sound and Haptic Feedback Utility
 * Provides audio feedback and haptic vibrations for user interactions
 */

class SoundManager {
    private sounds: Map<string, HTMLAudioElement> = new Map();
    private enabled: boolean = true;

    constructor() {
        // Only initialize in browser
        if (typeof window === 'undefined') return;

        // Initialize sounds
        this.loadSounds();

        // Check user preference
        const savedPreference = localStorage.getItem('soundEnabled');
        if (savedPreference !== null) {
            this.enabled = savedPreference === 'true';
        }
    }

    private loadSounds() {
        if (typeof window === 'undefined') return;

        // Create audio elements for different sounds
        const soundFiles = {
            typing: this.createTypingSound(),
            sent: this.createSentSound(),
            received: this.createReceivedSound(),
            notification: this.createNotificationSound(),
        };

        Object.entries(soundFiles).forEach(([name, audio]) => {
            if (audio) this.sounds.set(name, audio);
        });
    }

    private createTypingSound(): HTMLAudioElement | null {
        if (typeof window === 'undefined') return null;
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77eeeTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2Yk2CBlou+3nnk0QDFC';
        audio.volume = 0.3;
        return audio;
    }

    private createSentSound(): HTMLAudioElement | null {
        if (typeof window === 'undefined') return null;
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77eeeTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2Yk2CBlou+3nnk0QDFC';
        audio.volume = 0.4;
        return audio;
    }

    private createReceivedSound(): HTMLAudioElement | null {
        if (typeof window === 'undefined') return null;
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77eeeTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2Yk2CBlou+3nnk0QDFC';
        audio.volume = 0.5;
        return audio;
    }

    private createNotificationSound(): HTMLAudioElement | null {
        if (typeof window === 'undefined') return null;
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77eeeTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2Yk2CBlou+3nnk0QDFC';
        audio.volume = 0.6;
        return audio;
    }

    play(soundName: string) {
        if (!this.enabled || typeof window === 'undefined') return;

        const sound = this.sounds.get(soundName);
        if (sound) {
            const clone = sound.cloneNode() as HTMLAudioElement;
            clone.volume = sound.volume;
            clone.play().catch(err => console.warn('Sound play failed:', err));
        }
    }

    playTyping() {
        this.play('typing');
    }

    playSent() {
        this.play('sent');
    }

    playReceived() {
        this.play('received');
    }

    playNotification() {
        this.play('notification');
    }

    setEnabled(enabled: boolean) {
        if (typeof window === 'undefined') return;
        this.enabled = enabled;
        localStorage.setItem('soundEnabled', enabled.toString());
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}

class HapticManager {
    private enabled: boolean = true;

    constructor() {
        if (typeof window === 'undefined') return;

        if (!('vibrate' in navigator)) {
            this.enabled = false;
            return;
        }

        const savedPreference = localStorage.getItem('hapticEnabled');
        if (savedPreference !== null) {
            this.enabled = savedPreference === 'true';
        }
    }

    vibrate(pattern: number | number[]) {
        if (!this.enabled || typeof window === 'undefined' || !('vibrate' in navigator)) return;

        try {
            navigator.vibrate(pattern);
        } catch (error) {
            console.warn('Vibration failed:', error);
        }
    }

    light() {
        this.vibrate(10);
    }

    medium() {
        this.vibrate(20);
    }

    heavy() {
        this.vibrate(30);
    }

    success() {
        this.vibrate([10, 50, 10]);
    }

    error() {
        this.vibrate([50, 100, 50]);
    }

    typing() {
        this.vibrate(5);
    }

    messageSent() {
        this.vibrate([10, 20]);
    }

    messageReceived() {
        this.vibrate([20, 10, 20]);
    }

    setEnabled(enabled: boolean) {
        if (typeof window === 'undefined') return;
        this.enabled = enabled;
        localStorage.setItem('hapticEnabled', enabled.toString());
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}

// Lazy singleton instances
let soundManagerInstance: SoundManager | null = null;
let hapticManagerInstance: HapticManager | null = null;

function getSoundManager(): SoundManager {
    if (!soundManagerInstance) {
        soundManagerInstance = new SoundManager();
    }
    return soundManagerInstance;
}

function getHapticManager(): HapticManager {
    if (!hapticManagerInstance) {
        hapticManagerInstance = new HapticManager();
    }
    return hapticManagerInstance;
}

export const soundManager = typeof window !== 'undefined' ? getSoundManager() : ({
    playTyping: () => { },
    playSent: () => { },
    playReceived: () => { },
    playNotification: () => { },
    setEnabled: () => { },
    isEnabled: () => false,
} as any);

export const hapticManager = typeof window !== 'undefined' ? getHapticManager() : ({
    light: () => { },
    medium: () => { },
    heavy: () => { },
    success: () => { },
    error: () => { },
    typing: () => { },
    messageSent: () => { },
    messageReceived: () => { },
    setEnabled: () => { },
    isEnabled: () => false,
} as any);

// Convenience functions
export const playTypingSound = () => {
    if (typeof window === 'undefined') return;
    getSoundManager().playTyping();
    getHapticManager().typing();
};

export const playMessageSent = () => {
    if (typeof window === 'undefined') return;
    getSoundManager().playSent();
    getHapticManager().messageSent();
};

export const playMessageReceived = () => {
    if (typeof window === 'undefined') return;
    getSoundManager().playReceived();
    getHapticManager().messageReceived();
};

export const playNotification = () => {
    if (typeof window === 'undefined') return;
    getSoundManager().playNotification();
    getHapticManager().messageReceived();
};

export const toggleSound = (enabled: boolean) => {
    if (typeof window === 'undefined') return;
    getSoundManager().setEnabled(enabled);
};

export const toggleHaptic = (enabled: boolean) => {
    if (typeof window === 'undefined') return;
    getHapticManager().setEnabled(enabled);
};

export const isSoundEnabled = () => typeof window !== 'undefined' ? getSoundManager().isEnabled() : false;
export const isHapticEnabled = () => typeof window !== 'undefined' ? getHapticManager().isEnabled() : false;
