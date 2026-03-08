import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardLayout from "./pages/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import ProfilePage from "./pages/ProfilePage";
import ScholarshipsPage from "./pages/ScholarshipsPage";
import ScholarshipDetailPage from "./pages/ScholarshipDetailPage";
import FinancialStrategyPage from "./pages/FinancialStrategyPage";

import SavedScholarshipsPage from "./pages/SavedScholarshipsPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import DocumentsPage from "./pages/DocumentsPage";
import ProfileAnalyzerPage from "./pages/ProfileAnalyzerPage";
import SuccessPredictorPage from "./pages/SuccessPredictorPage";
import ScamDetectorPage from "./pages/ScamDetectorPage";
import ApplicationAssistantPage from "./pages/ApplicationAssistantPage";
import BulkApplyPage from "./pages/BulkApplyPage";
import ScholarshipCalendarPage from "./pages/ScholarshipCalendarPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="scholarships" element={<ScholarshipsPage />} />
              <Route path="scholarship/:id" element={<ScholarshipDetailPage />} />
              <Route path="strategy" element={<FinancialStrategyPage />} />
              <Route path="bulk-apply" element={<BulkApplyPage />} />
              <Route path="calendar" element={<ScholarshipCalendarPage />} />
              <Route path="saved" element={<SavedScholarshipsPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="ai/profile-analyzer" element={<ProfileAnalyzerPage />} />
              <Route path="ai/success-predictor" element={<SuccessPredictorPage />} />
              <Route path="ai/scam-detector" element={<ScamDetectorPage />} />
              <Route path="ai/application-assistant" element={<ApplicationAssistantPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
