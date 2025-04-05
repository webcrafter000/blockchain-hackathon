import React, { useState } from 'react'
import './App.css'
import { WalletStatus } from './components/WalletStatus'
import { TransactionDashboard } from './components/TransactionDashboard'

function App() {
  const [connected, setConnected] = useState(false)
  const [llmEnabled, setLlmEnabled] = useState(false)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">⚡ Lightning Sentinel</h1>
        <p className="text-gray-400">AI-Powered Lightning Network Monitor</p>
      </header>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <WalletStatus onConnectionChange={setConnected} />
          
          <div className="flex items-center gap-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={llmEnabled}
                onChange={e => setLlmEnabled(e.target.checked)}
                disabled={!connected}
              />
              <div className={`w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer 
                peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] 
                after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full 
                after:h-5 after:w-5 after:transition-all ${connected ? 'peer-checked:bg-green-600' : 'opacity-50 cursor-not-allowed'}`}>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-300">
                AI Analysis {!connected && '(Connect Wallet)'}
              </span>
            </label>
          </div>
        </div>

        <TransactionDashboard connected={connected} llmEnabled={llmEnabled} />

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>⚠️ This is a simulated testnet environment for demonstration purposes.</p>
          <p>No real Bitcoin transactions are being processed.</p>
        </div>
      </div>
    </div>
  )
}

export default App
