import Hero from "@/components/home/Hero";
import { PageSuspense } from "@/components/PageSuspense";
import { PerformanceDashboard, SmartSuspenseBoundary } from "@/components/performance";

// Компонент для инициализации производительности
function PerformanceProvider({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Performance Dashboard - показываем только в development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <PerformanceDashboard 
            showDetails={false}
            enableRealTimeMonitoring={true}
            enableImageOptimization={true}
            enableRouteOptimization={true}
            enableStreamingSSR={true}
          />
        </div>
      )}
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <PerformanceProvider>
      <SmartSuspenseBoundary
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        }
        name="home-page"
        priority="high"
      >
        <PageSuspense priority="high">
          <Hero />
        </PageSuspense>
      </SmartSuspenseBoundary>
    </PerformanceProvider>
  );
}
