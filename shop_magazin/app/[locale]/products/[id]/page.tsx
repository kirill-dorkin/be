import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/dbConnect';
import Product from '@/models/Product';
import ProductDetails from '@/components/shop/ProductDetails';
import BaseContainer from '@/components/BaseContainer';
import mongoose from 'mongoose';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  try {
    // Проверяем валидность ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    await connectToDatabase();
    
    const product = await Product.findById(id).lean();
    
    if (!product) {
      return null;
    }
    
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  
  if (!product) {
    notFound();
  }
  
  return (
    <BaseContainer>
      <div className="py-8">
        <ProductDetails product={product} />
      </div>
    </BaseContainer>
  );
}

// Генерация метаданных
export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  
  if (!product) {
    return {
      title: 'Товар не найден',
      description: 'Запрашиваемый товар не найден'
    };
  }
  
  return {
    title: product.name,
    description: product.description || `Купить ${product.name} по выгодной цене`,
    openGraph: {
      title: product.name,
      description: product.description || `Купить ${product.name} по выгодной цене`,
      images: product.images && product.images.length > 0 ? [product.images[0]] : []
    }
  };
}