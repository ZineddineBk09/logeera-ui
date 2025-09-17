import { ChatService } from "@/lib/services";


export interface LongPollingOptions {
  interval?: number; // Polling interval in milliseconds (default: 5000)
  maxRetries?: number; // Maximum retry attempts (default: 3)
  onMessage?: (message: any) => void;
  onError?: (error: Error) => void;
}

export class LongPollingService {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private retryCounts: Map<string, number> = new Map();

  /**
   * Start long polling for chat messages
   */
  startPolling(chatId: string, options: LongPollingOptions = {}) {
    const {
      interval = 5000,
      maxRetries = 3,
      onMessage,
      onError
    } = options;

    // Clear existing polling for this chat
    this.stopPolling(chatId);

    const poll = async () => {
      try {
        const response = await ChatService.messages(chatId);
        const messages = await response.json();
        
        // Reset retry count on successful poll
        this.retryCounts.set(chatId, 0);
        
        // Call onMessage callback if provided
        if (onMessage && messages.length > 0) {
          // Only call for new messages (you might want to implement message deduplication)
          onMessage(messages);
        }
      } catch (error) {
        console.error(`Long polling error for chat ${chatId}:`, error);
        
        // Increment retry count
        const currentRetries = this.retryCounts.get(chatId) || 0;
        const newRetries = currentRetries + 1;
        this.retryCounts.set(chatId, newRetries);
        
        // Call onError callback if provided
        if (onError) {
          onError(error as Error);
        }
        
        // Stop polling if max retries reached
        if (newRetries >= maxRetries) {
          console.error(`Max retries reached for chat ${chatId}, stopping polling`);
          this.stopPolling(chatId);
          return;
        }
      }
    };

    // Start polling immediately
    poll();
    
    // Set up interval for subsequent polls
    const intervalId = setInterval(poll, interval);
    this.intervals.set(chatId, intervalId);
    
    console.log(`Started long polling for chat ${chatId} with ${interval}ms interval`);
  }

  /**
   * Stop long polling for a specific chat
   */
  stopPolling(chatId: string) {
    const intervalId = this.intervals.get(chatId);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(chatId);
      this.retryCounts.delete(chatId);
      console.log(`Stopped long polling for chat ${chatId}`);
    }
  }

  /**
   * Stop all long polling
   */
  stopAllPolling() {
    this.intervals.forEach((intervalId, chatId) => {
      clearInterval(intervalId);
      console.log(`Stopped long polling for chat ${chatId}`);
    });
    this.intervals.clear();
    this.retryCounts.clear();
  }

  /**
   * Check if polling is active for a chat
   */
  isPolling(chatId: string): boolean {
    return this.intervals.has(chatId);
  }

  /**
   * Get retry count for a chat
   */
  getRetryCount(chatId: string): number {
    return this.retryCounts.get(chatId) || 0;
  }
}

// Export singleton instance
export const longPollingService = new LongPollingService();
