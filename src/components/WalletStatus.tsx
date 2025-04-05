interface WalletStatusProps {
  connected: boolean
  onConnect: () => void
}

export function WalletStatus({ connected, onConnect }: WalletStatusProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
      <span>{connected ? 'Connected to Lightning Network' : 'Disconnected'}</span>
      {!connected && (
        <button 
          onClick={onConnect}
          className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
        >
          Connect Wallet
        </button>
      )}
    </div>
  )
}
