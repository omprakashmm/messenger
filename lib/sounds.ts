/**
 * Sound and Haptic Feedback Utility
 * Provides audio feedback and haptic vibrations for user interactions
 */

class SoundManager {
    private sounds: Map<string, HTMLAudioElement> = new Map();
    private enabled: boolean = true;

    constructor() {
        // Initialize sounds
        this.loadSounds();

        // Check user preference
        const savedPreference = localStorage.getItem('soundEnabled');
        if (savedPreference !== null) {
            this.enabled = savedPreference === 'true';
        }
    }

    private loadSounds() {
        // Create audio elements for different sounds
        const soundFiles = {
            typing: this.createTypingSound(),
            sent: this.createSentSound(),
            received: this.createReceivedSound(),
            notification: this.createNotificationSound(),
        };

        Object.entries(soundFiles).forEach(([name, audio]) => {
            this.sounds.set(name, audio);
        });
    }

    private createTypingSound(): HTMLAudioElement {
        // Create a subtle typing sound using Web Audio API
        const audio = new Audio();
        // You can replace this with actual sound files
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77eeeTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2Yk2CBlou+3nnk0QDFC';
        audio.volume = 0.3;
        return audio;
    }

    private createSentSound(): HTMLAudioElement {
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77eeeTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2Yk2CBlou+3nnk0QDFC';
        audio.volume = 0.4;
        return audio;
    }

    private createReceivedSound(): HTMLAudioElement {
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77eeeTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2Yk2CBlou+3nnk0QDFC';
        audio.volume = 0.5;
        return audio;
    }

    private createNotificationSound(): HTMLAudioElement {
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77eeeTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2Yk2CBlou+3nnk0QDFC';
        audio.volume = 0.6;
        return audio;
    }

    play(soundName: string) {
        if (!this.enabled) return;

        const sound = this.sounds.get(soundName);
        if (sound) {
            // Clone and play to allow overlapping sounds
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
        // Check if device supports vibration
        if (!('vibrate' in navigator)) {
            this.enabled = false;
            return;
        }

        // Check user preference
        const savedPreference = localStorage.getItem('hapticEnabled');
        if (savedPreference !== null) {
            this.enabled = savedPreference === 'true';
        }
    }

    vibrate(pattern: number | number[]) {
        if (!this.enabled || !('vibrate' in navigator)) return;

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
        this.enabled = enabled;
        localStorage.setItem('hapticEnabled', enabled.toString());
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}

// Singleton instances
export const soundManager = new SoundManager();
export const hapticManager = new HapticManager();

// Convenience functions
export const playTypingSound = () => {
    soundManager.playTyping();
    hapticManager.typing();
};

export const playMessageSent = () => {
    soundManager.playSent();
    hapticManager.messageSent();
};

export const playMessageReceived = () => {
    soundManager.playReceived();
    hapticManager.messageReceived();
};

export const playNotification = () => {
    soundManager.playNotification();
    hapticManager.messageReceived();
};

export const toggleSound = (enabled: boolean) => {
    soundManager.setEnabled(enabled);
};

export const toggleHaptic = (enabled: boolean) => {
    hapticManager.setEnabled(enabled);
};

export const isSoundEnabled = () => soundManager.isEnabled();
export const isHapticEnabled = () => hapticManager.isEnabled();
