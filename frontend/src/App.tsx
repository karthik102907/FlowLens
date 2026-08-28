import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { Dataset, AnalyticsBundle, User, NotificationItem } from './types';
import { NavView, Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AIChatDrawer } from './components/ai-analyst/AIChatDrawer';
import { AuthModal } from './pages/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { DashboardView } from './pages/DashboardView';
import { UploadView } from './pages/UploadView';
import { DatasetsView } from './pages/DatasetsView';
import { AnalysisHistoryView } from './pages/AnalysisHistoryView';
import { DataQualityView } from './pages/DataQualityView';
import { ProcessExplorerView } from './pages/ProcessExplorerView';
import { BottleneckView } from './pages/BottleneckView';
import { RootCauseView } from './pages/RootCauseView';
import { DelayPredictionView } from './pages/DelayPredictionView';
import { AnomalyView } from './pages/AnomalyView';
import { ReworkView } from './pages/ReworkView';
import { DepartmentView } from './pages/DepartmentView';
import { ProcessComparisonView } from './pages/ProcessComparisonView';
import { RecommendationsView } from './pages/RecommendationsView';
import { SimulationView } from './pages/SimulationView';
import { ReportsView } from './pages/ReportsView';
import { NotificationsView } from './pages/NotificationsView';
import { OrganizationView } from './pages/OrganizationView';
import { SettingsView } from './pages/SettingsView';
import { AnalysisProgressModal } from './components/common/AnalysisProgressModal';
import { Loader2 } from 'lucide-react';

