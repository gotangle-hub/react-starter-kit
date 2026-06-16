import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "@/hooks/use-session";
import { routes } from "@/lib/routes";

/**
 * Gate that requires a signed-in Supabase session. Unauthenticated users are
 * redirected to the sign-in screen. Renders nothing visually of its own — it
 * just wraps the protected route element.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useSession();
  const location = useLocation();

  if (loading) return null;
  if (!isAuthenticated) {
    return <Navigate to={routes.signIn} replace state={{ from: location }} />;
  }
  return <>{children}</>;
}
