import { useUserStore } from "@/lib/stores/userStore";
import useApi from "@/lib/hooks/useApi";
import { useEffect } from "react";
import { useSession } from "@/lib/better-auth/auth-client";
import { LoggedInUser } from "@/lib/types/users";

export const useUser = () => {
  const { user, setUser: setUserStore, clearUser } = useUserStore();
  const { useGet } = useApi();
  const { data: session } = useSession();

  const {
    data: fetchedUser,
    isLoading,
    error,
    refetch,
  } = useGet(
    `/me`,
    {},
    {
      enabled: !!session?.user?.id,
      staleTime: 0,
      refetchOnWindowFocus: true,
    }
  );

  const setUser = (partialUser: Partial<LoggedInUser>) => {
    const updatedUser = { ...user, ...partialUser };
    setUserStore(updatedUser as LoggedInUser);
  };

  useEffect(() => {
    if (fetchedUser) {
      setUserStore(fetchedUser);
    }
  }, [fetchedUser, setUserStore]);

  useEffect(() => {
    if (!session?.user?.id) {
      clearUser();
    }
  }, [session?.user?.id, clearUser]);

  return {
    user,
    isLoading,
    error,
    refetch,
    isLoggedIn: () => !!user,
    setUser,
  };
};
