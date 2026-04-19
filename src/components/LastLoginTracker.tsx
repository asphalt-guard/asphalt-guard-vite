import { useEffect } from "react";
import { supabase, updateLastLogin } from "../lib/supabase";

/**
 * Runs once the app is mounted: updates `users.last_login` when a session exists,
 * and again on sign-in. Skips token refresh to avoid noisy writes.
 */
export function LastLoginTracker() {
    useEffect(() => {
        const touch = async (userId: string) => {
            await updateLastLogin(userId);
        };

        void supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.id) void touch(session.user.id);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "TOKEN_REFRESHED" || event === "SIGNED_OUT") return;
            if (event === "SIGNED_IN" && session?.user?.id) void touch(session.user.id);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return null;
}
