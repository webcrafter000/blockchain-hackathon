export const generateRandomNode = (): string => {
  const nodeId = Math.floor(Math.random() * 1000)
  return `node${nodeId}@lightning.network`
}

export const generateRandomTxid = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
