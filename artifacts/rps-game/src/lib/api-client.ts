/**
 * Enhanced API client with retry logic, exponential backoff, and error handling
 */

export class APIError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export interface RetryConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelayMs: 500,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof APIError)) return false;
  const status = error.status;
  if (!status) return true; // Network errors are retryable
  // Retry on 5xx and specific 4xx errors
  return status >= 500 || status === 408 || status === 429;
}

export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retryConfig?: RetryConfig,
): Promise<T> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  let lastError: APIError | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new APIError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData.code,
        );

        if (!isRetryableError(error) || attempt === config.maxRetries) {
          throw error;
        }

        lastError = error;
      } else {
        const data = await response.json();
        return data as T;
      }
    } catch (error) {
      if (error instanceof APIError) {
        if (!isRetryableError(error) || attempt === config.maxRetries) {
          throw error;
        }
        lastError = error;
      } else {
        const networkError = new APIError(
          error instanceof Error ? error.message : "Network error",
        );
        if (attempt === config.maxRetries) {
          throw networkError;
        }
        lastError = networkError;
      }
    }

    if (attempt < config.maxRetries) {
      const exponentialDelay = Math.min(
        config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelayMs,
      );
      await delay(exponentialDelay);
    }
  }

  throw lastError || new APIError("Failed to fetch after retries");
}

/**
 * Batch API calls with concurrency control
 */
export async function batchFetch<T>(
  urls: string[],
  options: RequestInit = {},
  concurrency = 5,
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (let i = 0; i < urls.length; i++) {
    const promise = fetchWithRetry<T>(urls[i]!, options)
      .then((data) => {
        results[i] = data;
      })
      .catch((error) => {
        console.error(`[API] Failed to fetch ${urls[i]}:`, error);
        results[i] = null as any;
      });

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(executing.indexOf(promise), 1);
    }
  }

  await Promise.all(executing);
  return results.filter((r) => r !== null);
}
