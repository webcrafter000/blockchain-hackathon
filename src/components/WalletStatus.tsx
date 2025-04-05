import React, { useState, useEffect, useCallback } from 'react'
import { WalletService, WalletInfo } from '../services/WalletService'

interface WalletStatusProps {
  onConnectionChange: (connected: boolean) => void
}

const truncateAddress = (address: string) => {
  if (!address) return ''
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export const WalletStatus: React.FC<WalletStatusProps> = ({ onConnectionChange }) => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [walletService] = useState(() => new WalletService())

  useEffect(() => {
    const handleDisconnect = () => {
      setWalletInfo(null)
      onConnectionChange(false)
      setError('Wallet connection lost. Please reconnect.')
    }

    walletService.on('disconnected', handleDisconnect)
    return () => {
      walletService.off('disconnected', handleDisconnect)
    }
  }, [walletService, onConnectionChange])

  const handleConnect = useCallback(async () => {
    setIsConnecting(true)
    setError(null)

    try {
      const info = await walletService.connect()
      setWalletInfo(info)
      onConnectionChange(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
      onConnectionChange(false)
    } finally {
      setIsConnecting(false)
    }
  }, [walletService, onConnectionChange])

  const handleDisconnect = useCallback(async () => {
    try {
      await walletService.disconnect()
      setWalletInfo(null)
      onConnectionChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect wallet')
    }
  }, [walletService, onConnectionChange])

  return (
    <div className="glassmorphic rounded-2xl p-6 w-full md:max-w-md">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
              Wallet Status
            </h2>
            {walletInfo ? (
              <div className="space-y-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-blue-200/80">Address:</span>
                    <code className="text-sm glassmorphic px-2 py-1 rounded-lg font-mono" title={walletInfo.address}>
                      {truncateAddress(walletInfo.address)}
                    </code>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/20">
                      {walletInfo.network}
                    </span>
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
            ) : (
              <p className="text-sm text-blue-200/60">
                {isConnecting ? 'Connecting...' : 'Not connected'}
              </p>
            )}
            {error && (
              <div className="mt-2 text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}
          </div>
          
          <button
            onClick={walletInfo ? handleDisconnect : handleConnect}
            disabled={isConnecting}
            className={`shrink-0 px-4 py-2 rounded-xl font-medium transition-all ${
              isConnecting
                ? 'opacity-50 cursor-not-allowed'
                : walletInfo
                ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                : 'gradient-button glow-hover text-white'
            }`}
          >
            {isConnecting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Connecting
              </span>
            ) : walletInfo ? (
              'Disconnect'
            ) : (
              'Connect Wallet'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
