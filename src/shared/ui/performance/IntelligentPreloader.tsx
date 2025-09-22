'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface PreloadConfig {
  routes: string[];
  images: string[];
  scripts: string[];
  stylesheets: string[];
  priority: 'high' | 'low';
  threshold: number; // Intersection threshold
  rootMargin: string;
}

interface IntelligentPreloaderProps {
  config: PreloadConfig;
  enabled?: boolean;
  debug?: boolean;
}

interface PreloaderAPI {
  preloadRoute: (route: string) => void;
  preloadImage: (src: string) => void;
  preloadScript: (src: string) => void;
  preloadStylesheet: (href: string) => void;
  getPreloadedResources: () => [string, PreloadedResource][];
  observeElement: (element: Element) => void;
}

declare global {
  interface Window {
    __intelligentPreloader?: PreloaderAPI;
  }
}

interface PreloadedResource {
  url: string;
  type: 'route' | 'image' | 'script' | 'stylesheet';
  timestamp: number;
  status: 'loading' | 'loaded' | 'error';
}

export default function IntelligentPreloader({ 
  config, 
  enabled = true, 
  debug = false 
}: IntelligentPreloaderProps) {
  const router = useRouter();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const preloadedResourcesRef = useRef<Map<string, PreloadedResource>>(new Map());
  const triggerElementsRef = useRef<Set<Element>>(new Set());

  const log = useCallback((message: string, data?: Record<string, string | number | boolean>) => {
    if (debug) {
      console.log(`[IntelligentPreloader] ${message}`, data);
    }
  }, [debug]);

  // Preload route using Next.js router
  const preloadRoute = useCallback(async (route: string) => {
    if (preloadedResourcesRef.current.has(route)) {
      return;
    }

    const resource: PreloadedResource = {
      url: route,
      type: 'route',
      timestamp: Date.now(),
      status: 'loading'
    };

    preloadedResourcesRef.current.set(route, resource);
    log(`Preloading route: ${route}`);

    try {
      router.prefetch(route);
      resource.status = 'loaded';
      log(`Route preloaded successfully: ${route}`);
    } catch (error) {
      resource.status = 'error';
      log(`Failed to preload route: ${route}`, { error: error instanceof Error ? error.message : String(error) });
    }
  }, [router, log]);

  // Preload image
  const preloadImage = useCallback((src: string) => {
    if (preloadedResourcesRef.current.has(src)) {
      return;
    }

    const resource: PreloadedResource = {
      url: src,
      type: 'image',
      timestamp: Date.now(),
      status: 'loading'
    };

    preloadedResourcesRef.current.set(src, resource);
    log(`Preloading image: ${src}`);

    const img = new Image();
    img.onload = () => {
      resource.status = 'loaded';
      log(`Image preloaded successfully: ${src}`);
    };
    img.onerror = () => {
      resource.status = 'error';
      log(`Failed to preload image: ${src}`);
    };
    img.src = src;
  }, [log]);

  // Preload script
  const preloadScript = useCallback((src: string) => {
    if (preloadedResourcesRef.current.has(src) || document.querySelector(`link[href="${src}"]`)) {
      return;
    }

    const resource: PreloadedResource = {
      url: src,
      type: 'script',
      timestamp: Date.now(),
      status: 'loading'
    };

    preloadedResourcesRef.current.set(src, resource);
    log(`Preloading script: ${src}`);

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = src;
    link.onload = () => {
      resource.status = 'loaded';
      log(`Script preloaded successfully: ${src}`);
    };
    link.onerror = () => {
      resource.status = 'error';
      log(`Failed to preload script: ${src}`);
    };
    
    document.head.appendChild(link);
  }, [log]);

  // Preload stylesheet
  const preloadStylesheet = useCallback((href: string) => {
    if (preloadedResourcesRef.current.has(href) || document.querySelector(`link[href="${href}"]`)) {
      return;
    }

    const resource: PreloadedResource = {
      url: href,
      type: 'stylesheet',
      timestamp: Date.now(),
      status: 'loading'
    };

    preloadedResourcesRef.current.set(href, resource);
    log(`Preloading stylesheet: ${href}`);

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = () => {
      resource.status = 'loaded';
      log(`Stylesheet preloaded successfully: ${href}`);
    };
    link.onerror = () => {
      resource.status = 'error';
      log(`Failed to preload stylesheet: ${href}`);
    };
    
    document.head.appendChild(link);
  }, [log]);

  // Handle intersection
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        log(`Element intersecting, starting preload`, { 
          tagName: entry.target.tagName, 
          className: entry.target.className,
          id: entry.target.id || 'no-id'
        });
        
        // Preload all configured resources
        config.routes.forEach(preloadRoute);
        config.images.forEach(preloadImage);
        config.scripts.forEach(preloadScript);
        config.stylesheets.forEach(preloadStylesheet);

        // Stop observing this element
        if (observerRef.current) {
          observerRef.current.unobserve(entry.target);
        }
        triggerElementsRef.current.delete(entry.target);
      }
    });
  }, [config, preloadRoute, preloadImage, preloadScript, preloadStylesheet, log]);

  // Initialize intersection observer
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: config.threshold,
      rootMargin: config.rootMargin
    });

    log('IntersectionObserver initialized', { 
      threshold: config.threshold, 
      rootMargin: config.rootMargin 
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, config.threshold, config.rootMargin, handleIntersection, log]);

  // Observe trigger elements
  const observeElement = useCallback((element: Element) => {
    if (!observerRef.current || triggerElementsRef.current.has(element)) {
      return;
    }

    observerRef.current.observe(element);
    triggerElementsRef.current.add(element);
    log('Started observing element', { tagName: element.tagName, className: element.className });
  }, [log]);

  // Auto-observe elements with data-preload attribute
  useEffect(() => {
    if (!enabled) return;

    const elements = document.querySelectorAll('[data-preload]');
    elements.forEach(observeElement);

    // Set up mutation observer to watch for new elements
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.hasAttribute('data-preload')) {
              observeElement(element);
            }
            // Also check children
            const children = element.querySelectorAll('[data-preload]');
            children.forEach(observeElement);
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      mutationObserver.disconnect();
    };
  }, [enabled, observeElement]);

  // Expose preload methods globally for manual triggering
  useEffect(() => {
    if (!enabled) return;

    window.__intelligentPreloader = {
      preloadRoute,
      preloadImage,
      preloadScript,
      preloadStylesheet,
      getPreloadedResources: () => Array.from(preloadedResourcesRef.current.entries()),
      observeElement
    };

    return () => {
      delete window.__intelligentPreloader;
    };
  }, [enabled, preloadRoute, preloadImage, preloadScript, preloadStylesheet, observeElement]);

  // Performance monitoring
  useEffect(() => {
    if (!debug) return;

    const interval = setInterval(() => {
      const resources = Array.from(preloadedResourcesRef.current.values());
      const stats = {
        total: resources.length,
        loaded: resources.filter(r => r.status === 'loaded').length,
        loading: resources.filter(r => r.status === 'loading').length,
        errors: resources.filter(r => r.status === 'error').length
      };
      
      log('Preload statistics', stats);
    }, 10000); // Log every 10 seconds

    return () => clearInterval(interval);
  }, [debug, log]);

  return null; // This is a utility component with no UI
}

