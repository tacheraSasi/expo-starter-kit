import Api from "@/lib/api";
import { UserInsights } from "@/lib/api/types";
import { useEffect, useState } from "react";
import { toast } from "yooo-native";

export function useInsights() {
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      setError(null);
      const data = await Api.getUserInsights();
      setInsights(data);
    } catch (error) {
      toast.error(
        "Failed to fetch insights. Please check your connection and try again."
      );
      setError(
        error instanceof Error ? error.message : "Failed to fetch insights"
      );
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await fetchInsights();
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return {
    insights,
    loading,
    error,
    refresh,
  };
}
