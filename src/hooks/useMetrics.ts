"use client"
import { useState, useEffect } from "react";
import axios from "axios";

interface Metrics {
  totalUsers: number;
  totalDevices: number;
  totalServices: number;
  totalOrders: number;
  [key: string]: number;
}

const useMetrics = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get("/api/dashboard/get-key-metrics");

        if (response.status === 200) {
          setMetrics(response.data.metrics);
        } else {
          throw new Error("Failed to fetch metrics");
        }
      } catch (err) {
        setError((err as { message: string }).message || "An error occurred while fetching metrics.");
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
