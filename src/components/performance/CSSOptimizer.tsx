'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';

interface CSSMetrics {
  totalStylesheets: number;
  totalRules: number;
  unusedRules: number;
  criticalCSS: string;
  nonCriticalCSS: string;
  loadTime: number;
  renderBlockingCSS: string[];
  inlineStyles: number;
  duplicateRules: string[];
  largeSelectors: string[];
  timestamp: Date;
}

interface CSSOptimizationSuggestion {
  type: 'critical-css' | 'unused-css' | 'duplicate-css' | 'inline-small' | 'preload-fonts';
  priority: 'high' | 'medium' | 'low';
  description: string;
  estimatedSavings: number;
  implementation: string;
  selector?: string;
}

interface StylesheetInfo {
  href: string;
  size: number;
  loadTime: number;
  isBlocking: boolean;
  isCritical: boolean;
  rules: CSSRule[];
}

class CSSAnalyzer {
  private metrics: CSSMetrics | null = null;
  private observers: Set<(metrics: CSSMetrics) => void> = new Set();
  private criticalCSS: Set<string> = new Set();
  private usedSelectors: Set<string> = new Set();
  private mutationObserver: MutationObserver | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAnalysis();
      this.setupDOMObserver();
    }
  }

  private initializeAnalysis(): void {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.analyzeCSS());
    } else {
      this.analyzeCSS();
    }
  }

  private setupDOMObserver(): void {
    this.mutationObserver = new MutationObserver((mutations) => {
      let shouldReanalyze = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'LINK' && element.getAttribute('rel') === 'stylesheet') {
                shouldReanalyze = true;
              }
              if (element.tagName === 'STYLE') {
                shouldReanalyze = true;
              }
            }
          });
        }
      });

      if (shouldReanalyze) {
        setTimeout(() => this.analyzeCSS(), 100);
      }
    });

    this.mutationObserver.observe(document.head, {
      childList: true,
      subtree: true,
    });
  }

  private async analyzeCSS(): Promise<void> {
    const stylesheets = Array.from(document.styleSheets);
    const stylesheetsInfo: StylesheetInfo[] = [];
    let totalRules = 0;
    let unusedRules = 0;
    const duplicateRules: string[] = [];
    const largeSelectors: string[] = [];
    const renderBlockingCSS: string[] = [];

    // Analyze each stylesheet
    for (const stylesheet of stylesheets) {
      try {
        const info = await this.analyzeStylesheet(stylesheet);
        stylesheetsInfo.push(info);
        totalRules += info.rules.length;

        if (info.isBlocking) {
          renderBlockingCSS.push(info.href);
        }

        // Check for unused rules
        info.rules.forEach((rule) => {
          if (rule instanceof CSSStyleRule) {
            const selector = rule.selectorText;
            if (selector.length > 100) {
              largeSelectors.push(selector);
            }

            if (!this.isSelectorUsed(selector)) {
              unusedRules++;
            }
          }
        });
      } catch (error) {
        console.warn('Failed to analyze stylesheet:', error);
      }
    }

    // Extract critical CSS
    const criticalCSS = this.extractCriticalCSS();
    const nonCriticalCSS = this.extractNonCriticalCSS(criticalCSS);

    // Count inline styles
    const inlineStyles = document.querySelectorAll('[style]').length;

    this.metrics = {
      totalStylesheets: stylesheets.length,
      totalRules,
      unusedRules,
      criticalCSS,
      nonCriticalCSS,
      loadTime: this.calculateCSSLoadTime(),
      renderBlockingCSS,
      inlineStyles,
      duplicateRules,
      largeSelectors,
      timestamp: new Date(),
    };

    this.notifyObservers();
  }

  private async analyzeStylesheet(stylesheet: CSSStyleSheet): Promise<StylesheetInfo> {
    const href = stylesheet.href || 'inline';
    const rules = Array.from(stylesheet.cssRules || []);
    
    // Estimate size
    let size = 0;
    rules.forEach((rule) => {
      size += rule.cssText.length;
    });

    // Check if blocking
    const linkElement = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .find(link => (link as HTMLLinkElement).href === href);
    const isBlocking = !linkElement?.hasAttribute('media') || 
                      linkElement.getAttribute('media') === 'all' ||
                      linkElement.getAttribute('media') === 'screen';

    // Determine if critical (above the fold)
    const isCritical = this.isStylesheetCritical(rules);

    return {
      href,
      size,
      loadTime: 0, // Would need Resource Timing API for accurate measurement
      isBlocking,
      isCritical,
      rules,
    };
  }

  private isStylesheetCritical(rules: CSSRule[]): boolean {
    // Check if any rules apply to above-the-fold content
    const viewportHeight = window.innerHeight;
    const aboveFoldElements = Array.from(document.querySelectorAll('*'))
      .filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.top < viewportHeight;
      });

    return rules.some((rule) => {
      if (rule instanceof CSSStyleRule) {
        try {
          return aboveFoldElements.some(el => el.matches(rule.selectorText));
        } catch {
          return false;
        }
      }
      return false;
    });
  }

  private isSelectorUsed(selector: string): boolean {
    try {
      return document.querySelector(selector) !== null;
    } catch {
      return true; // Assume used if we can't parse the selector
    }
  }

  private extractCriticalCSS(): string {
    const criticalRules: string[] = [];
    const viewportHeight = window.innerHeight;

    // Get all elements above the fold
    const aboveFoldElements = Array.from(document.querySelectorAll('*'))
      .filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.top < viewportHeight;
      });

    // Extract styles for above-the-fold elements
    Array.from(document.styleSheets).forEach((stylesheet) => {
      try {
        Array.from(stylesheet.cssRules || []).forEach((rule) => {
          if (rule instanceof CSSStyleRule) {
            const selector = rule.selectorText;
            try {
              if (aboveFoldElements.some(el => el.matches(selector))) {
                criticalRules.push(rule.cssText);
              }
            } catch {
              // Skip invalid selectors
            }
          }
        });
      } catch (error) {
        console.warn('Cannot access stylesheet rules:', error);
      }
    });

    return criticalRules.join('\n');
  }

  private extractNonCriticalCSS(criticalCSS: string): string {
    const allCSS: string[] = [];
    
    Array.from(document.styleSheets).forEach((stylesheet) => {
      try {
        Array.from(stylesheet.cssRules || []).forEach((rule) => {
          allCSS.push(rule.cssText);
        });
      } catch (error) {
        console.warn('Cannot access stylesheet rules:', error);
      }
    });

    const allCSSText = allCSS.join('\n');
    return allCSSText.replace(criticalCSS, '').trim();
  }

  private calculateCSSLoadTime(): number {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const cssResources = resources.filter(r => 
      r.name.endsWith('.css') || 
      (r.initiatorType === 'link' && r.name.includes('css'))
    );

    return cssResources.reduce((total, resource) => total + resource.duration, 0);
  }

  getMetrics(): CSSMetrics | null {
    return this.metrics;
  }

  getOptimizationSuggestions(): CSSOptimizationSuggestion[] {
    if (!this.metrics) return [];

    const suggestions: CSSOptimizationSuggestion[] = [];

    // Critical CSS suggestion
    if (this.metrics.criticalCSS.length > 0 && this.metrics.renderBlockingCSS.length > 0) {
      suggestions.push({
        type: 'critical-css',
        priority: 'high',
        description: 'Extract and inline critical CSS to improve First Contentful Paint',
        estimatedSavings: this.metrics.loadTime * 0.6,
        implementation: 'Inline critical CSS in <head> and load non-critical CSS asynchronously',
      });
    }

    // Unused CSS suggestion
    if (this.metrics.unusedRules > this.metrics.totalRules * 0.2) {
      suggestions.push({
        type: 'unused-css',
        priority: 'medium',
        description: `Remove ${this.metrics.unusedRules} unused CSS rules (${((this.metrics.unusedRules / this.metrics.totalRules) * 100).toFixed(1)}%)`,
        estimatedSavings: this.metrics.unusedRules * 50, // Estimate 50 bytes per rule
        implementation: 'Use tools like PurgeCSS or UnCSS to remove unused styles',
      });
    }

    // Duplicate CSS suggestion
    if (this.metrics.duplicateRules.length > 0) {
      suggestions.push({
        type: 'duplicate-css',
        priority: 'medium',
        description: `Remove ${this.metrics.duplicateRules.length} duplicate CSS rules`,
        estimatedSavings: this.metrics.duplicateRules.length * 100,
        implementation: 'Consolidate duplicate rules and use CSS preprocessing',
      });
    }

    // Inline small CSS suggestion
    if (this.metrics.totalStylesheets > 3) {
      suggestions.push({
        type: 'inline-small',
        priority: 'low',
        description: 'Inline small CSS files to reduce HTTP requests',
        estimatedSavings: this.metrics.totalStylesheets * 20,
        implementation: 'Inline CSS files smaller than 2KB directly in HTML',
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority] || b.estimatedSavings - a.estimatedSavings;
    });
  }

  subscribe(observer: (metrics: CSSMetrics) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  private notifyObservers(): void {
    if (this.metrics) {
      this.observers.forEach(observer => observer(this.metrics!));
    }
  }

  destroy(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    this.observers.clear();
  }
}

