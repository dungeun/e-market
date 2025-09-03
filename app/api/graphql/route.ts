import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { typeDefs } from '@/lib/graphql/schema'
import { resolvers } from '@/lib/graphql/resolvers'
import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
  formatError: (err) => {
    // Log error

    // Don't give the specific errors to the client in production
    if (process.env.NODE_ENV === 'production') {
      // Override the error message for production
      if (err.message.includes('Authentication')) {
        return new Error('Authentication required')
      }
      if (err.message.includes('Admin')) {
        return new Error('Insufficient permissions')
      }
      return new Error('Internal server error')
    }
    
    return err
  }
})

// Create Next.js handler
const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req) => {
    // Get the user from JWT token
    let user = null
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    
    if (token) {
      try {
        user = jwt.verify(token, process.env.JWT_SECRET || 'secret-key')
      } catch (error) {

      }
    }
    
    // Get session ID for anonymous carts
    const sessionId = req.cookies.get('sessionId')?.value || 
                     req.headers.get('x-session-id') ||
                     generateSessionId()
    
    return {
      req,
      user,
      sessionId,
      dataSources: {
        // Add data sources here if needed
      }
    }
  }
})

// Generate session ID for anonymous users
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export { handler as GET, handler as POST }