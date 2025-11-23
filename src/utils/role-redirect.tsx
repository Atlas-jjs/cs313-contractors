import { useGetIdentity } from "@refinedev/core";
import supabase from "../config/supabaseClient";
import { Navigate } from "react-router";
import { useEffect, useState } from "react";
import { Loader, MantineProvider } from "@mantine/core";

const RoleRedirect = () => {
  const { data, isLoading } = useGetIdentity();
  const [type, setType] = useState("");

  useEffect(() => {
    if (isLoading) return;

    if (!data.user?.id) {
      console.log("No user found, redirecting...");
      return;
    }

    async function fetchUser() {
      if (data) {
        const userId = data.user?.id ?? "";
        const { data: userData, error } = await supabase
          .from("user")
          .select("type")
          .eq("id", userId)
          .single();
        if (error) console.error("An error occurred:", error.message);

        setType(userData?.type);
      }
    }

    fetchUser();
  }, [data, isLoading]);

  if (!data) return <Navigate to="/login" replace />;

  // ! Fix position of Loader once the user logged in
  if (!type || isLoading) {
    return (
      <>
        <MantineProvider>
          <div>
            <Loader />
          </div>
        </MantineProvider>
      </>
    );
  }

  // TEMPORARY
  if (type === "Student") {
    return <Navigate to="/student" replace />;
  } else if (type === "Admin") {
    return <Navigate to="/manage" replace />;
  } else if (type === "Instructor") {
    return <Navigate to="/instructor" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default RoleRedirect;
