/**
 * Performance Monitoring Utility
 * Tracks Web Vitals and custom performance metrics
 */

// Web Vitals types
export interface Metric {
    id: string;
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    entries: PerformanceEntry[];
}

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
};

/**
 * Get rating based on metric value
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
}

/**
 * Report Web Vitals to console (can be extended to send to analytics)
 */
export function reportWebVitals(metric: Metric) {
    const { name, value, rating } = metric;

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
        console.log(`${emoji} ${name}: ${value.toFixed(2)}ms (${rating})`);
    }

    // Send to analytics service (e.g., Google Analytics, Vercel Analytics)
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', name, {
            value: Math.round(value),
            metric_rating: rating,
            metric_delta: metric.delta,
        });
    }
}

/**
 * Measure component render time
 */
export function measureRender(componentName: string, callback: () => void) {
    const start = performance.now();
    callback();
    const end = performance.now();
    const duration = end - start;

    if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${componentName} rendered in ${duration.toFixed(2)}ms`);
    }

    return duration;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImage(
    img: HTMLImageElement,
    options?: IntersectionObserverInit
) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const target = entry.target as HTMLImageElement;
                const src = target.dataset.src;

                if (src) {
                    target.src = src;
                    target.removeAttribute('data-src');
                    observer.unobserve(target);
                }
            }
        });
    }, options);

    observer.observe(img);

    return () => observer.disconnect();
}

/**
 * Prefetch route for faster navigation
 */
export function prefetchRoute(href: string) {
    if (typeof window !== 'undefined') {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
    }
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get connection speed
 */
export function getConnectionSpeed(): 'slow' | 'medium' | 'fast' {
    if (typeof navigator === 'undefined' || !(navigator as any).connection) {
        return 'medium';
    }

    const connection = (navigator as any).connection;
    const effectiveType = connection.effectiveType;

    if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
    if (effectiveType === '3g') return 'medium';
    return 'fast';
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage() {
    if (typeof performance === 'undefined' || !(performance as any).memory) {
        return null;
    }

    const memory = (performance as any).memory;
    return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };
}

/**
 * Log performance metrics
 */
export function logPerformanceMetrics() {
    if (typeof window === 'undefined' || !window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigation) {
        console.group('📊 Performance Metrics');
        console.log('DNS Lookup:', `${(navigation.domainLookupEnd - navigation.domainLookupStart).toFixed(2)}ms`);
        console.log('TCP Connection:', `${(navigation.connectEnd - navigation.connectStart).toFixed(2)}ms`);
        console.log('Request Time:', `${(navigation.responseStart - navigation.requestStart).toFixed(2)}ms`);
        console.log('Response Time:', `${(navigation.responseEnd - navigation.responseStart).toFixed(2)}ms`);
        console.log('DOM Processing:', `${(navigation.domComplete - navigation.domInteractive).toFixed(2)}ms`);
        console.log('Load Complete:', `${(navigation.loadEventEnd - navigation.loadEventStart).toFixed(2)}ms`);
        console.log('Total Time:', `${(navigation.loadEventEnd - navigation.fetchStart).toFixed(2)}ms`);

        const memory = getMemoryUsage();
        if (memory) {
            console.log('Memory Usage:', `${memory.percentage.toFixed(2)}%`);
        }

        console.groupEnd();
    }
}
