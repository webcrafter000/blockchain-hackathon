import React, { useState, useEffect, useCallback } from 'react'
import { WalletService, WalletInfo } from '../services/WalletService'

interface WalletStatusProps {
  onConnectionChange: (connected: boolean) => void
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
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl mb-1">Wallet Status</h2>
          {walletInfo ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Address:</span>
                <code className="text-sm bg-gray-700 px-2 py-1 rounded">
                  {walletInfo.address}
                </code>
                <span className="text-xs bg-yellow-600 text-black px-2 py-0.5 rounded-full">
                  {walletInfo.network}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                Balance: {walletInfo.balance.toLocaleString()} sats
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              {isConnecting ? 'Connecting...' : 'Not connected'}
            </p>
          )}
          {error && (
            <div className="mt-2 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        <button
          onClick={walletInfo ? handleDisconnect : handleConnect}
          disabled={isConnecting}
          className={`px-4 py-2 rounded-lg transition-colors ${
            walletInfo
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isConnecting ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Connecting...
            </div>
          ) : walletInfo ? (
            'Disconnect'
          ) : (
            'Connect Wallet'
          )}
        </button>
      </div>
    </div>
  )
}
