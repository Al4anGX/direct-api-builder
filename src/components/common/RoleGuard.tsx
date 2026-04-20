import { Navigate, useLocation } from "react-router-dom";
import type { AppRole } from "@/types/domain";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface Props {
  allow?: AppRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allow, children }: Props) {
  const { isAuthenticated, loading, roles } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allow && allow.length > 0) {
    const ok = roles.some((r) => allow.includes(r));
    if (!ok) return <Navigate to="/sem-permissao" replace />;
  }

  return <>{children}</>;
}
