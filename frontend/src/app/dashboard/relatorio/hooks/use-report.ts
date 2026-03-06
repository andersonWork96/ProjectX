import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { MeResponse } from "../../../../lib/types/auth";
import type { ReportItem } from "../../../../lib/types/report";
import { toErrorMessage } from "../../../../lib/errors";
import { me } from "../../login/service/auth.service";
import { listReports } from "../service/report.service";

export function useReport() {
  const router = useRouter();
  const [user, setUser] = useState<MeResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [items, setItems] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadItems = useCallback(async () => {
    const data = await listReports();
    setItems(data);
  }, []);

  useEffect(() => {
    const run = async () => {
      const token = localStorage.getItem("projectx_token") ?? "";
      if (!token) {
        router.push("/dashboard/login");
        return;
      }

      try {
        const data = await me(token);
        setUser(data);
        await loadItems();
      } catch (err) {
        setMessage(toErrorMessage(err));
      }
    };

    void run();
  }, [loadItems, router]);

  const signOut = useCallback(() => {
    localStorage.removeItem("projectx_token");
    router.push("/dashboard/login");
  }, [router]);

  return {
    user,
    message,
    setMessage,
    items,
    setItems,
    loading,
    setLoading,
    loadItems,
    signOut,
  };
}
