import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS } from 'chart.js/auto'

interface Transaction {
  id: string
  amount: number
  timestamp: number
  riskScore: number
}

export const TransactionDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    // Simulate incoming transactions
    const interval = setInterval(() => {
      const newTx: Transaction = {
        id: Math.random().toString(36).substring(7),
        amount: Math.random() * 1000000,
        timestamp: Date.now(),
        riskScore: Math.random()
      }
      setTransactions(prev => [...prev, newTx].slice(-20))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const chartData = {
    labels: transactions.map(tx => new Date(tx.timestamp).toLocaleTimeString()),
    datasets: [{
      label: 'Transaction Amount (sats)',
      data: transactions.map(tx => tx.amount),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl mb-4">Transaction Flow</h2>
        <Line data={chartData} />
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl mb-4">Recent Transactions</h2>
        <div className="space-y-2">
          {transactions.map(tx => (
            <div key={tx.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
              <span>{tx.id}</span>
              <span>{tx.amount.toFixed(0)} sats</span>
              <span className={tx.riskScore > 0.7 ? 'text-red-400' : 'text-green-400'}>
                Risk: {(tx.riskScore * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
