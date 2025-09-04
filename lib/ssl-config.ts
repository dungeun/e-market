/**
 * SSL Configuration for Supabase connections in Vercel
 * Handles self-signed certificate chain issues
 */

import { readFileSync } from 'fs';
import { join } from 'path';

export interface SSLConfig {
  rejectUnauthorized: boolean;
  checkServerIdentity?: () => undefined;
  ca?: string;
  secureProtocol?: string;
  ciphers?: string;
}

/**
 * Get SSL configuration for Supabase database connections
 * Based on research of SSL certificate chain issues with Supabase and Vercel
 */
export function getSSLConfig(): SSLConfig | boolean {
  // In development, disable SSL for local connections
  if (process.env.NODE_ENV !== 'production') {
    return false;
  }

  // Check if we should disable SSL verification entirely
  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
    console.warn('⚠️  SSL certificate verification disabled globally');
    return {
      rejectUnauthorized: false,
      checkServerIdentity: () => undefined
    };
  }

  // For Supabase connections, use enhanced SSL configuration
  const config: SSLConfig = {
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined,
  };

  // Try to load CA certificate if provided
  if (process.env.DATABASE_CA_CERT) {
    try {
      if (process.env.DATABASE_CA_CERT.startsWith('-----BEGIN CERTIFICATE-----')) {
        // Certificate provided as string
        config.ca = process.env.DATABASE_CA_CERT;
      } else {
        // Certificate provided as file path
        const certPath = join(process.cwd(), process.env.DATABASE_CA_CERT);
        config.ca = readFileSync(certPath, 'utf8');
      }
      console.log('✅ SSL CA certificate loaded successfully');
    } catch (error) {
      console.warn('⚠️  Failed to load CA certificate:', error);
      // Continue with rejectUnauthorized: false
    }
  }

  return config;
}

/**
 * Enhanced connection string parser for Supabase with SSL handling
 */
export function parseSupabaseConnectionString(connectionString: string) {
  const url = new URL(connectionString);
  
  // Extract SSL mode from connection string
  const sslMode = url.searchParams.get('sslmode');
  const pgBouncer = url.searchParams.has('pgbouncer');
  
  // Remove SSL parameters from connection string for manual SSL config
  url.searchParams.delete('sslmode');
  url.searchParams.delete('sslcert');
  url.searchParams.delete('sslkey');
  url.searchParams.delete('sslrootcert');
  
  return {
    cleanConnectionString: url.toString(),
    sslMode,
    pgBouncer,
    ssl: getSSLConfig()
  };
}

/**
 * Log SSL configuration for debugging
 */
export function logSSLConfig() {
  console.log('🔐 SSL Configuration Status:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   NODE_TLS_REJECT_UNAUTHORIZED: ${process.env.NODE_TLS_REJECT_UNAUTHORIZED}`);
  console.log(`   DATABASE_CA_CERT: ${process.env.DATABASE_CA_CERT ? 'Configured' : 'Not set'}`);
  
  const sslConfig = getSSLConfig();
  if (typeof sslConfig === 'boolean') {
    console.log(`   SSL Enabled: ${sslConfig}`);
  } else {
    console.log(`   SSL Reject Unauthorized: ${sslConfig.rejectUnauthorized}`);
    console.log(`   SSL CA Certificate: ${sslConfig.ca ? 'Loaded' : 'Not provided'}`);
  }
}