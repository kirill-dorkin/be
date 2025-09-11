import { Suspense } from 'react';
import { connectToDatabase } from '@/lib/dbConnect';
import Product from '@/models/Product';
import ProductCatalog from '@/components/shop/ProductCatalog';
import BaseContainer from '@/components/BaseContainer';
import Spinner from '@/components/ui/spinner';
import ButtonsWrapper from '@/components/ButtonsWrapper';

interface SearchParams {
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

interface ProductsPageProps {
  searchParams: Promise<SearchParams>;
}

async function getProducts(params: SearchParams) {
  try {
    await connectToDatabase();
    
    const {
      search = '',
      category = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '12'
    } = params;
    
    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const skip = (currentPage - 1) * itemsPerPage;
    
    // Построение фильтра
    interface ProductFilter {
      name?: { $regex: string; $options: string };
      category?: string;
    }
    
    const filter: ProductFilter = {};
    
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    
    if (category) {
      filter.category = category;
    }
    
    // Построение сортировки
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Получение товаров
    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(itemsPerPage)
        .lean(),
      Product.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    
    return {
      products: JSON.parse(JSON.stringify(products)),
      totalPages,
      currentPage,
      totalCount
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      products: [],
      totalPages: 1,
      currentPage: 1,
      totalCount: 0
    };
  }
}

async function getCategories() {
  try {
    await connectToDatabase();
    
    const categories = await Product.distinct('category');
    return categories.filter(Boolean); // Убираем пустые значения
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const [productsData, categories] = await Promise.all([
    getProducts(params),
    getCategories()
  ]);
  
  return (
    <BaseContainer>
      <div className="py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">Каталог товаров</h1>
            <ButtonsWrapper />
          </div>
          <p className="text-gray-600">
            Найдено товаров: {productsData.totalCount}
          </p>
        </div>
        
        <Suspense fallback={
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        }>
          <ProductCatalog
            initialProducts={productsData.products}
            categories={categories}
          />
        </Suspense>
      </div>
    </BaseContainer>
  );
}

// Метаданные страницы
export const metadata = {
  title: 'Каталог товаров',
  description: 'Просмотрите наш каталог товаров с возможностью фильтрации и поиска'
};