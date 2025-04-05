import React, { useState } from 'react'
import './App.css'
import { TransactionDashboard } from './components/TransactionDashboard'
import { WalletStatus } from './components/WalletStatus'

const App: React.FC = () => {
  const [connected, setConnected] = useState(false)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold">Lightning Sentinel</h1>
        <WalletStatus connected={connected} onConnect={() => setConnected(true)} />
      </header>
      <main className="container mx-auto p-4">
        <TransactionDashboard />
      </main>
    </div>
  )
}

export default App
