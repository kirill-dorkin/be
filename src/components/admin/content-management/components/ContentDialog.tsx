import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Save,
  X,
  Code,
  Image,
  Link,
  Settings
} from 'lucide-react';
import { ContentFormData, TEMPLATES, STATUS_OPTIONS } from '../types';

interface ContentDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  formData: ContentFormData;
  onFormDataChange: (updates: Partial<ContentFormData>) => void;
  onTitleChange: (title: string) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  title: string;
  description: string;
  loading?: boolean;
}

export function ContentDialog({
  open,
  onClose,
  onSave,
  formData,
  onFormDataChange,
  onTitleChange,
  onAddTag,
  onRemoveTag,
  activeTab,
  onTabChange,
  title,
  description,
  loading = false
}: ContentDialogProps) {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Контент
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Медиа
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="Введите название страницы"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL (slug)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => onFormDataChange({ slug: e.target.value })}
                  placeholder="url-stranitsy"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Содержимое</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => onFormDataChange({ content: e.target.value })}
                placeholder="Введите содержимое страницы"
                className="min-h-[300px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Мета-описание</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => onFormDataChange({ metaDescription: e.target.value })}
                placeholder="Краткое описание страницы для поисковых систем"
                maxLength={160}
              />
              <div className="text-sm text-gray-500">
                {formData.metaDescription.length}/160 символов
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="metaKeywords">Ключевые слова</Label>
              <Input
                id="metaKeywords"
                value={formData.metaKeywords}
                onChange={(e) => onFormDataChange({ metaKeywords: e.target.value })}
                placeholder="ключевое слово, другое слово, третье слово"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Теги</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Добавить тег"
                  className="flex-1"
                />
                <Button onClick={handleAddTag} type="button">
                  Добавить
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => onRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="featuredImage">Изображение</Label>
              <Input
                id="featuredImage"
                value={formData.featuredImage}
                onChange={(e) => onFormDataChange({ featuredImage: e.target.value })}
                placeholder="URL изображения"
              />
            </div>
            
            {formData.featuredImage && (
              <div className="space-y-2">
                <Label>Предпросмотр</Label>
                <div className="border rounded-lg p-4">
                  <img
                    src={formData.featuredImage}
                    alt="Предпросмотр"
                    className="max-w-full h-auto max-h-48 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Статус</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'draft' | 'published' | 'archived') => 
                    onFormDataChange({ status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template">Шаблон</Label>
                <Select
                  value={formData.template}
                  onValueChange={(value: 'default' | 'landing' | 'blog' | 'custom') => 
                    onFormDataChange({ template: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATES.map((template) => (
                      <SelectItem key={template.value} value={template.value}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => 
                  onFormDataChange({ isPublic: checked as boolean })
                }
              />
              <Label htmlFor="isPublic">Публичная страница</Label>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={onSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}