"use client";

import { useEffect, useMemo, useState } from "react";
import shopService from "@/services/shopService";
import type { Product, ProductCategory, ProductTag, Order } from "@/shared/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCcw } from "lucide-react";
import LoadingSkeleton from "@/shared/ui/LoadingSkeleton";

interface ProductForm {
  title: string;
  slug: string;
  price: number;
  currency: string;
  stock: number;
  categoryId?: string;
  description?: string;
  images: string;
  isActive: boolean;
}

interface CategoryForm {
  name: string;
  slug: string;
  description?: string;
}

interface TagForm {
  name: string;
  slug: string;
}

const INITIAL_PRODUCT_FORM: ProductForm = {
  title: "",
  slug: "",
  price: 0,
  currency: "RUB",
  stock: 0,
  categoryId: undefined,
  description: "",
  images: "",
  isActive: true,
};

const INITIAL_CATEGORY_FORM: CategoryForm = {
  name: "",
  slug: "",
  description: "",
};

const INITIAL_TAG_FORM: TagForm = {
  name: "",
  slug: "",
};

export default function AdminShopPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [productForm, setProductForm] = useState<ProductForm>(INITIAL_PRODUCT_FORM);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(INITIAL_CATEGORY_FORM);
  const [tagForm, setTagForm] = useState<TagForm>(INITIAL_TAG_FORM);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingTag, setSavingTag] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productList, categoryList, tagList, orderList] = await Promise.all([
        shopService.listProducts(),
        shopService.listCategories(),
        shopService.listTags(),
        shopService.listOrders(),
      ]);
      setProducts(productList);
      setCategories(categoryList);
      setTags(tagList);
      setOrders(orderList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categoryMap = useMemo(() => new Map(categories.map((category) => [category._id, category])), [categories]);

  const handleCreateProduct = async () => {
    if (!productForm.title || !productForm.slug) return;
    setSavingProduct(true);
    try {
      const payload: Omit<Product, "_id" | "createdAt" | "updatedAt"> = {
        title: productForm.title,
        slug: productForm.slug,
        price: Number(productForm.price) || 0,
        currency: productForm.currency,
        stock: Number(productForm.stock) || 0,
        categoryId: productForm.categoryId || undefined,
        description: productForm.description?.trim() ? productForm.description.trim() : undefined,
        images: productForm.images
          .split("\n")
          .map((url) => url.trim())
          .filter(Boolean),
        isActive: productForm.isActive,
        tags: [],
      };
      await shopService.createProduct(payload);
      setProductForm(INITIAL_PRODUCT_FORM);
      await loadData();
    } finally {
      setSavingProduct(false);
    }
  };

  const handleToggleProduct = async (product: Product) => {
    await shopService.updateProduct(product._id!, { isActive: !product.isActive });
    await loadData();
  };

  const handleDeleteProduct = async (product: Product) => {
    await shopService.deleteProduct(product._id!);
    await loadData();
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.name || !categoryForm.slug) return;
    setSavingCategory(true);
    try {
      await shopService.createCategory({
        name: categoryForm.name,
        slug: categoryForm.slug,
        description: categoryForm.description?.trim() || undefined,
      });
      setCategoryForm(INITIAL_CATEGORY_FORM);
      await loadData();
    } finally {
      setSavingCategory(false);
    }
  };

  const handleCreateTag = async () => {
    if (!tagForm.name || !tagForm.slug) return;
    setSavingTag(true);
    try {
      await shopService.createTag({ name: tagForm.name, slug: tagForm.slug });
      setTagForm(INITIAL_TAG_FORM);
      await loadData();
    } finally {
      setSavingTag(false);
    }
  };

  if (loading) return <LoadingSkeleton className="h-96 w-full" />;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Управление магазином</h1>
          <p className="text-sm text-muted-foreground">Каталог товаров, категории, фильтры и заказы</p>
        </div>
        <Button variant="outline" className="rounded-2xl" onClick={loadData}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Обновить данные
        </Button>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="w-full justify-start rounded-2xl bg-slate-100 p-1">
          <TabsTrigger value="products" className="rounded-2xl">Товары</TabsTrigger>
          <TabsTrigger value="categories" className="rounded-2xl">Категории</TabsTrigger>
          <TabsTrigger value="tags" className="rounded-2xl">Теги</TabsTrigger>
          <TabsTrigger value="orders" className="rounded-2xl">Заказы</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
            <Card className="border border-border/70 bg-white/95 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Каталог товаров</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead>Остаток</TableHead>
                      <TableHead>Активен</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell className="font-medium">{product.title}</TableCell>
                        <TableCell>{product.categoryId ? categoryMap.get(product.categoryId)?.name ?? "—" : "—"}</TableCell>
                        <TableCell>{product.price.toLocaleString("ru-RU")}&nbsp;{product.currency}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          <Switch
                            checked={product.isActive}
                            onCheckedChange={() => handleToggleProduct(product)}
                            aria-label="Статус публикации"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product)}>
                            Удалить
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {products.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                          Товары ещё не добавлены
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border border-border/70 bg-white/95 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Добавить товар</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <Label htmlFor="product-title">Название*</Label>
                  <Input
                    id="product-title"
                    value={productForm.title}
                    onChange={(event) => setProductForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Например, Ультрабук Pro 14"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="product-slug">Слаг*</Label>
                  <Input
                    id="product-slug"
                    value={productForm.slug}
                    onChange={(event) => setProductForm((prev) => ({ ...prev, slug: event.target.value }))}
                    placeholder="ultrabook-pro-14"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="product-price">Цена</Label>
                    <Input
                      id="product-price"
                      type="number"
                      value={productForm.price}
                      onChange={(event) => setProductForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-stock">Остаток</Label>
                    <Input
                      id="product-stock"
                      type="number"
                      value={productForm.stock}
                      onChange={(event) => setProductForm((prev) => ({ ...prev, stock: Number(event.target.value) }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="product-currency">Валюта</Label>
                    <Input
                      id="product-currency"
                      value={productForm.currency}
                      onChange={(event) => setProductForm((prev) => ({ ...prev, currency: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Категория</Label>
                    <Select
                      value={productForm.categoryId ?? ""}
                      onValueChange={(value) => setProductForm((prev) => ({ ...prev, categoryId: value || undefined }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Не выбрано" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Без категории</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id!}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-description">Описание</Label>
                  <Textarea
                    id="product-description"
                    value={productForm.description}
                    onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))}
                    rows={4}
                    placeholder="Краткое описание характеристик"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-images">Изображения (каждый URL с новой строки)</Label>
                  <Textarea
                    id="product-images"
                    value={productForm.images}
                    onChange={(event) => setProductForm((prev) => ({ ...prev, images: event.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-dashed border-border/70 px-4 py-3 text-sm">
                  <span>Публиковать сразу</span>
                  <Switch
                    checked={productForm.isActive}
                    onCheckedChange={(checked) => setProductForm((prev) => ({ ...prev, isActive: checked }))}
                  />
                </div>
                <Button
                  className="w-full rounded-2xl"
                  onClick={handleCreateProduct}
                  disabled={savingProduct}
                >
                  {savingProduct ? <Loader2 className="h-4 w-4 animate-spin" /> : "Создать товар"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_360px]">
            <Card className="border border-border/70 bg-white/95 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Список категорий</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.length === 0 && (
                  <p className="text-sm text-muted-foreground">Категории ещё не созданы</p>
                )}
                {categories.map((category) => (
                  <div key={category._id} className="rounded-2xl border border-border/70 bg-white px-4 py-3">
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs text-muted-foreground">/{category.slug}</div>
                    {category.description && (
                      <div className="mt-2 text-xs text-muted-foreground">{category.description}</div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border border-border/70 bg-white/95 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Добавить категорию</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Название*</Label>
                  <Input
                    id="category-name"
                    value={categoryForm.name}
                    onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-slug">Слаг*</Label>
                  <Input
                    id="category-slug"
                    value={categoryForm.slug}
                    onChange={(event) => setCategoryForm((prev) => ({ ...prev, slug: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-description">Описание</Label>
                  <Textarea
                    id="category-description"
                    value={categoryForm.description}
                    onChange={(event) => setCategoryForm((prev) => ({ ...prev, description: event.target.value }))}
                    rows={3}
                  />
                </div>
                <Button className="w-full rounded-2xl" onClick={handleCreateCategory} disabled={savingCategory}>
                  {savingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : "Создать категорию"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tags" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_360px]">
            <Card className="border border-border/70 bg-white/95 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Теги</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tags.length === 0 && <p className="text-sm text-muted-foreground">Теги пока отсутствуют</p>}
                {tags.map((tag) => (
                  <div key={tag._id} className="rounded-2xl border border-border/70 bg-white px-4 py-3">
                    <div className="font-medium">{tag.name}</div>
                    <div className="text-xs text-muted-foreground">/{tag.slug}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border border-border/70 bg-white/95 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Добавить тег</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tag-name">Название*</Label>
                  <Input
                    id="tag-name"
                    value={tagForm.name}
                    onChange={(event) => setTagForm((prev) => ({ ...prev, name: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tag-slug">Слаг*</Label>
                  <Input
                    id="tag-slug"
                    value={tagForm.slug}
                    onChange={(event) => setTagForm((prev) => ({ ...prev, slug: event.target.value }))}
                  />
                </div>
                <Button className="w-full rounded-2xl" onClick={handleCreateTag} disabled={savingTag}>
                  {savingTag ? <Loader2 className="h-4 w-4 animate-spin" /> : "Создать тег"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card className="border border-border/70 bg-white/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Заказы</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Позиции</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-mono text-xs">{order._id?.slice(-8)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{order.address.fullName}</div>
                        <div className="text-xs text-muted-foreground">{order.address.phone}</div>
                      </TableCell>
                      <TableCell>{order.items.length}</TableCell>
                      <TableCell>{order.total.toLocaleString("ru-RU")}&nbsp;{order.currency}</TableCell>
                      <TableCell className="uppercase tracking-wide text-xs text-muted-foreground">{order.status}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString("ru-RU") : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                        Заказы ещё не оформлялись
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
