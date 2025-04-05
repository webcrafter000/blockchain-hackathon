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
        isFlagged: false
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
      borderColor: '#60a5fa',
      backgroundColor: 'rgba(96, 165, 250, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#60a5fa',
      pointBorderColor: '#fff',
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#94a3b8'
        }
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        },
        ticks: {
          color: '#94a3b8'
        }
      }
    }
  }

  if (!connected) {
    return (
      <div className="glassmorphic rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl glassmorphic flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
            Connect Your Lightning Wallet
          </h3>
          <p className="text-blue-200/60">
            Connect your wallet to begin monitoring real-time transactions
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="glassmorphic rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
              Transaction Flow
            </h2>
            <p className="text-sm text-blue-200/60">Real-time transaction monitoring</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-200/60">Current Balance</div>
            <div className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-300">
              {balance.toLocaleString()} sats
            </div>
          </div>
        </div>
        <div className="h-[300px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
      
      <div className="glassmorphic rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
          Recent Transactions
        </h2>
        <div className="space-y-3">
          {transactions.map(tx => (
            <div key={tx.txid} className="glassmorphic rounded-xl p-4 glow-hover">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-200/80 font-mono">{tx.txid}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      tx.type === 'incoming' 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/20' 
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/20'
                    }`}>
                      {tx.type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      tx.status === 'complete'
                        ? 'bg-green-500/20 text-green-300 border border-green-500/20'
                        : tx.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/20'
                        : 'bg-red-500/20 text-red-300 border border-red-500/20'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm bg-gray-800/50 rounded-lg px-2 py-1 flex items-center gap-1">
                      <span className={tx.type === 'incoming' ? 'text-green-400' : 'text-blue-400'}>
                        {tx.type === 'incoming' ? '←' : '→'}
                      </span>
                      <span className="font-mono text-blue-200/80">
                        {tx.type === 'incoming' ? tx.from : tx.to}
                      </span>
                    </div>
                  </div>
                  {tx.memo && (
                    <div className="text-sm text-blue-200/60 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {tx.memo}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${
                    tx.type === 'incoming' 
                      ? 'bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-300' 
                      : 'bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-300'
                  }`}>
                    {tx.type === 'incoming' ? '+' : '-'}{tx.amount.toLocaleString()} sats
                  </div>
                  {tx.riskScore !== undefined && (
                    <div className={`text-sm font-medium ${
                      tx.riskScore > 0.7 
                        ? 'text-red-400' 
                        : tx.riskScore > 0.4 
                        ? 'text-yellow-400' 
                        : 'text-green-400'
                    }`}>
                      Risk: {(tx.riskScore * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
              {llmEnabled && tx.analysis && (
                <div className="mt-3 pt-3 border-t border-blue-200/10">
                  <div className="text-sm text-blue-200/80 flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {tx.analysis}
                  </div>
                </div>
              )}
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-8 text-blue-200/60">
              No transactions yet. They'll appear here in real-time.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
