import { useState, useEffect } from 'react'
import { WalletService } from './services/WalletService'
import { WalletStatus } from './components/WalletStatus'
import { TransactionDashboard } from './components/TransactionDashboard'
import './App.css'

function App() {
  const [connected, setConnected] = useState(false)
  const [llmEnabled, setLlmEnabled] = useState(false)
  const [walletService] = useState(() => new WalletService())

  useEffect(() => {
    const handleConnected = () => {
      setConnected(true)
    }

    const handleDisconnected = () => {
      setConnected(false)
    }

    walletService.on('connected', handleConnected)
    walletService.on('disconnected', handleDisconnected)

    // Initialize with current state
    setConnected(walletService.isConnected())
    setLlmEnabled(walletService.isAiAnalysisEnabled)

    return () => {
      walletService.off('connected', handleConnected)
      walletService.off('disconnected', handleDisconnected)
    }
  }, [walletService])

  const handleConnect = async () => {
    try {
      await walletService.connect()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      alert('Failed to connect wallet. Please try again.')
    }
  }

  const handleDisconnect = async () => {
    await walletService.disconnect()
  }

  const handleSendPayment = async () => {
    try {
      await walletService.makePayment(100000, 'Test Payment')
    } catch (error) {
      console.error('Failed to send payment:', error)
      alert('Failed to send payment. Please try again.')
    }
  }

  const handleToggleLlm = () => {
    walletService.setAiAnalysisEnabled(!llmEnabled)
    setLlmEnabled(walletService.isAiAnalysisEnabled)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4">
          <div className="glassmorphic rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
                ⚡ Lightning Sentinel
              </h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleToggleLlm}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    llmEnabled 
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-blue-500/10 text-blue-200/60 hover:bg-blue-500/20'
                  }`}
                >
                  AI Analysis {llmEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
            <p className="text-blue-200/80 mb-8">
              AI-Powered Lightning Network Monitor
            </p>
          </div>

          <div className="space-y-4">
            <WalletStatus
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onSendPayment={handleSendPayment}
              walletService={walletService}
            />

            <TransactionDashboard
              connected={connected}
              walletService={walletService}
            />
          </div>
        </div>

        <footer className="mt-8 text-center text-blue-200/60">
          <div className="inline-block glassmorphic px-4 py-2 rounded-lg">
            <p className="text-xs">
              2025 Lightning Sentinel | Built with ❤️ by Nag |{' '}
              <a 
                href="https://github.com/webcrafter000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-200 transition-colors"
              >
                GitHub
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
