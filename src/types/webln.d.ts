declare interface WebLNProvider {
  enable(): Promise<void>
  getInfo(): Promise<{
    node: {
      alias: string
      pubkey: string
      color?: string
    }
    methods: string[]
    version: string
  }>
  getBalance(): Promise<{
    balance: number
    confirmedBalance: number
  }>
  makeInvoice(args: {
    amount?: number | string
    defaultAmount?: number | string
    minimumAmount?: number | string
    maximumAmount?: number | string
    defaultMemo?: string
    memo?: string
  }): Promise<{
    paymentRequest: string
  }>
  sendPayment(paymentRequest: string): Promise<{
    preimage: string
  }>
  signMessage(message: string): Promise<{
    signature: string
  }>
  verifyMessage(signature: string, message: string): Promise<{
    valid: boolean
    pubkey: string
  }>
}

declare interface Window {
  webln?: WebLNProvider
}