// Hook for manual preloading
export function useIntelligentPreloader() {
  const preloadRoute = useCallback((route: string) => {
    const preloader = window.__intelligentPreloader;
    if (preloader) {
      preloader.preloadRoute(route);
    }
  }, []);

  const preloadImage = useCallback((src: string) => {
    const preloader = window.__intelligentPreloader;
    if (preloader) {
      preloader.preloadImage(src);
    }
  }, []);

  const preloadScript = useCallback((src: string) => {
    const preloader = window.__intelligentPreloader;
    if (preloader) {
      preloader.preloadScript(src);
    }
  }, []);

  const preloadStylesheet = useCallback((href: string) => {
    const preloader = window.__intelligentPreloader;
    if (preloader) {
      preloader.preloadStylesheet(href);
    }
  }, []);

  const observeElement = useCallback((element: Element) => {
    const preloader = window.__intelligentPreloader;
    if (preloader) {
      preloader.observeElement(element);
    }
  }, []);

  const getPreloadedResources = useCallback(() => {
    const preloader = window.__intelligentPreloader;
    return preloader ? preloader.getPreloadedResources() : [];
  }, []);

  return {
    preloadRoute,
    preloadImage,
    preloadScript,
    preloadStylesheet,
    observeElement,
    getPreloadedResources
  };
}