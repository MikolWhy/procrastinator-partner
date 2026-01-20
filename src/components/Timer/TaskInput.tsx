// ============================================
// TaskInput Component
// ============================================
// A minimal, subtle input for entering what you're working on.
// 
// Design:
// - Appears as a thin horizontal line when empty
// - Expands subtly when focused or has content
// - Translucent when empty, solid when has text
// - Centered text for clean look
import { useState } from 'react';

//Types

interface TaskinputProps {
    //current task value or name
    value: string,

    // called when value is changed or updated
    onChange: (value: string) => void;

    //placeholder text
    placeholder?: string;
}

//component

export function TaskInput({
    value,
    onChange,
    placeholder = "What are you working on?",

}: TaskinputProps){
    //track focus state for styling
    const [isFocused, setIsFocused] = useState(false);

    //determine if input has content
    const hasContent = value.trim().length > 0;

    return (
    <div className="w-full max-w-md mx-auto">
      <input
        type="text" // string prop
        value={value} //JavaScript Expression
        onChange={(e) => onChange(e.target.value)} 
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)} 
        placeholder={placeholder} //variable interpolation
        //template literal expresssion
        className={` 
          w-full
          bg-transparent
          text-center
          text-lg
          border-0 border-b
          outline-none
          transition-all duration-300
          py-2
          
          /* Placeholder styling */
          placeholder:text-slate-300
          placeholder:text-sm
          
          /* Border color based on state */
          ${hasContent 
            ? 'border-slate-400 text-slate-700' 
            : isFocused 
              ? 'border-slate-300' 
              : 'border-slate-200/50'
          }
          
          /* Focus state */
          focus:border-slate-400
        `}
        // Accessibility
        aria-label="Task description"
      />
    </div>
    );

}