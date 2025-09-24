"use client";
import { useEffect, useState } from "react";
import shopService from "@/services/shopService";
import { ProductTag } from "@/shared/types";
import LoadingSkeleton from "@/shared/ui/LoadingSkeleton";

export default function AdminFiltersPage() {
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [form, setForm] = useState({ name: "", slug: "" });

  async function load() {
    setLoading(true);
    try {
      const data = await shopService.listTags();
      setTags(data);
    } finally {
      setLoading(false);
    }
  }

  async function create() {
    if (!form.name || !form.slug) return;
    await shopService.createTag({ name: form.name, slug: form.slug });
    setForm({ name: "", slug: "" });
    await load();
  }

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSkeleton className="h-64 w-full" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Фильтры (теги)</h1>

      <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
        <input className="border rounded-md px-3 py-2 bg-background" placeholder="Название" value={form.name} onChange={e=>setForm(f=>({ ...f, name: e.target.value }))} />
        <input className="border rounded-md px-3 py-2 bg-background" placeholder="Слаг (latin)" value={form.slug} onChange={e=>setForm(f=>({ ...f, slug: e.target.value }))} />
        <button onClick={create} className="px-4 py-2 rounded-md bg-primary text-primary-foreground">Добавить</button>
      </div>

      <div className="grid gap-2">
        {tags.map(t => (
          <div key={t._id} className="border rounded-md px-3 py-2 flex justify-between items-center">
            <div>
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-muted-foreground">/{t.slug}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
