import { NextRequest } from 'next/server'

// Store active connections
const clients = new Set<WritableStreamDefaultWriter>()

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      // Convert controller to writer for easier management
      const writer = controller as any
      clients.add(writer)

      // Send initial connection event
      const welcomeEvent = `data: ${JSON.stringify({
        type: 'connection',
        data: { message: 'Connected to real-time updates' },
        timestamp: Date.now()
      })}\n\n`
      
      try {
        controller.enqueue(new TextEncoder().encode(welcomeEvent))
      } catch (error) {
        console.error('Error sending welcome event:', error)
      }

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          const heartbeatEvent = `data: ${JSON.stringify({
            type: 'heartbeat',
            data: { timestamp: Date.now() },
            timestamp: Date.now()
          })}\n\n`
          controller.enqueue(new TextEncoder().encode(heartbeatEvent))
        } catch (error) {
          clearInterval(heartbeat)
          clients.delete(writer)
        }
      }, 30000) // 30 second heartbeat

      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        clients.delete(writer)
        try {
          controller.close()
        } catch (error) {
          // Connection already closed
        }
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}

// Function to broadcast events to all connected clients
export function broadcastEvent(type: string, data: any) {
  const message = `data: ${JSON.stringify({
    type,
    data,
    timestamp: Date.now()
  })}\n\n`

  const encoder = new TextEncoder()
  const encodedMessage = encoder.encode(message)

  // Send to all connected clients
  clients.forEach((writer) => {
    try {
      writer.enqueue(encodedMessage)
    } catch (error) {
      // Remove failed connections
      clients.delete(writer)
      console.log('Removed disconnected client')
    }
  })
}