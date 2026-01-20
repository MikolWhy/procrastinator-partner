// ====================================
// Timer Types
// ====================================
// Centralized type definitions for the timer features

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerState {
    // Time remaining in milliseconds
    remainingMs: number;
    
    // Current status of the timer
    status: TimerStatus;

    // Original duration when timer started (ms) - needed for progress calculations
    initialMs: number;
    
}

// Timer configuration - user preferences
// Seperate from state since it doesn't change during runtime

export interface FormattedTime {
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;

    /**
     * Pre-formatted display string for the timer
     * Under 1 hour: "MM:SS"
     * 1 hour or over: "HH:MM:SS"
     */
    display: string;
}

export interface TimerConfig {
    // Whether to show milliseconds in the display, off by default.
    showMilliseconds: boolean;

    // play sound when timer completes
    playSound: boolean;

    //default duration in milliseconds
    defaultDurationMs: number;
}

// 25 minutes in milliseconds - classic pomodoro duration
export const DEFAULT_DURATION_MS = 25 * 60 * 1000;

// minimum timer duration is 1 second
export const MIN_DURATION_MS = 1000;

// maximum timer duration is 48 hours
export const MAX_DURATION_MS = 48 * 60 * 60 * 1000;

