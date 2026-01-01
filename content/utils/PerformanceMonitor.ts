import type { PerformanceTimer } from '../types';
import SafeWrapper from '../core/SafeWrapper';
import type ErrorHandler from '../core/ErrorHandler';

interface PerformanceMetrics {
  [key: string]: number[];
}

/**
 * PerformanceMonitor class - Tracks and monitors performance metrics
 * Measures execution times and provides performance statistics
 */
class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private safeWrapper: SafeWrapper;

  constructor(errorHandler: ErrorHandler) {
    this.metrics = {
      analysisTime: [],
      renderTime: [],
      memoryUsage: []
    };
    this.safeWrapper = new SafeWrapper(errorHandler);
  }

  startTiming(operation: string): PerformanceTimer {
    const result = this.safeWrapper.execute<PerformanceTimer>(
      () => {
        return {
          operation,
          startTime: performance.now()
        };
      },
      'PERFORMANCE_TIMING_ERROR',
      { operation }
    );

    return result.success && result.data ? result.data : { operation, startTime: Date.now() };
  }

  endTiming(timer: PerformanceTimer): number {
    const result = this.safeWrapper.execute<number>(
      () => {
        const duration = performance.now() - timer.startTime;
        const metricArray = this.metrics[timer.operation];
        if (metricArray) {
          metricArray.push(duration);
          if (metricArray.length > 10) {
            metricArray.shift();
          }
        }
        return duration;
      },
      'PERFORMANCE_TIMING_ERROR',
      { timer }
    );

    return result.success && result.data !== undefined ? result.data : 0;
  }

  getAverageTime(operation: string): number {
    const result = this.safeWrapper.execute<number>(
      () => {
        const times = this.metrics[operation] || [];
        return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
      },
      'PERFORMANCE_CALCULATION_ERROR',
      { operation }
    );

    return result.success && result.data !== undefined ? result.data : 0;
  }

  logPerformance(): void {
    this.safeWrapper.execute(() => {
      console.log('CSS Scanner Performance Metrics:', {
        avgAnalysisTime: `${this.getAverageTime('analysisTime').toFixed(2)}ms`,
        avgRenderTime: `${this.getAverageTime('renderTime').toFixed(2)}ms`
      });
    }, 'PERFORMANCE_LOGGING_ERROR');
  }
}

// Export to window object for backward compatibility
if (typeof window !== 'undefined') {
  window.PerformanceMonitor = PerformanceMonitor;
}

export default PerformanceMonitor;
