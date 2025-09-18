"use client";
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateTaskDialogProps {
  onTaskCreated?: () => void;
  trigger?: React.ReactNode;
}

export default function CreateTaskDialog({ onTaskCreated, trigger }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Pending',
    priority: 'Medium',
    assignedTo: '',
    dueDate: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успех',
          description: 'Задача успешно создана'
        });
        
        setFormData({
          title: '',
          description: '',
          status: 'Pending',
          priority: 'Medium',
          assignedTo: '',
          dueDate: ''
        });
        
        setOpen(false);
        
        if (onTaskCreated) {
          onTaskCreated();
        }
      } else {
        throw new Error(data.error || 'Ошибка при создании задачи');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать задачу',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Создать задачу
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Создать новую задачу</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Введите название задачи"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Описание *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Введите описание задачи"
              rows={3}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Ожидающая</SelectItem>
                  <SelectItem value="In Progress">В работе</SelectItem>
                  <SelectItem value="Completed">Завершенная</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Приоритет</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Низкий</SelectItem>
                  <SelectItem value="Medium">Средний</SelectItem>
                  <SelectItem value="High">Высокий</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Назначено</Label>
            <Input
              id="assignedTo"
              value={formData.assignedTo}
              onChange={(e) => handleInputChange('assignedTo', e.target.value)}
              placeholder="Email или имя исполнителя"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dueDate">Срок выполнения</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Создание...' : 'Создать задачу'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}