/**
 * Load Testing Script for Rate Limiting and Error Handling
 * 
 * This script tests the API rate limiting system under various load conditions
 * Run with: node tests/load/rate-limit-test.js
 */

const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');

class LoadTester {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:3000';
    this.concurrency = options.concurrency || 10;
    this.duration = options.duration || 60000; // 60 seconds
    this.endpoints = options.endpoints || ['/api/products', '/api/health'];
    this.userTiers = options.userTiers || ['basic', 'premium', 'enterprise'];
    this.metrics = {
      requests: 0,
      responses: 0,
      errors: 0,
      rateLimited: 0,
      responseTimeSum: 0,
      responseTimeMin: Infinity,
      responseTimeMax: 0,
      statusCodes: {},
      errorTypes: {},
      rateLimitTiers: {}
    };
    this.isRunning = false;
  }

  /**
   * Make HTTP request with metrics tracking
   */
  async makeRequest(endpoint, userTier = 'basic', apiKey = null) {
    return new Promise((resolve) => {
      const url = new URL(endpoint, this.baseUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'User-Agent': `LoadTester/1.0 (tier=${userTier})`,
          'X-API-Version': 'v1',
          'Accept': 'application/json'
        }
      };

      if (apiKey) {
        options.headers['Authorization'] = `Bearer ${apiKey}`;
      }

      if (userTier !== 'basic') {
        options.headers['X-User-Tier'] = userTier;
      }

      const startTime = performance.now();
      this.metrics.requests++;

      const req = client.request(options, (res) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          this.metrics.responses++;
          this.metrics.responseTimeSum += responseTime;
          this.metrics.responseTimeMin = Math.min(this.metrics.responseTimeMin, responseTime);
          this.metrics.responseTimeMax = Math.max(this.metrics.responseTimeMax, responseTime);
          
          // Track status codes
          const statusCode = res.statusCode;
          this.metrics.statusCodes[statusCode] = (this.metrics.statusCodes[statusCode] || 0) + 1;
          
          // Track rate limiting
          if (statusCode === 429) {
            this.metrics.rateLimited++;
            this.metrics.rateLimitTiers[userTier] = (this.metrics.rateLimitTiers[userTier] || 0) + 1;
          }
          
          // Track errors
          if (statusCode >= 400) {
            this.metrics.errors++;
            
            try {
              const errorData = JSON.parse(body);
              const errorType = errorData.error?.type || 'Unknown';
              this.metrics.errorTypes[errorType] = (this.metrics.errorTypes[errorType] || 0) + 1;
            } catch (e) {
              this.metrics.errorTypes['ParseError'] = (this.metrics.errorTypes['ParseError'] || 0) + 1;
            }
          }
          
          resolve({
            statusCode,
            responseTime,
            headers: res.headers,
            body: body.substring(0, 200), // First 200 chars for debugging
            userTier,
            endpoint
          });
        });
      });

      req.on('error', (error) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        this.metrics.responses++;
        this.metrics.errors++;
        this.metrics.errorTypes['NetworkError'] = (this.metrics.errorTypes['NetworkError'] || 0) + 1;
        
        resolve({
          error: error.message,
          responseTime,
          userTier,
          endpoint
        });
      });

      req.setTimeout(10000, () => {
        req.destroy();
        this.metrics.errorTypes['Timeout'] = (this.metrics.errorTypes['Timeout'] || 0) + 1;
      });

      req.end();
    });
  }

  /**
   * Generate concurrent load for specified duration
   */
  async runLoadTest() {

    this.isRunning = true;
    const startTime = Date.now();
    
    // Start concurrent workers
    const workers = [];
    for (let i = 0; i < this.concurrency; i++) {
      workers.push(this.worker(i));
    }

    // Stop after duration
    setTimeout(() => {
      this.isRunning = false;
    }, this.duration);

    // Wait for all workers to complete
    await Promise.all(workers);

    const endTime = Date.now();
    const actualDuration = endTime - startTime;

    this.printResults(actualDuration);
  }

  /**
   * Worker function that continuously makes requests
   */
  async worker(workerId) {
    while (this.isRunning) {
      try {
        // Random endpoint and user tier
        const endpoint = this.endpoints[Math.floor(Math.random() * this.endpoints.length)];
        const userTier = this.userTiers[Math.floor(Math.random() * this.userTiers.length)];
        
        const result = await this.makeRequest(endpoint, userTier);
        
        // Log rate limiting events
        if (result.statusCode === 429) {

        }
        
        // Log critical errors
        if (result.statusCode >= 500) {

        }
        
        // Small delay to prevent overwhelming
        await this.sleep(Math.random() * 100); // 0-100ms random delay
        
      } catch (error) {

        await this.sleep(1000); // Wait longer on error
      }
    }
  }

  /**
   * Print comprehensive test results
   */
  printResults(duration) {

    // Response time statistics
    const avgResponseTime = this.metrics.responseTimeSum / this.metrics.responses;

    // Status code breakdown

    Object.entries(this.metrics.statusCodes)
      .sort(([a], [b]) => a - b)
      .forEach(([code, count]) => {
        const percentage = (count / this.metrics.responses * 100).toFixed(2);
        
      });
    
    // Error type breakdown
    if (Object.keys(this.metrics.errorTypes).length > 0) {

      Object.entries(this.metrics.errorTypes)
        .sort(([,a], [,b]) => b - a)
        .forEach(([type, count]) => {
          const percentage = (count / this.metrics.errors * 100).toFixed(2);
          
        });
    }
    
    // Rate limit by tier
    if (Object.keys(this.metrics.rateLimitTiers).length > 0) {

      Object.entries(this.metrics.rateLimitTiers)
        .sort(([,a], [,b]) => b - a)
        .forEach(([tier, count]) => {

        });
    }
  }

  /**
   * Test rate limiting thresholds for different user tiers
   */
  async testRateLimitThresholds() {

    for (const tier of this.userTiers) {

      const requests = [];
      const maxRequests = 150; // Exceed all tier limits
      
      for (let i = 0; i < maxRequests; i++) {
        requests.push(this.makeRequest('/api/health', tier));
      }
      
      const results = await Promise.all(requests);
      
      const successCount = results.filter(r => r.statusCode === 200).length;
      const rateLimitCount = results.filter(r => r.statusCode === 429).length;

      // Wait before testing next tier
      await this.sleep(2000);
    }
  }

  /**
   * Test circuit breaker functionality
   */
  async testCircuitBreaker() {

    // Make requests to an endpoint that might trigger circuit breaker
    const results = [];
    for (let i = 0; i < 20; i++) {
      const result = await this.makeRequest('/api/health/database');
      results.push(result);
      
      if (result.statusCode === 503) {

        break;
      }
      
      // Small delay
      await this.sleep(100);
    }
    
    const serviceUnavailable = results.filter(r => r.statusCode === 503).length;

  }

  /**
   * Utility sleep function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Test configurations
const testConfigs = {
  light: {
    concurrency: 5,
    duration: 30000, // 30 seconds
    userTiers: ['basic', 'premium']
  },
  
  moderate: {
    concurrency: 10,
    duration: 60000, // 60 seconds
    userTiers: ['basic', 'premium', 'enterprise']
  },
  
  heavy: {
    concurrency: 25,
    duration: 120000, // 2 minutes
    userTiers: ['basic', 'premium', 'enterprise']
  },
  
  stress: {
    concurrency: 50,
    duration: 300000, // 5 minutes
    userTiers: ['basic', 'premium', 'enterprise']
  }
};

// Main execution
async function main() {
  const testType = process.argv[2] || 'moderate';
  const baseUrl = process.argv[3] || 'http://localhost:3000';
  
  if (!testConfigs[testType]) {

    process.exit(1);
  }
  
  const config = {
    baseUrl,
    endpoints: [
      '/api/health',
      '/api/products',
      '/api/categories',
      '/api/health/performance'
    ],
    ...testConfigs[testType]
  };
  
  const tester = new LoadTester(config);
  
  try {

    // Run main load test
    await tester.runLoadTest();
    
    // Additional specific tests

    await tester.testRateLimitThresholds();
    await tester.testCircuitBreaker();

  } catch (error) {

    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {

  process.exit(0);
});

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { LoadTester };