export function App() {
  // Navigation & View State with Hash Sync
  const getInitialView = (): NavView | 'landing' => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    const validViews: string[] = [
      'dashboard',
      'upload',
      'datasets',
      'history',
      'quality',
      'explorer',
      'bottlenecks',
      'root-causes',
      'predictions',
      'anomalies',
      'rework',
      'departments',
      'compare',
      'recommendations',
      'simulation',
      'reports',
      'notifications',
      'users',
      'organization',
      'settings',
    ];
    if (validViews.includes(hash)) return hash as NavView;
    return 'landing';
  };

  const [currentView, setCurrentView] = useState<NavView | 'landing'>(getInitialView);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Synchronize hash on view change
  const navigateTo = (view: NavView | 'landing') => {
    setCurrentView(view);
    if (view === 'landing') {
      window.location.hash = '';
    } else {
      window.location.hash = `/${view}`;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (!hash) setCurrentView('landing');
      else setCurrentView(hash as NavView);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr_admin_01',
    email: 'admin@flowlens.ai',
    full_name: 'Dr. Sarah Jenkins',
    role: 'Administrator',
    organization_id: 'org_flowlens_enterprise',
    created_at: new Date().toISOString(),
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Data & Analytics State
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [analytics, setAnalytics] = useState<AnalyticsBundle | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Progress Modal State
  const [showDemoProgress, setShowDemoProgress] = useState(false);
  const [demoPendingName, setDemoPendingName] = useState('Enterprise Process Demo');
  const [demoPendingBundle, setDemoPendingBundle] = useState<{ dataset: Dataset; analytics: AnalyticsBundle } | null>(null);

  // AI Chat & Filters
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [dateRange, setDateRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial Data Ingestion & Setup
  useEffect(() => {
    bootstrap();
  }, []);

  const bootstrap = async () => {
    setLoading(true);
    try {
      // 1. Fetch available datasets
      const dsList = await api.getDatasets();
      setDatasets(dsList);

      if (dsList.length > 0) {
        const initialId = dsList[0].id;
        setSelectedDatasetId(initialId);

        // 2. Fetch analytics bundle
        const bundle = await api.getAllAnalytics(initialId);
        setAnalytics(bundle);
      }

      // 3. Fetch notifications
      const notifs = await api.getNotifications();
      setNotifications(notifs);
    } catch (err) {
      console.error('Bootstrap error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDataset = async (datasetId: string) => {
    setSelectedDatasetId(datasetId);
    setLoading(true);
    try {
      const bundle = await api.getAllAnalytics(datasetId);
      setAnalytics(bundle);
    } catch (err) {
      console.error('Error switching dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnalysis = async (analysisId: string, datasetId: string) => {
    setSelectedDatasetId(datasetId);
    setLoading(true);
    try {
      const bundle = await api.getAnalysisById(analysisId);
      setAnalytics(bundle);
      navigateTo('dashboard');
    } catch (err) {
      console.error('Error loading saved analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDatasetLoaded = (newDataset: Dataset, newAnalytics: AnalyticsBundle) => {
    setDatasets((prev) => [newDataset, ...prev.filter((d) => d.id !== newDataset.id)]);
    setSelectedDatasetId(newDataset.id);
    setAnalytics(newAnalytics);
    navigateTo('dashboard');
  };

  const handleLoadDemoFromLanding = async (type: string) => {
    setLoading(true);
    try {
      const res = await api.loadDemoDataset(type);
      setDemoPendingName(res.dataset.name);
      setDemoPendingBundle(res);
      setShowDemoProgress(true);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleDemoProgressComplete = () => {
    setShowDemoProgress(false);
    if (demoPendingBundle) {
      handleDatasetLoaded(demoPendingBundle.dataset, demoPendingBundle.analytics);
      setDemoPendingBundle(null);
    }
  };

  const refreshNotifications = async () => {
    const notifs = await api.getNotifications();
    setNotifications(notifs);
  };

  // If user is on Landing Page
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage
          onEnterApp={() => navigateTo('dashboard')}
          onOpenLogin={() => setAuthModalOpen(true)}
          onLoadDemo={handleLoadDemoFromLanding}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            navigateTo('dashboard');
          }}
        />
        <AnalysisProgressModal
          isOpen={showDemoProgress}
          onComplete={handleDemoProgressComplete}
          datasetName={demoPendingName}
        />
      </>
    );
  }

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId) || datasets[0];
  const unreadNotifCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Global Demo Progress Modal */}
      <AnalysisProgressModal
        isOpen={showDemoProgress}
        onComplete={handleDemoProgressComplete}
        datasetName={demoPendingName}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={(v) => navigateTo(v)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        unreadCount={unreadNotifCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          datasets={datasets}
          selectedDatasetId={selectedDatasetId}
          onSelectDataset={handleSelectDataset}
          currentUser={currentUser}
          onLogout={() => navigateTo('landing')}
          onOpenAIChat={() => setAiChatOpen(true)}
          onOpenNotifications={() => navigateTo('notifications')}
          unreadCount={unreadNotifCount}
          dateRange={dateRange}
          onChangeDateRange={setDateRange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {loading && !analytics ? (
            <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
              <span className="text-xs font-medium">Computing Process Intelligence Metrics...</span>
            </div>
          ) : analytics ? (
            <>
              {currentView === 'dashboard' && (
                <DashboardView analytics={analytics} onNavigate={(v) => navigateTo(v)} />
              )}
              {currentView === 'upload' && (
                <UploadView onDatasetReady={handleDatasetLoaded} />
              )}
              {currentView === 'datasets' && (
                <DatasetsView
                  datasets={datasets}
                  selectedDatasetId={selectedDatasetId}
                  onSelectDataset={handleSelectDataset}
                  onNavigateUpload={() => navigateTo('upload')}
                />
              )}
              {currentView === 'history' && (
                <AnalysisHistoryView
                  onSelectAnalysis={handleSelectAnalysis}
                  currentDatasetId={selectedDatasetId}
                />
              )}
              {currentView === 'quality' && selectedDataset && (
                <DataQualityView dataset={selectedDataset} analytics={analytics} />
              )}
              {currentView === 'explorer' && (
                <ProcessExplorerView analytics={analytics} />
              )}
              {currentView === 'bottlenecks' && (
                <BottleneckView
                  analytics={analytics}
                  onUpdateAnalytics={(updated) => setAnalytics(updated)}
                />
              )}
              {currentView === 'root-causes' && (
                <RootCauseView analytics={analytics} />
              )}
              {currentView === 'predictions' && (
                <DelayPredictionView analytics={analytics} />
              )}
              {currentView === 'anomalies' && (
                <AnomalyView analytics={analytics} />
              )}
              {currentView === 'rework' && (
                <ReworkView analytics={analytics} />
              )}
              {currentView === 'departments' && (
                <DepartmentView analytics={analytics} />
              )}
              {currentView === 'compare' && (
                <ProcessComparisonView datasets={datasets} currentAnalytics={analytics} />
              )}
              {currentView === 'recommendations' && (
                <RecommendationsView analytics={analytics} />
              )}
              {currentView === 'simulation' && (
                <SimulationView analytics={analytics} />
              )}
              {currentView === 'reports' && selectedDataset && (
                <ReportsView dataset={selectedDataset} analytics={analytics} />
              )}
              {currentView === 'notifications' && (
                <NotificationsView
                  notifications={notifications}
                  onRefreshNotifications={refreshNotifications}
                />
              )}
              {currentView === 'users' && (
                <OrganizationView currentUser={currentUser} />
              )}
              {currentView === 'organization' && (
                <OrganizationView currentUser={currentUser} />
              )}
              {currentView === 'settings' && (
                <SettingsView />
              )}
            </>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No active analytics bundle. Please upload a dataset.
            </div>
          )}
        </main>
      </div>

      {/* Grounded AI Process Analyst Assistant Floating Drawer */}
      <AIChatDrawer
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
        datasetId={selectedDatasetId}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          navigateTo('dashboard');
        }}
      />
    </div>
  );
}

export default App;
