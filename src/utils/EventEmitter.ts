type EventCallback = (...args: any[]) => void

interface EventMap {
  [key: string]: EventCallback[]
}

export class EventEmitter {
  private events: EventMap = {}

  on(event: string, callback: EventCallback): void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  off(event: string, callback: EventCallback): void {
    if (!this.events[event]) return
    this.events[event] = this.events[event].filter(cb => cb !== callback)
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return
    this.events[event].forEach(callback => {
      try {
        callback(...args)
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error)
      }
    })
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.events[event] = []
    } else {
      this.events = {}
    }
  }
}
