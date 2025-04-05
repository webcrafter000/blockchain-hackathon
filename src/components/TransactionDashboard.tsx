import React, { useEffect, useState } from 'react'
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

interface Transaction {
  id: string
  amount: number
  timestamp: number
  riskScore: number
  analysis?: string
}

interface TransactionDashboardProps {
  connected: boolean
  llmEnabled: boolean
}

const SAMPLE_ANALYSES = [
  "This transaction follows a pattern common in privacy-preserving mixers.",
  "Multiple small transfers suggest possible fee optimization or batching.",
  "High-value transfer with unusual timing indicates potential OTC trade.",
  "Circular transaction pattern typical of Lightning Network routing nodes."
]

export const TransactionDashboard: React.FC<TransactionDashboardProps> = ({ 
  connected,
  llmEnabled
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (!connected) {
      setTransactions([])
      return
    }

    // Simulate incoming transactions
    const interval = setInterval(() => {
      const newTx: Transaction = {
        id: Math.random().toString(36).substring(7),
        amount: Math.random() * 1000000,
        timestamp: Date.now(),
        riskScore: Math.random(),
        analysis: SAMPLE_ANALYSES[Math.floor(Math.random() * SAMPLE_ANALYSES.length)]
      }
      setTransactions(prev => [...prev, newTx].slice(-20))
    }, 2000)

    return () => clearInterval(interval)
  }, [connected])

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
        <h2 className="text-xl mb-4">Transaction Flow</h2>
        <div className="h-[300px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl mb-4">Recent Transactions</h2>
        <div className="space-y-2">
          {transactions.map(tx => (
            <div key={tx.id} className="flex flex-col gap-2 p-3 bg-gray-700 rounded">
              <div className="flex justify-between items-center">
                <span>{tx.id}</span>
                <span>{tx.amount.toFixed(0)} sats</span>
                <span className={tx.riskScore > 0.7 ? 'text-red-400' : 'text-green-400'}>
                  Risk: {(tx.riskScore * 100).toFixed(0)}%
                </span>
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
