import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {StoreProvider} from '@/app/providers/store/StoreProvider'
import {QueryProvider} from '@/app/providers/query/QueryProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <QueryProvider>
        <App />
      </QueryProvider>
    </StoreProvider>
  </StrictMode>,
)
