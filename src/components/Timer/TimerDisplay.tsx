// ============================================
// TimerDisplay Component
// ============================================
// Renders the countdown timer with click interactions:
// - Single click: toggle start/pause
// - Triple click: reset timer
//
// Design decisions:
// - Large, bold numbers for visibility
// - Monospace font so numbers don't shift as they change
// - Cursor changes to pointer to indicate clickability
// - Visual feedback for different states (running, paused, completed)

import { useRef, useCallback } from 'react';
import { type TimerStatus, type FormattedTime } from '../../types/timer';

//Types
interface TimerDisplayProps {
    //formatted time object from useTimer
    time: FormattedTime;
    
    //current timer status
    status: TimerStatus;

    //show milliseconds (default: false)
    showMilliseconds?: boolean;

    //milliseconds display from useTimer
    millisecondsDisplay?: string;

    //called when user single-clicks for toggle (pause, resume)
    onToggle: () => void;

    //called when user triple-clicks for reset
    onReset: () => void;

    //called when user edit's time
    onEdit?: () => void;

}   

//Component
export function TimerDisplay ({
    time,
    status,
    showMilliseconds = false,
    millisecondsDisplay = '.000',
    onToggle,
    onReset,
    onEdit,
    
}: TimerDisplayProps){

    //triple-click detection

    //track click timestamps to detect triple-clicks using UseRef
    // because we don't need re-renders when this is changed
    // '<number[]> tells TS this ref will hold an arr of nums
    // ([]) is intial value passed to useRef, empty array to start
    const clickTimestamps = useRef<number[]>([])

    //time window for a triple-click (ms)
    const TRIPLE_CLICK_WINDOW = 500;

    const handleClick = useCallback(() => {
        const now = Date.now();
        
        //add current click timestamp
        clickTimestamps.current.push(now)

        //keeps only clicks within the time window
        clickTimestamps.current = clickTimestamps.current.filter(
            timestamp => now - timestamp < TRIPLE_CLICK_WINDOW
        );

        //check for triple click
        if (clickTimestamps.current.length >= 3){
            //triple click detected - reset timer
            clickTimestamps.current = []; //clear timestamps to read for fresh triple-clicks

            onReset();
        }
        else{
            //single click or double click - toggle start/pause
            //use setTimeout to allow triple click to be detected
            // if a third click comes, toggle won't fire
            setTimeout(() => {
                //only toggle if we don't reach triple click
                if (clickTimestamps.current.length > 0 && clickTimestamps.current.length < 3){
                    onToggle();
                    clickTimestamps.current = []; //clear timestamps after actions
                }
            }, TRIPLE_CLICK_WINDOW)
        }
    }, [onToggle, onReset])

    //styling based on status

    //dynamics classes based on timer  status
    const getStatusClasses = (): string => {
        switch (status){
            case 'running':
                //subtle pulse animation when timer is running
                return 'text-slate-900';
            case 'paused':
                //dimmed when paused
                return 'text-slate-500';
            case 'completed':
                //highlight when complete
                return 'text-green-600';
            default: //idle
                return 'text-slate-800';
        }
    };

    //render
    return (
        // select-none prevents text selection on click
        <div className = "flex flex-col items-center select-none" >
            {/*Timer Display - clickable*/}
            <button
                onClick={handleClick}
                className={`
                    font-mono font-bold tracking-tight
                    text-7xl sm:text-8xl md:text-9xl
                    cursor-pointer
                    transition-colors duration-200
                  hover:text-slate-600
                    focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-4 rounded-lg
                    ${getStatusClasses()}
                `}
                
                //using button for accessibility - keyboard users can tab to it and press enter. Screen readers etc
                // if running show pause, if False, show start
                aria-label={`Timer: ${time.display}. Click to ${status === 'running' ? 'pause' : 'start'}. Triple-click to reset.`}
                >
                    {/**Main time display */}
                    <span>{time.display}</span>

                    {/*Milliseconds - only display if enabled*/}
                    {showMilliseconds && (
                        <span className="text-3xl sm:text-4xl md:text-5xl text-slate-400">
                            {millisecondsDisplay}
                        </span>
                    )}
            </button>

            {/* Status hint text */}
    <p className="mt-4 text-sm text-slate-400">
        {status === 'idle' && 'Click to start'}
        {status === 'running' && 'Click to pause'}
        {status === 'paused' && 'Click to resume'}
        {status === 'completed' && 'Timer complete! Click to restart'}
      </p>

        </div>
    )

}

