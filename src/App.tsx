import React, { useState } from 'react'
import './App.css'
import { TransactionDashboard } from './components/TransactionDashboard'
import { WalletStatus } from './components/WalletStatus'
import { AlertBanner } from './components/AlertBanner'

const App: React.FC = () => {
  const [connected, setConnected] = useState(false)
  const [llmEnabled, setLlmEnabled] = useState(false)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">⚡ Lightning Sentinel</h1>
            <p className="text-gray-400 text-sm">Decentralized AI-Powered Network Monitor</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={llmEnabled}
                onChange={(e) => setLlmEnabled(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-500"
              />
              Enable LLM Analysis
            </label>
            <WalletStatus connected={connected} onConnect={() => setConnected(true)} />
          </div>
        </div>
      </header>
      <AlertBanner />
      <main className="container mx-auto p-4">
        <TransactionDashboard connected={connected} llmEnabled={llmEnabled} />
      </main>
    </div>
  )
}

export default App
