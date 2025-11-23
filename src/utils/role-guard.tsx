import { useGetIdentity } from "@refinedev/core";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface RoleGuardProps {
  allowed: string[];
  children: ReactNode;
}

export const RoleGuard = ({ allowed, children }: RoleGuardProps) => {
  const { data, isLoading } = useGetIdentity();

  if (isLoading) return null;
  if (!data) return <Navigate to="/login" replace />;

  if (!allowed.includes(data.type)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
