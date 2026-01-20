// ============================================
// App.tsx - Main Application
// ============================================
// Wires together the timer components and manages app-level state.
// 
// Current features (Iteration 1):
// - Countdown timer with click-to-toggle
// - Triple-click to reset
// - Task input field
// - Light mode (dark mode prep in place via Tailwind)

import { useState, useCallback} from 'react';
import { useTimer } from './hooks/useTimer'
import { TimerDisplay } from './components/Timer/TimerDisplay' 
import { TaskInput } from './components/Timer/TaskInput';

function App(){
    //State

    //Current task
    const [task, setTask] = useState('');

    //Timer hook - all timer logic is encapsulated here
    const timer = useTimer({
        onComplete: () => {
            //play completion sound
            playCompletionSound();
        }
    })

    const playCompletionSound = useCallback (() => {
        //create a simple beep using Web audio API
        //will add a proper sound file later
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
    
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800; // Hz - pleasant tone
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error){
            console.log('Could not play sound: ', error);
        }
    
    }, [])
    
  // ----------------------------------------
  // Render
  // ----------------------------------------
  
  return (
    // Main container - light mode with min height full screen
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* App container - centered content */}
      <div className="w-full max-w-2xl flex flex-col items-center gap-12">
        
        {/* Header / Branding */}
        <header className="text-center">
          <h1 className="text-2xl font-semibold text-slate-700 tracking-tight">
            Procrastinator Partner
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Visualize your time. Beat procrastination.
          </p>
        </header>
        
        {/* Task Input */}
        <TaskInput 
          value={task} 
          onChange={setTask}
        />
        
        {/* Timer Display */}
        <TimerDisplay
          time={timer.time}
          status={timer.status}
          showMilliseconds={false} // Will be toggleable in settings
          millisecondsDisplay={timer.millisecondsDisplay}
          onToggle={timer.toggle}
          onReset={timer.reset}
        />
        
        {/* Progress indicator - simple for now */}
        <div className="w-full max-w-md">
          <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-slate-400 transition-all duration-100 ease-linear"
              style={{ width: `${timer.progress * 100}%` }}
            />
          </div>
        </div>
        
        {/* Footer hint */}
        <footer className="text-xs text-slate-300">
          Triple-click timer to reset
        </footer>
        
      </div>
    </div>
  );

}

export default App;

