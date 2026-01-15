import { useState } from 'react'
import './App.css'
import { Button } from './components/ui/button'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <h1 className="text-4xl font-bold text-white"> Tailwind works </h1>
      <Button variant="default">Start Timer</Button>
      <Button variant="outline">Stop Timer</Button>
      <Button variant="destructive">Reset</Button>

    </div>
  )
}

export default App
