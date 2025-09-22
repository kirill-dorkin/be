"use client";
import { useState, useEffect } from "react";

export const useUsers = (page: string, perPage: string) => {
  const [users, setUsers] = useState<Array<Record<string, string | number | boolean>>>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`/api/users/get-all-users?page=${page}&per_page=${perPage}`);
        if (!response.ok) {
          throw new Error("Не удалось загрузить пользователей");
        }
        const data = await response.json();
        if (data.status === "success") {
          setUsers(data.items);
          setTotalItems(data.totalItemsLength);
        } else {
          throw new Error(data.message || "Не удалось загрузить пользователей");
        }
      } catch (err) {
        setError((err as { message: string }).message || "Что-то пошло не так");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, perPage]);

  return { users, totalItems, loading, error };
};

