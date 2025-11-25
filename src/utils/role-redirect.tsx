import { useGetIdentity } from "@refinedev/core";
import { Navigate } from "react-router";

export default function RoleRedirect() {
  const { data, isLoading } = useGetIdentity();

  if (isLoading) return null;
  if (!data) return <Navigate to="/login" replace />;

  if (data.is_suspended) return <Navigate to="/suspended" replace />;
  if (data.type === "Admin") {
    return <Navigate to="/manage" replace />;
  } else {
    return <Navigate to="/reservation" replace />;
  }
}
