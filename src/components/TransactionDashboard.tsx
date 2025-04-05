import React, { useEffect, useState, useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { TransactionAnalyzer } from '../services/TransactionAnalyzer'
import { Transaction, WalletService } from '../services/WalletService'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface TransactionWithAnalysis extends Transaction {
  analysis?: string
  riskScore?: number
}

interface TransactionDashboardProps {
  connected: boolean
  llmEnabled: boolean
  walletService: WalletService
}

export const TransactionDashboard: React.FC<TransactionDashboardProps> = ({ 
  connected,
  llmEnabled,
  walletService
}) => {
  const [transactions, setTransactions] = useState<TransactionWithAnalysis[]>([])
  const [balance, setBalance] = useState<number>(0)
  const analyzer = useMemo(() => new TransactionAnalyzer(), [])

  useEffect(() => {
    if (!connected) {
      setTransactions([])
      return
    }

    const handleTransaction = async (tx: Transaction) => {
      const analysis = await analyzer.analyzeTransaction({
        txid: tx.txid,
        from: tx.from,
        to: tx.to,
        amount: tx.amount,
        timestamp: tx.timestamp,
        frequency: transactions.filter(t => 
          t.timestamp > Date.now() - 3600000 && 
          (t.from === tx.from || t.to === tx.to)
        ).length,
        isFlagged: false // You could implement address flagging here
      })

      const txWithAnalysis: TransactionWithAnalysis = {
        ...tx,
        analysis: analysis.explanation,
        riskScore: analysis.riskScore / 100
      }

      setTransactions(prev => [...prev, txWithAnalysis].slice(-20))
    }

    const handleBalance = (newBalance: number) => {
      setBalance(newBalance)
    }

    walletService.on('transaction', handleTransaction)
    walletService.on('balance', handleBalance)

    // Set initial balance
    const info = walletService.getWalletInfo()
    if (info) {
      setBalance(info.balance)
    }

    return () => {
      walletService.off('transaction', handleTransaction)
      walletService.off('balance', handleBalance)
    }
  }, [connected, analyzer, transactions, walletService])

  const chartData = {
    labels: transactions.map(tx => new Date(tx.timestamp).toLocaleTimeString()),
    datasets: [{
      label: 'Transaction Amount (sats)',
      data: transactions.map(tx => tx.amount),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
      fill: false
    }]
  }

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Amount (sats)'
        }
      }
    }
  }

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] bg-gray-800 rounded-lg">
        <div className="text-gray-400 text-center p-8">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <h3 className="text-xl font-semibold mb-2">Connect Your Lightning Wallet</h3>
          <p>Connect your wallet to begin monitoring real-time transactions</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl">Transaction Flow</h2>
          <div className="text-right">
            <div className="text-sm text-gray-400">Current Balance</div>
            <div className="text-xl font-semibold">{balance.toLocaleString()} sats</div>
          </div>
        </div>
        <div className="h-[300px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl mb-4">Recent Transactions</h2>
        <div className="space-y-2">
          {transactions.map(tx => (
            <div key={tx.txid} className="flex flex-col gap-2 p-3 bg-gray-700 rounded">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">{tx.txid}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      tx.type === 'incoming' 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-blue-900 text-blue-300'
                    }`}>
                      {tx.type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      tx.status === 'complete'
                        ? 'bg-green-900 text-green-300'
                        : tx.status === 'pending'
                        ? 'bg-yellow-900 text-yellow-300'
                        : 'bg-red-900 text-red-300'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                  <div className="text-xs bg-gray-600 rounded px-2 py-1 flex items-center gap-1">
                    <span className={tx.type === 'incoming' ? 'text-green-400' : 'text-blue-400'}>
                      {tx.type === 'incoming' ? '←' : '→'}
                    </span>
                    {tx.type === 'incoming' ? tx.from : tx.to}
                  </div>
                  {tx.memo && (
                    <div className="text-xs text-gray-400 mt-1">
                      📝 {tx.memo}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${
                    tx.type === 'incoming' ? 'text-green-400' : 'text-blue-400'
                  }`}>
                    {tx.type === 'incoming' ? '+' : '-'}{tx.amount.toLocaleString()} sats
                  </div>
                  {tx.riskScore !== undefined && (
                    <div className={`text-sm ${
                      tx.riskScore > 0.7 ? 'text-red-400' : 
                      tx.riskScore > 0.4 ? 'text-yellow-400' : 
                      'text-green-400'
                    }`}>
                      Risk: {(tx.riskScore * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
              {llmEnabled && tx.analysis && (
                <div className="text-sm text-gray-400 border-t border-gray-600 pt-2">
                  🤖 {tx.analysis}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
