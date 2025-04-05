import React, { useState, useEffect } from 'react'

interface Alert {
  id: string
  message: string
  type: 'warning' | 'danger' | 'info'
  timestamp: number
}

const SAMPLE_ALERTS: Alert[] = [
  {
    id: '1',
    message: '🚨 Wallet tb1qxy has sent 90% of funds to a previously flagged address',
    type: 'danger',
    timestamp: Date.now() - 30000
  },
  {
    id: '2',
    message: '⚠️ Unusual circular transaction pattern detected in wallet tb1qyz',
    type: 'warning',
    timestamp: Date.now() - 60000
  }
]

export const AlertBanner: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([])

  useEffect(() => {
    // Simulate receiving alerts
    const interval = setInterval(() => {
      const randomAlert = SAMPLE_ALERTS[Math.floor(Math.random() * SAMPLE_ALERTS.length)]
      const newAlert = { ...randomAlert, id: Math.random().toString(), timestamp: Date.now() }
      setAlerts(prev => [...prev, newAlert].slice(-3)) // Keep last 3 alerts
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  if (alerts.length === 0) return null

  return (
    <div className="bg-gray-800 border-l-4 border-yellow-500">
      <div className="container mx-auto p-4">
        <div className="space-y-2">
          {alerts.map(alert => (
            <div 
              key={alert.id} 
              className={`flex items-center justify-between p-2 rounded bg-opacity-10 ${
                alert.type === 'danger' ? 'bg-red-600' : 'bg-yellow-600'
              }`}
            >
              <span>{alert.message}</span>
              <span className="text-sm text-gray-400">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
