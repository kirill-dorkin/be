"use client"
import { useState, useEffect } from "react";
import axios from "axios";

const useMetrics = () => {
  const [metrics, setMetrics] = useState<Record<string, number | string> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get("/api/dashboard/get-key-metrics");

        if (response.status === 200) {
          setMetrics(response.data.metrics);
        } else {
          throw new Error("Не удалось загрузить метрики");
        }
      } catch (err) {
        setError((err as { message: string }).message || "Произошла ошибка при загрузке метрик.");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    error,
  };
};

export default useMetrics;
