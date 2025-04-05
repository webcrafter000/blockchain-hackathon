import React, { useState, useMemo, useCallback } from 'react'
import './App.css'
import { WalletStatus } from './components/WalletStatus'
import { TransactionDashboard } from './components/TransactionDashboard'
import { WalletService } from './services/WalletService'

function App() {
  const [connected, setConnected] = useState(false)
  const [llmEnabled, setLlmEnabled] = useState(false)
  const walletService = useMemo(() => new WalletService(), [])

  const handleTestPayment = useCallback(async () => {
    try {
      await walletService.makePayment(1000, 'Test payment')
    } catch (error) {
      console.error('Payment failed:', error)
    }
  }, [walletService])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white p-6 md:p-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl glassmorphic flex items-center justify-center">
            <span className="text-2xl">⚡</span>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
            Lightning Sentinel
          </h1>
        </div>
        <p className="text-blue-200/80 font-medium">AI-Powered Lightning Network Monitor</p>
      </header>

      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <WalletStatus 
            onConnectionChange={setConnected}
            walletService={walletService}
          />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={llmEnabled}
                onChange={e => setLlmEnabled(e.target.checked)}
                disabled={!connected}
              />
              <div className={`w-11 h-6 glassmorphic peer-focus:outline-none rounded-full peer 
                peer-checked:after:translate-x-full after:content-[''] 
                after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full 
                after:h-5 after:w-5 after:transition-all ${
                  connected 
                    ? 'peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-400' 
                    : 'opacity-50 cursor-not-allowed'
                }`}>
              </div>
              <span className="ml-3 text-sm font-medium text-blue-200">
                AI Analysis {!connected && '(Connect Wallet)'}
              </span>
            </label>

            {connected && (
              <button
                onClick={handleTestPayment}
                className="px-6 py-2.5 rounded-xl gradient-button glow-hover font-medium text-white flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Test Payment
              </button>
            )}
          </div>
        </div>

        <TransactionDashboard 
          connected={connected} 
          llmEnabled={llmEnabled} 
          walletService={walletService}
        />

        <div className="mt-8 text-center text-sm text-blue-200/60">
          <div className="inline-block glassmorphic px-4 py-2 rounded-lg">
            <p className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Simulated testnet environment
            </p>
            <p className="text-xs mt-1">No real Bitcoin transactions unless connected to Alby</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
