// ============================================
// Navigation Types
// ============================================
// Type definitions for the floating nav bar.
// Keeps nav state structured and type-safe.

/**
 * Main category in the middle section
 * Currently only "time"but structured for future categories.
 */
export type NavCategory = 'time';

/**
 * Sub-modes within the "time" category (left section)
 * - pomodoro: Standard countdown timer with presets
 * - deadline: Countdown to a specific deadline (future)
 * - life: Life timer / existential motivation (future)
 * - Maybe add a straight up regular timer later? or does pomodoro cover it?
 */
export type TimerMode = 'pomodoro' | 'deadline' | 'life'

/**
 * preset duration options in minutes for quick selection buttons
 * Maybe add longer options later?
 * as const; ensures the array is readonly and is unmodifiable and no accidental modifications at compile time.
 */
export const PRESET_DURATIONS_MINUTES = [5, 15, 25, 45, 60] as const;

/**
 * Type for preset values
 */
export type TimePresetMinutes = typeof PRESET_DURATIONS_MINUTES[number];

/**
 * Navigation state for the floating navigation bar - what's selected
 */
export interface NavState {
    // current active category (middle section)
    category: NavCategory;

    //currently active timer mode (left section)
    timerMode: TimerMode;

    //custom duration in ms (null if not set yet)
    customDurationMs: number | null;
}

/**
 * Initial/default navigation states
 */
export const DEFAULT_NAV_STATE: NavState = {
    category: 'time',
    timerMode: 'pomodoro',
    customDurationMs: null,
}

/**
 * Helper Functions
 */

/**
 * Converts milliseconds to a display string for the custom preset button.
 * Format: "H:MM" (no seconds)
 * If >= 1000 hours, returns "wow.."
 * Math.floor() rounds down to nearest integer
 * 60,000 ms = 1 minute. divide ms by 60,000 to get minutes.
 * display format is no seconds ONLY H:MM
 */
export function formatCustomPresetDisplay(ms: number): string {
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    //cap at 1000 hours for display
    if (hours >= 1000) {
        return 'wow..';
    }

    //format "H:MM" or just MM if less than 1 hour
    if (hours > 0){
        return `${hours}:${minutes.toString().padStart(2,'0')}`;
    }

    //under 1 hour just minutes (MM)
    return `${minutes}m`;
}

//maximum allowed duration is 1000 hours in milliseconds
// 1000 hours * 60 min/hour * 60 sec/min * 1000 ms/sec
export const MAX_DURATION_MS = 1000 * 60 * 60 * 1000;




