import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
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
  Legend,
  Filler,
  ArcElement
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

const truncateAddress = (address: string) => {
  if (!address) return ''
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export const TransactionDashboard: React.FC<TransactionDashboardProps> = ({ 
  connected,
  llmEnabled,
  walletService
}) => {
  const [transactions, setTransactions] = useState<TransactionWithAnalysis[]>([])
  const [balance, setBalance] = useState<number>(0)
  const analyzer = useMemo(() => new TransactionAnalyzer(), [])

  const handleTransaction = useCallback(async (tx: Transaction) => {
    const analysis = await analyzer.analyzeTransaction({
      txid: tx.txid,
      from: tx.from,
      to: tx.to,
      amount: tx.amount,
      timestamp: tx.timestamp,
      frequency: 1, // Simplified for now
      isFlagged: false
    })

    const txWithAnalysis: TransactionWithAnalysis = {
      ...tx,
      analysis: analysis.explanation,
      riskScore: analysis.riskScore / 100
    }

    setTransactions(prev => {
      const newTxs = [txWithAnalysis, ...prev] // Add new transactions at the start
      return newTxs.slice(0, 20) // Keep only last 20 transactions
    })
  }, [analyzer])

  const handleBalance = useCallback((newBalance: number) => {
    setBalance(newBalance)
  }, [])

  useEffect(() => {
    if (!connected) {
      setTransactions([])
      setBalance(0)
      return
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
  }, [connected, walletService, handleTransaction, handleBalance])

  const chartData = useMemo(() => ({
    labels: transactions.map(tx => new Date(tx.timestamp).toLocaleTimeString()),
    datasets: [{
      label: 'Transaction Amount (sats)',
      data: transactions.map(tx => Math.abs(tx.amount)),
      fill: true,
      borderColor: 'rgba(59, 130, 246, 0.8)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  }), [transactions])

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(17, 25, 40, 0.8)',
        borderColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 1,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.8)'
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        },
        ticks: {
          color: 'rgba(148, 163, 184, 0.8)'
        }
      }
    }
  }), [])

  if (!connected) {
    return (
      <div className="glassmorphic rounded-2xl p-6 text-center">
        <p className="text-blue-200/60">Connect your wallet to view transactions</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="glassmorphic rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
          Transaction Flow
        </h3>
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="glassmorphic rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
          Recent Transactions
        </h3>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-center text-blue-200/60 py-4">No transactions yet</p>
          ) : (
            transactions.map(tx => (
              <div key={tx.txid} className="glassmorphic p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'incoming' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {tx.type === 'incoming' ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className={`font-semibold ${
                          tx.type === 'incoming' ? 'text-green-400' : 'text-blue-400'
                        }`}>
                          {tx.type === 'incoming' ? '+' : '-'}{Math.abs(tx.amount).toLocaleString()} sats
                        </span>
                        <span className="text-sm text-blue-200/60">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm text-blue-200/80">
                        {tx.type === 'incoming' ? 'From: ' : 'To: '}
                        <span className="font-mono">{truncateAddress(tx.type === 'incoming' ? tx.from : tx.to)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {tx.riskScore !== undefined && (
                    <div className="w-12 h-12">
                      <Doughnut
                        data={{
                          datasets: [{
                            data: [tx.riskScore * 100, (1 - tx.riskScore) * 100],
                            backgroundColor: [
                              `rgba(239, 68, 68, ${0.2 + tx.riskScore * 0.8})`,
                              'rgba(34, 197, 94, 0.2)'
                            ],
                            borderWidth: 0
                          }]
                        }}
                        options={{
                          responsive: true,
                          cutout: '70%',
                          plugins: {
                            tooltip: {
                              enabled: true,
                              callbacks: {
                                label: (context) => {
                                  const value = context.raw as number
                                  return context.dataIndex === 0 
                                    ? `Risk: ${value.toFixed(1)}%`
                                    : `Safe: ${value.toFixed(1)}%`
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
                {tx.memo && (
                  <div className="text-sm text-blue-200/60 pl-10">
                    Memo: {tx.memo}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
