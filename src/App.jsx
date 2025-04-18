import { useLayoutEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return <canvas id="canvas" style={{backgroundColor: 'blue'}} width={window.innerWidth} height={window.innerHeight}>Canvas</canvas>
}

export default App
