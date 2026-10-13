import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "./index.css";
import { AuthProvider, useAuth } from "./auth";
import { Layout } from "./components/Layout";
import { Loading } from "./components/ui";
import { NoticesPage } from "./pages/NoticesPage";
import { NoticePage } from "./pages/NoticePage";
import { CreateNoticePage } from "./pages/CreateNoticePage";
import { MyNoticesPage } from "./pages/MyNoticesPage";
import { ModerationPage } from "./pages/ModerationPage";
import { UsersPage } from "./pages/UsersPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AuthPage } from "./pages/AuthPage";
import { PremiumPage } from "./pages/PremiumPage";

function RequireAuth({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    if (loading) return <Loading />;
    return user ? children : <Navigate to="/auth" replace />;
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<Layout />}>
                        <Route index element={<NoticesPage />} />
                        <Route path="notices/:id" element={<NoticePage />} />
                        <Route path="auth" element={<AuthPage />} />
                        <Route path="notices/new" element={<RequireAuth><CreateNoticePage /></RequireAuth>} />
                        <Route path="my" element={<RequireAuth><MyNoticesPage /></RequireAuth>} />
                        <Route path="moderation" element={<RequireAuth><ModerationPage /></RequireAuth>} />
                        <Route path="users" element={<RequireAuth><UsersPage /></RequireAuth>} />
                        <Route path="profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
                        <Route path="premium" element={<RequireAuth><PremiumPage /></RequireAuth>} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </StrictMode>
);
