// ====================================
// useTimer hook
// ====================================
// Custom react hook that encapsulates the timer logic and state management
// Components only need to call thi shook and use returned values/functions

import { useState, useCallback, useRef, useEffect } from 'react';
import {
    type TimerState,
    type TimerStatus,
    type FormattedTime,
    DEFAULT_DURATION_MS,
    MIN_DURATION_MS,
} from '../types/timer';

function formatTime(ms: number): FormattedTime {

    // Ensure we don't have negative milliseconds time
    const safeMs = Math.max(0, ms);

    // Calculate each unit of time for the timer display
    // Math.floor() rounds down - we want whole numbers
    const hours = Math.floor(safeMs / (1000 * 60 * 60));
    const minutes = Math.floor((safeMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((safeMs % (1000 * 60)) / 1000);
    const milliseconds = safeMs % 1000;
    
    // Build the display string - flexible format based on duration
    // padStart() ensures 2 digits for each unit eg: 5 -> 05, and MAX 2 digits (not showing milliseconds error)
    let display: string;
    if (hours > 0) {
        display = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } 
    else {
        display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    return {
        hours, minutes, seconds, milliseconds, display };
    }

// Formats milliseconds portion for a display
// Returns ".000" format string
function formatMilliseconds(ms: number): string {
    return `.${ms.toString().padStart(3, '0')}`;
}

interface UseTimerOptions {
    // initial duration in ms (default: 25 minutes)
    initialDuration?: number;

    // callback when timer completes
    onComplete?: () => void;
}

interface UseTimerReturn {
    // Current time remaining, formatted for display
    time: FormattedTime;

    // Raw milliseconds remaining for progress calculations
    remainingMs: number;

    // current timer status
    status: TimerStatus;

    //progress as a decimal 0-1 
    progress: number;

    // formatted milliseconds for display
    millisecondsDisplay: string;

    // User Actions
    // Start or resume the timer
    start: () => void;
    pause: () => void;
    toggle: () => void;
    reset: () => void;
    //set new duration (resets timer)
    setDuration: (ms: number) => void;
}

export function useTimer(options: UseTimerOptions = {}): UseTimerReturn {
  const {
    initialDuration = DEFAULT_DURATION_MS,
    onComplete,
  } = options; 
  
  // ----------------------------------------
  // State Management
  // ----------------------------------------
  const[state, setState] = useState<TimerState>({
    remainingMs: initialDuration,
    status: 'idle',
    initialMs: initialDuration
  })

  // ----------------------------------------
   // References ( values that persist across renders but do NOT trigger re-renders like useState)
  // ----------------------------------------
  
  //Store interval ID so we can clear it when needed. Intialized to null. Intervals are for repeating actions like updating the timer display every millisecond.
  const intervalRef = useRef<number | null>(null); 

  //Store the time stamp when timer started/resumed. Intialized to 0
  // Used for accurate time calculations to avoid drift (Accumulated timing errors from repeated small delays)
  const startTimeRef = useRef<number>(0)

  // store the remaining time when we started (for calculations)
  const remainingAtStartRef = useRef<number>(0)


  // Store onComplete in a ref so we always have the latest version
  // This prevents state closure issues in interval callbacks (When a function captures an old value from an earlier render)
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]); //runs and re-renders when onComplete changes

// ----------------------------------------
// Core Timer Logic
// ----------------------------------------

// Stops the running interval
// Called when pausing, resetting, or timer completes
// setInterval() = "start repeating this" - built-in javascript function that repeats a function after a specified delay
// clearInterval() = "stop that repeating thing" - built-in javascript function that stops a repeating function
// useCallback() = "memoize this function" - built-in react hook that memoizes a function and returns a memoized version of the function. 
// So it won't recreate the function on every render, basically keeps a copy of the function in memory so it doesn't need to be recreated on every render.
// memoziation is caching a result of a function to reuse instead of recalculating it on every render.
const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }
}, [])

// start or resume the timer
const start = useCallback (() => {
    //don't start if already running or completed
    if (state.status === 'running') return;
    if (state.remainingMs <= 0 ) return;
    
    // record when we're starting and how much time is remaining (default start time)
    startTimeRef.current = Date.now();
    remainingAtStartRef.current = state.remainingMs;

    //update status
    setState(prev => ({ ...prev, status: 'running'}));

    // Start interval - updates every 16ms (~60fps for smooth display)
    // Using Date.now() difference instead of decrementing avoids drift
    intervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const newRemaining = Math.max(0, remainingAtStartRef.current - elapsed);

        setState(prev => {
            // Timer completed
            if (newRemaining <= 0) {
              stopInterval();
              onCompleteRef.current?.();
              return { ...prev, remainingMs: 0, status: 'completed' };
            }
            return { ...prev, remainingMs: newRemaining };
          });
        }, 16); // updates every 16ms roughly equivalent to 60fps standard
      }, [state.status, state.remainingMs, stopInterval]);

// Pause Timer
const pause = useCallback(() => {
  if (state.status !== 'running') return;
  
  stopInterval();
  // take old state,"...prev" copies all props from prev state into new obj
  // override the status prop in the new object to update
  setState(prev => ({
    ...prev, status: 'paused'
  }));

}, [state.status, stopInterval])

//reset timer to intial duration, called in toggle if state.status === complete
const reset = useCallback(() => {
  stopInterval();
  setState(prev => ({
    ...prev,
    remainingMs: prev.initialMs,
    status: 'idle',
  }))

}, [stopInterval])

//toggle between start and pause on clicks
const toggle = useCallback (() => {
  if (state.status === 'running'){
    pause();
  }
  else if (state.status === 'idle' || state.status === 'paused'){
    start();
  }
  else if (state.status === 'completed'){
    //if complete, reset timer
      reset();
    }
    //start will be called next render via effect or if user clicks again
  }, [state.status, start, pause])


// set a new timer duration (also resets timer)
const setDuration = useCallback((ms: number) => {
  //enforce a minimum duration
  const safeDuration = Math.max(MIN_DURATION_MS, ms);

  stopInterval();
  setState({
    remainingMs: safeDuration,
    status: 'idle',
    initialMs: safeDuration,
  })

}, [stopInterval])

//clean up on unmount
const time = formatTime(state.remainingMs);
const progress = state.initialMs > 0 ? (state.initialMs - state.remainingMs) / state.initialMs
: 0;
const millisecondsDisplay = formatMilliseconds(time.milliseconds);

//return public API
return {
  time, 
  remainingMs: state.remainingMs,
  status: state.status,
  progress, 
  millisecondsDisplay,
  start,
  pause,
  toggle,
  reset,
  setDuration

};

}