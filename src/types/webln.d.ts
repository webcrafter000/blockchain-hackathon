declare module '../types/webln' {
  interface WebLNProvider {
    enable(): Promise<void>;
    getInfo(): Promise<{
      node: {
        alias?: string;
        pubkey: string;
        color?: string;
        network?: string;
      };
    }>;
    getBalance(): Promise<{
      balance: number;
      currency?: string;
    }>;
    makeInvoice(args: {
      amount: number;
      defaultMemo?: string;
      [key: string]: any;
    }): Promise<{
      paymentRequest: string;
    }>;
    sendPayment(paymentRequest: string): Promise<{
      preimage: string;
      paymentHash: string;
    }>;
  }

  interface Window {
    webln?: WebLNProvider;
  }
}

declare global {
  interface Window {
    webln?: import('../types/webln').WebLNProvider;
  }
}

export {};
