import type { ReactNode } from "react";
import { usePermission } from "@/hooks/useAuth";
import type { PermissionAction } from "@/lib/permissions";

interface Props {
  action: PermissionAction;
  children: ReactNode;
  fallback?: ReactNode;
}

/** Esconde children se o usuário não tiver permissão. */
export function PermissionGate({ action, children, fallback = null }: Props) {
  const allowed = usePermission(action);
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