// Global CSS analyzer instance
const globalCSSAnalyzer = new CSSAnalyzer();

interface CriticalCSSProps {
  css: string;
  children?: React.ReactNode;
}

export const CriticalCSS: React.FC<CriticalCSSProps> = ({ css, children }) => {
  useEffect(() => {
    if (css && typeof window !== 'undefined') {
      // Check if critical CSS is already injected
      const existingStyle = document.querySelector('#critical-css');
      if (!existingStyle) {
        const style = document.createElement('style');
        style.id = 'critical-css';
        style.textContent = css;
        document.head.insertBefore(style, document.head.firstChild);
      }
    }
  }, [css]);

  return <>{children}</>;
};

interface AsyncCSSProps {
  href: string;
  media?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const AsyncCSS: React.FC<AsyncCSSProps> = ({ 
  href, 
  media = 'all',
  onLoad,
  onError 
}) => {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    
    link.onload = () => {
      link.rel = 'stylesheet';
      link.media = media;
      onLoad?.();
    };

    link.onerror = () => {
      onError?.();
    };

    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [href, media, onLoad, onError]);

  return null;
};

interface FontPreloadProps {
  fonts: Array<{
    href: string;
    type?: string;
    crossOrigin?: string;
  }>;
}

export const FontPreload: React.FC<FontPreloadProps> = ({ fonts }) => {
  useEffect(() => {
    fonts.forEach(({ href, type = 'font/woff2', crossOrigin = 'anonymous' }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = type;
      link.crossOrigin = crossOrigin;
      link.href = href;
      
      document.head.appendChild(link);
    });
  }, [fonts]);

  return null;
};

