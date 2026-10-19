import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ExamsPage } from './pages/ExamsPage';
import { ExamTakingPage } from './pages/ExamTakingPage';
import { ResultPage } from './pages/ResultPage';
import { MyResultsPage } from './pages/MyResultsPage';
import { ProductExplorerPage } from './pages/ProductExplorerPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { AuthPage } from './pages/AuthPage';

function MainRouter() {
  const { isAuthenticated } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return window.location.hash.replace('#', '') || '/dashboard';
    }
    return '/dashboard';
  });

  // Sync route with window hash for bookmarking and back button
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentRoute(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route: string) => {
    setCurrentRoute(route);
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If not logged in, render the AuthPage
  if (!isAuthenticated) {
    return <AuthPage onSuccess={() => navigate('/dashboard')} />;
  }

  // Render active page component
  const renderCurrentView = () => {
    if (currentRoute === '/dashboard') {
      return <DashboardPage onNavigate={navigate} />;
    }
    if (currentRoute === '/exams') {
      return <ExamsPage onNavigate={navigate} />;
    }
    if (currentRoute.startsWith('/exam-taking/')) {
      const examId = currentRoute.replace('/exam-taking/', '');
      return <ExamTakingPage examId={examId} onNavigate={navigate} />;
    }
    if (currentRoute === '/results') {
      return <MyResultsPage onNavigate={navigate} />;
    }
    if (currentRoute.startsWith('/results/')) {
      const attemptId = currentRoute.replace('/results/', '');
      return <ResultPage attemptId={attemptId} onNavigate={navigate} />;
    }
    if (currentRoute === '/products') {
      return <ProductExplorerPage />;
    }
    if (currentRoute === '/notifications') {
      return <NotificationsPage onNavigate={navigate} />;
    }
    if (currentRoute === '/profile') {
      return <ProfilePage />;
    }
    if (currentRoute === '/admin') {
      return <AdminPanelPage />;
    }

    // Default fallback
    return <DashboardPage onNavigate={navigate} />;
  };

  return (
    <AppLayout currentRoute={currentRoute} onNavigate={navigate}>
      {renderCurrentView()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}
