import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Index from "./pages/Index";
import { ProtectedRoute } from "./components/ProtectedRoute";
import MatchDetail from "./pages/MatchDetail";
import Matches from "./pages/Matches";
import Teams from "./pages/Teams";
import History from "./pages/History";
import Favorites from "./pages/Favorites";
import SearchPage from "./pages/SearchPage";
import TeamProfile from "./pages/TeamProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { PublicLayout } from "./components/PublicLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import TeamsAdmin from "./pages/admin/Teams";
import PlayersAdmin from "./pages/admin/Players";
import MatchesAdmin from "./pages/admin/Matches";
import UsersAdmin from "./pages/admin/Users";
import UserDashboard from "./pages/UserDashboard";
import MatchControlRoom from "./pages/admin/MatchControlRoom";
import PlayerStats from "./pages/PlayerStats";
import PlayerProfile from "./pages/PlayerProfile";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ManageAdmins from "./pages/admin/ManageAdmins";
import SystemSettings from "./pages/admin/SystemSettings";

import LiveCricket from "./pages/LiveCricket";
import CricketMatchCenter from "./pages/CricketMatchCenter";
import GenAI from "./pages/GenAI";
import AgenticAI from "./pages/AgenticAI";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <SocketProvider>
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/match/:id" element={<MatchDetail />} />
                  <Route path="/matches" element={<Matches />} />
                  <Route path="/teams" element={<Teams />} />
                  <Route path="/team/:id" element={<TeamProfile />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/player-stats" element={<PlayerStats />} />
                  <Route path="/player/:id" element={<PlayerProfile />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                  <Route path="/live-cricket" element={<LiveCricket />} />
                  <Route path="/live-cricket/:id" element={<CricketMatchCenter />} />
                  <Route path="/gen-ai" element={<GenAI />} />
                  <Route path="/agentic-ai" element={<AgenticAI />} />

                  {/* Protected Routes */}
                  <Route
                    path="/history"
                    element={
                      <ProtectedRoute>
                        <History />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <UserDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/favorites"
                    element={
                      <ProtectedRoute>
                        <Favorites />
                      </ProtectedRoute>
                    }
                  />
                </Route>
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="teams" element={<TeamsAdmin />} />
                  <Route path="players" element={<PlayersAdmin />} />
                  <Route path="matches" element={<MatchesAdmin />} />
                  <Route path="matches/:id/control" element={<MatchControlRoom />} />
                  <Route path="users" element={<UsersAdmin />} />
                  <Route path="manage-admins" element={<ManageAdmins />} />
                  <Route path="system-settings" element={<SystemSettings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </SocketProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider >
);

export default App;
