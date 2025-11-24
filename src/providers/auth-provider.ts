import type { AuthProvider } from "@refinedev/core";
import supabaseClient from "../config/supabaseClient";

export const authProvider: AuthProvider = {
  check: async () => {
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session) return { authenticated: false, redirectTo: "/login" };

    const { data: userData, error } = await supabaseClient
      .from("user")
      .select("is_suspended")
      .eq("id", session.user.id)
      .single();

    if (error) return { authenticated: false, redirectTo: "/login" };

    if (userData?.is_suspended) {
      return { authenticated: false, redirectTo: "/suspended" };
    }

    return { authenticated: true, redirectTo: "/" };
  },
  login: async () => {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error)
      return {
        success: false,
        error,
      };

    return { success: true, redirectTo: "/" };
  },
  logout: async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error)
      return {
        success: false,
        error,
      };

    return { success: true, redirectTo: "/login" };
  },
  getIdentity: async () => {
    const { data: authData, error } = await supabaseClient.auth.getUser();

    if (error) console.error("Error getting user:", error.message);

    const { data: userData } = await supabaseClient
      .from("user")
      .select("type, avatar_url, is_suspended")
      .eq("id", authData.user?.id)
      .single();

    return {
      ...authData,
      type: userData?.type,
      avatar_url: userData?.avatar_url,
      is_suspended: userData?.is_suspended,
    };

    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};
