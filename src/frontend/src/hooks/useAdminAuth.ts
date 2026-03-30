import { useCallback, useEffect, useState } from "react";
import { useActor } from "./useActor";

const STORAGE_KEY = "anandstudio_admin_token";

export function useAdminAuth() {
  const { actor } = useActor();
  const [sessionToken, setSessionToken] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSetup, setIsSetup] = useState<boolean | null>(null);

  // On mount / actor ready: verify stored token and check setup status
  useEffect(() => {
    if (!actor) return;

    let cancelled = false;
    async function init() {
      if (!actor) return;
      setIsLoading(true);
      try {
        const a = actor as any;
        const storedToken = localStorage.getItem(STORAGE_KEY);
        const [setup, tokenValid] = await Promise.all([
          a.isAdminSetup ? a.isAdminSetup() : Promise.resolve(false),
          storedToken && a.verifyAdminToken
            ? a.verifyAdminToken(storedToken)
            : Promise.resolve(false),
        ]);
        if (!cancelled) {
          setIsSetup(setup);
          if (tokenValid) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem(STORAGE_KEY);
            setSessionToken(null);
            setIsAuthenticated(false);
          }
        }
      } catch {
        if (!cancelled) {
          setIsAuthenticated(false);
          setIsSetup(false);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [actor]);

  const login = useCallback(
    async (identifier: string, password: string): Promise<boolean> => {
      if (!actor) return false;
      const token = await (actor as any).adminLogin(identifier, password);
      if (token) {
        localStorage.setItem(STORAGE_KEY, token);
        setSessionToken(token);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    },
    [actor],
  );

  const logout = useCallback(async () => {
    const storedToken = localStorage.getItem(STORAGE_KEY);
    if (actor && storedToken) {
      try {
        await (actor as any).adminLogout(storedToken);
      } catch {
        // ignore
      }
    }
    localStorage.removeItem(STORAGE_KEY);
    setSessionToken(null);
    setIsAuthenticated(false);
  }, [actor]);

  const setupAdmin = useCallback(
    async (identifier: string, password: string): Promise<boolean> => {
      if (!actor) return false;
      const ok = await (actor as any).setupAdmin(identifier, password);
      if (ok) {
        setIsSetup(true);
        return login(identifier, password);
      }
      return false;
    },
    [actor, login],
  );

  return {
    sessionToken,
    isAuthenticated,
    isLoading,
    isSetup,
    login,
    logout,
    setupAdmin,
  };
}
