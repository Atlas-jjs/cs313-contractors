import { useGetIdentity } from "@refinedev/core";
import { Navigate } from "react-router";

export default function RoleRedirect() {
  const { data, isLoading } = useGetIdentity();

  if (isLoading) return null;
  if (!data) return <Navigate to="/login" replace />;

  switch (data.type) {
    case "Student":
      return <Navigate to="/student" replace />;
    case "Instructor":
      return <Navigate to="/instructor" replace />;
    case "Admin":
      return <Navigate to="/manage" replace />;
    default:
      return <Navigate to="/" replace />;
  }
}