interface CSSAnalyticsDisplayProps {
  className?: string;
  showSuggestions?: boolean;
}

export const CSSAnalyticsDisplay: React.FC<CSSAnalyticsDisplayProps> = ({
  className = '',
  showSuggestions = true,
}) => {
  const [metrics, setMetrics] = useState<CSSMetrics | null>(null);
  const [suggestions, setSuggestions] = useState<CSSOptimizationSuggestion[]>([]);

  useEffect(() => {
    const unsubscribe = globalCSSAnalyzer.subscribe(setMetrics);
    setMetrics(globalCSSAnalyzer.getMetrics());
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (metrics) {
      setSuggestions(globalCSSAnalyzer.getOptimizationSuggestions());
    }
  }, [metrics]);

  const formatSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }, []);

  const unusedPercentage = useMemo(() => {
    if (!metrics || metrics.totalRules === 0) return 0;
    return (metrics.unusedRules / metrics.totalRules * 100);
  }, [metrics]);

  if (!metrics) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      <h3 className="text-lg font-semibold mb-4">CSS Analytics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{metrics.totalStylesheets}</div>
          <div className="text-sm text-gray-600">Stylesheets</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{metrics.totalRules}</div>
          <div className="text-sm text-gray-600">CSS Rules</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{unusedPercentage.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Unused CSS</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{metrics.loadTime.toFixed(0)}ms</div>
          <div className="text-sm text-gray-600">Load Time</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Critical CSS</h4>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-600 mb-2">
              Size: {formatSize(metrics.criticalCSS.length)}
            </div>
            <div className="text-xs text-gray-500 font-mono bg-white p-2 rounded max-h-20 overflow-y-auto">
              {metrics.criticalCSS.substring(0, 200)}
              {metrics.criticalCSS.length > 200 && '...'}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Issues</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Render-blocking CSS:</span>
              <span className="font-medium">{metrics.renderBlockingCSS.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Inline styles:</span>
              <span className="font-medium">{metrics.inlineStyles}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Large selectors:</span>
              <span className="font-medium">{metrics.largeSelectors.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Duplicate rules:</span>
              <span className="font-medium">{metrics.duplicateRules.length}</span>
            </div>
          </div>
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Optimization Suggestions</h4>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      suggestion.priority === 'high' ? 'bg-red-100 text-red-600' :
                      suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {suggestion.priority}
                    </span>
                    <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-600">
                      {suggestion.type}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    -{formatSize(suggestion.estimatedSavings)}
                  </div>
                </div>
                <div className="text-sm text-gray-700 mb-1">{suggestion.description}</div>
                <div className="text-xs text-gray-500">{suggestion.implementation}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const useCSSAnalytics = () => {
  const [metrics, setMetrics] = useState<CSSMetrics | null>(null);

  useEffect(() => {
    const unsubscribe = globalCSSAnalyzer.subscribe(setMetrics);
    setMetrics(globalCSSAnalyzer.getMetrics());
    return unsubscribe;
  }, []);

  return {
    metrics,
    suggestions: metrics ? globalCSSAnalyzer.getOptimizationSuggestions() : [],
    analyzer: globalCSSAnalyzer,
  };
};

export const useCriticalCSS = () => {
  const [criticalCSS, setCriticalCSS] = useState<string>('');

  const extractCriticalCSS = useCallback(() => {
    const analyzer = globalCSSAnalyzer;
    const metrics = analyzer.getMetrics();
    if (metrics) {
      setCriticalCSS(metrics.criticalCSS);
    }
  }, []);

  const injectCriticalCSS = useCallback((css: string) => {
    const style = document.createElement('style');
    style.id = 'critical-css';
    style.textContent = css;
    document.head.insertBefore(style, document.head.firstChild);
  }, []);

  return {
    criticalCSS,
    extractCriticalCSS,
    injectCriticalCSS,
  };
};

export default {
  CriticalCSS,
  AsyncCSS,
  FontPreload,
  CSSAnalyticsDisplay,
  useCSSAnalytics,
  useCriticalCSS,
  CSSAnalyzer,
};