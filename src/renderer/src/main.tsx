import ReactDOM from 'react-dom/client'
import './assets/index.css'
import App from './App'

declare global {
  interface Window {
    api: object
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)
