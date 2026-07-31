import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Loader2 } from "lucide-react";

// 路由懒加载 - Code Splitting
const DashboardPage = lazy(() => import("@/app/dashboard/page"));
const NewsPage = lazy(() => import("@/app/news/page"));
const GoalsPage = lazy(() => import("@/app/goals/page"));
const AIAdvisorPage = lazy(() => import("@/app/ai-advisor/page"));
const LearnPage = lazy(() => import("@/app/learn/page"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="/news"
          element={
            <Suspense fallback={<PageLoader />}>
              <NewsPage />
            </Suspense>
          }
        />
        <Route
          path="/goals"
          element={
            <Suspense fallback={<PageLoader />}>
              <GoalsPage />
            </Suspense>
          }
        />
        <Route
          path="/ai-advisor"
          element={
            <Suspense fallback={<PageLoader />}>
              <AIAdvisorPage />
            </Suspense>
          }
        />
        <Route
          path="/learn"
          element={
            <Suspense fallback={<PageLoader />}>
              <LearnPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
