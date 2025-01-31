// hooks/useClaudeRetry.ts
import { useState, useCallback } from 'react';

interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 5,
  baseDelay: 2000, // Start with 2s delay
  maxDelay: 4000   // Max 8s delay
};

export function useClaudeRetry(config: Partial<RetryConfig> = {}) {
  const retryConfig = { ...DEFAULT_CONFIG, ...config };
  const [currentAttempt, setCurrentAttempt] = useState(0);
  
  const isClaudeOverloaded = (error: any): boolean => {
    if (!error) return false;
    const errorMsg = error.toString().toLowerCase();
    return (
      errorMsg.includes('overloaded') ||
      errorMsg.includes('rate limit') ||
      errorMsg.includes('too many requests') ||
      error?.status === 429
    );
  };

  const getBackoffDelay = (attempt: number): number => {
    const delay = Math.min(
      retryConfig.maxDelay,
      retryConfig.baseDelay * Math.pow(2, attempt)
    );
    // Add jitter to prevent thundering herd
    return delay + (Math.random() * 1000);
  };

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    while (currentAttempt < retryConfig.maxAttempts) {
      try {
        const result = await operation();
        // Success - reset attempt counter
        setCurrentAttempt(0);
        return result;
      } catch (error) {
        if (!isClaudeOverloaded(error)) {
          // If it's not an overload error, throw immediately
          throw error;
        }

        // Increment attempt counter
        setCurrentAttempt(prev => prev + 1);
        
        if (currentAttempt + 1 >= retryConfig.maxAttempts) {
          // We've exhausted all retries
          throw new Error('Claude is currently unavailable. Please try again later.');
        }

        // Wait before retrying
        await new Promise(resolve => 
          setTimeout(resolve, getBackoffDelay(currentAttempt))
        );
      }
    }

    // This should never be reached due to the throw above
    throw new Error('Unexpected retry failure');
  }, [currentAttempt, retryConfig]);

  return {
    executeWithRetry,
    currentAttempt,
    isRetrying: currentAttempt > 0
  };
}