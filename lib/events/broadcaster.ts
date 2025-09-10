// Server-side event broadcaster for SSE
// Replace socket-client.ts functionality

interface EventData {
  type: 'ui-section-update' | 'language-pack-update' | 'order-update' | 'inventory-update'
  payload: any
}

// In-memory store for events (in production, use Redis or similar)
const eventQueue: EventData[] = []
const MAX_QUEUE_SIZE = 100

class EventBroadcaster {
  private static instance: EventBroadcaster
  private clients = new Set<WritableStreamDefaultWriter>()

  static getInstance(): EventBroadcaster {
    if (!EventBroadcaster.instance) {
      EventBroadcaster.instance = new EventBroadcaster()
    }
    return EventBroadcaster.instance
  }

  addClient(writer: WritableStreamDefaultWriter) {
    this.clients.add(writer)
  }

  removeClient(writer: WritableStreamDefaultWriter) {
    this.clients.delete(writer)
  }

  broadcast(type: string, data: any) {
    const event = {
      type,
      data,
      timestamp: Date.now()
    }

    // Add to event queue for late joiners
    eventQueue.unshift(event)
    if (eventQueue.length > MAX_QUEUE_SIZE) {
      eventQueue.pop()
    }

    const message = `data: ${JSON.stringify(event)}\n\n`
    const encoder = new TextEncoder()
    const encodedMessage = encoder.encode(message)

    // Broadcast to all connected clients
    this.clients.forEach((writer) => {
      try {
        (writer as any).enqueue(encodedMessage)
      } catch (error) {
        console.log('Failed to send to client, removing:', error.message)
        this.clients.delete(writer)
      }
    })

    console.log(`📡 Broadcasted ${type} to ${this.clients.size} clients`)
  }

  getRecentEvents(limit = 10): EventData[] {
    return eventQueue.slice(0, limit)
  }

  getClientCount(): number {
    return this.clients.size
  }
}

export const broadcaster = EventBroadcaster.getInstance()

// Helper functions to replace emitToAll from socket-client.ts
export function broadcastUIUpdate(data: any) {
  broadcaster.broadcast('ui-section-update', data)
}

export function broadcastLanguageUpdate(data: any) {
  broadcaster.broadcast('language-pack-update', data)
}

export function broadcastOrderUpdate(data: any) {
  broadcaster.broadcast('order-update', data)
}

export function broadcastInventoryUpdate(data: any) {
  broadcaster.broadcast('inventory-update', data)
}