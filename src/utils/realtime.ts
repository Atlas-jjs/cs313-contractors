import supabase from "../config/supabaseClient";

export const reservationChannel = supabase
  .channel("reservation_updates")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "reservation" },
    (payload) => {
      window.dispatchEvent(
        new CustomEvent("reservation-updated", { detail: payload })
      );
    }
  )
  .subscribe();

export const userSuspensionChannel = supabase
  .channel("user_suspension")
  .on(
    "postgres_changes",
    { event: "UPDATE", schema: "public", table: "user" },
    async (payload) => {
      const currentUser = await supabase.auth.getUser();
      const currentUserId = currentUser.data.user?.id;

      if (payload.new.id === currentUserId && payload.new.is_suspended) {
        await supabase.auth.signOut();
        window.location.href = "/suspended";
      }
    }
  )
  .subscribe();
