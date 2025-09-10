import { logger } from '@/lib/logger';
import { uiSectionsCacheService } from '@/lib/services/ui-sections-cache';

/**
 * Initialize cache system on application startup
 */
export async function initializeCache(): Promise<void> {
  try {
    logger.info('Starting cache initialization...');

    // Check if cache is valid
    const isValid = await uiSectionsCacheService.isCacheValid();
    
    if (!isValid) {
      logger.info('Cache is invalid or missing, generating fresh cache...');
      
      const result = await uiSectionsCacheService.generateCache();
      
      if (result.success) {
        logger.info(`Cache initialized successfully for languages: ${result.languages.join(', ')}`);
        logger.info(`Generated cache for ${result.sectionsCount} sections`);
      } else {
        logger.error('Failed to initialize cache');
      }
    } else {
      logger.info('Cache is valid, skipping initialization');
    }
    
  } catch (error) {
    logger.error('Error during cache initialization:', error);
    // Don't throw error to prevent app startup failure
  }
}

/**
 * Schedule periodic cache updates
 */
export function scheduleCacheUpdates(): void {
  try {
    // Update cache every 30 minutes
    const CACHE_UPDATE_INTERVAL = 30 * 60 * 1000; // 30 minutes
    
    setInterval(async () => {
      try {
        logger.info('Running scheduled cache update...');
        
        const isValid = await uiSectionsCacheService.isCacheValid();
        
        if (!isValid) {
          const result = await uiSectionsCacheService.generateCache();
          
          if (result.success) {
            logger.info(`Scheduled cache update completed for ${result.languages.join(', ')}`);
          } else {
            logger.warn('Scheduled cache update failed');
          }
        } else {
          logger.info('Cache is still valid, skipping scheduled update');
        }
        
      } catch (error) {
        logger.error('Error during scheduled cache update:', error);
      }
    }, CACHE_UPDATE_INTERVAL);
    
    logger.info(`Scheduled cache updates every ${CACHE_UPDATE_INTERVAL / 60000} minutes`);
    
  } catch (error) {
    logger.error('Error scheduling cache updates:', error);
  }
}

/**
 * Warm up cache on startup
 */
export async function warmupCache(): Promise<void> {
  try {
    logger.info('Warming up cache...');
    
    // Test cache reads for all languages
    const languages = ['ko', 'en', 'fr'];
    
    for (const language of languages) {
      const cacheData = await uiSectionsCacheService.readCache(language);
      
      if (cacheData) {
        logger.info(`Cache warmed up for ${language}: ${cacheData.sectionsCount} sections`);
      } else {
        logger.warn(`Failed to warm up cache for ${language}`);
      }
    }
    
    logger.info('Cache warmup completed');
    
  } catch (error) {
    logger.error('Error during cache warmup:', error);
  }
}