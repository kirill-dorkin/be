'use client'
import { useState, useEffect } from "react";
import axios from "axios";
import { ITask } from "@/entities/task/Task";

const useTasks = (page: string, perPage: string) => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);

      try {
        const response = await axios.get("/api/tasks/get-all-tasks", {
          params: { page, per_page: perPage },
        });

        if (response.status === 200) {
          setTasks(response.data.tasks || []);
        } else {
          throw new Error(response.statusText || "Не удалось загрузить задачи");
        }
      } catch (err) {
        setError((err as { message: string }).message || "Произошла ошибка при загрузке задач.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [page, perPage]);

  return { tasks, loading, error };
};

export default useTasks;

