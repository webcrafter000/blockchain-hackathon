import React from 'react'
import { WalletService } from '../services/WalletService'

const truncateAddress = (address: string) => {
  if (!address) return ''
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

interface WalletStatusProps {
  onConnect: () => Promise<void>
  onDisconnect: () => Promise<void>
  onSendPayment: () => Promise<void>
  walletService: WalletService
  llmEnabled: boolean
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1 hover:bg-blue-500/20 rounded-md transition-colors"
      title={copied ? 'Copied!' : 'Copy address'}
    >
      {copied ? (
        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m3 3l3 3" />
        </svg>
      )}
    </button>
  )
}

export const WalletStatus: React.FC<WalletStatusProps> = ({
  onConnect,
  onDisconnect,
  onSendPayment,
  walletService,
  llmEnabled
}) => {
  const isConnected = walletService.isConnected()
  const isSimulationRunning = walletService.isSimulationRunning
  const walletInfo = walletService.getWalletInfo()

  const handleSendPayment = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    if (isSimulationRunning) {
      alert('Transaction simulation already running. Disconnect to restart.')
      return
    }

    await onSendPayment()
  }

  return (
    <div className="glassmorphic rounded-2xl p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-blue-200">Wallet Status</h3>
            <p className={`mt-1 text-sm ${
              isConnected ? 'text-green-400' : 'text-red-400'
            }`}>
              {isConnected ? 'Connected' : 'Not connected'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {!isConnected ? (
              <button
                onClick={onConnect}
                className="px-4 py-2 rounded-lg gradient-button glow-hover font-medium"
              >
                Connect Wallet
              </button>
            ) : (
              <button
                onClick={onDisconnect}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 font-medium transition-all"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        {isConnected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-blue-200">Simulate Tx</h3>
                <p className="mt-1 text-sm text-blue-200/60">
                  Simulated testnet environment
                </p>
              </div>
              <button
                onClick={handleSendPayment}
                disabled={isSimulationRunning}
                className={`px-6 py-2.5 rounded-xl gradient-button glow-hover font-medium text-white flex items-center gap-2 transition-all ${
                  isSimulationRunning ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Simulate Tx
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-blue-200/80">Address:</span>
                <div className="flex items-center gap-1">
                  <code className="text-sm glassmorphic px-2 py-1 rounded-lg font-mono" title={walletInfo.address}>
                    {truncateAddress(walletInfo.address)}
                  </code>
                  <CopyButton text={walletInfo.address} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-blue-200/80">Balance:</span>
                <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-300">
                  {walletInfo.balance.toLocaleString()} sats
                </span>
              </div>
              {walletInfo.alias && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-200/80">Node:</span>
                  <span className="text-sm text-blue-200 truncate max-w-[200px]" title={walletInfo.alias}>
                    {walletInfo.alias}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
