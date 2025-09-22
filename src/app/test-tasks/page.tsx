"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: "Ожидает" | "В работе" | "Завершена";
  laptopModel: string;
  createdAt: string;
}

export default function TestTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    laptopModel: "",
  });

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data.items || []);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.title || !newTask.description || !newTask.laptopModel) {
      alert("Заполните все поля");
      return;
    }

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        setNewTask({ title: "", description: "", laptopModel: "" });
        loadTasks();
        alert("Задача добавлена успешно!");
      } else {
        alert("Ошибка при добавлении задачи");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Ошибка при добавлении задачи");
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Тестовая страница задач</h1>
      
      {/* Форма добавления задачи */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Добавить новую задачу</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            placeholder="Название задачи"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <Input
            placeholder="Модель ноутбука"
            value={newTask.laptopModel}
            onChange={(e) => setNewTask({ ...newTask, laptopModel: e.target.value })}
          />
        </div>
        <Textarea
          placeholder="Описание задачи"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          className="mb-4"
        />
        <Button onClick={addTask}>Добавить задачу</Button>
      </div>

      {/* Список задач */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Список задач</h2>
        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Модель ноутбука</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата создания</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Задач не найдено
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task._id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>{task.laptopModel}</TableCell>
                    <TableCell>{task.status}</TableCell>
                    <TableCell>
                      {new Date(task.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}