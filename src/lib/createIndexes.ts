import mongoose from 'mongoose';
import clientPromise from './mongodb';

/**
 * Создание индексов для оптимизации производительности базы данных
 */
export async function createDatabaseIndexes() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    if (!db) {
      throw new Error('Database connection not established');
    }

    console.log('Creating database indexes...');

    // Индексы для коллекции products
    await db.collection('products').createIndexes([
      { key: { name: 'text', description: 'text' }, name: 'text_search' },
      { key: { category: 1 }, name: 'category_index' },
      { key: { price: 1 }, name: 'price_index' },
      { key: { createdAt: -1 }, name: 'created_desc' },
      { key: { inStock: 1, category: 1 }, name: 'stock_category_compound' },
      { key: { featured: 1, createdAt: -1 }, name: 'featured_recent' }
    ]);

    // Индексы для коллекции orders
    await db.collection('orders').createIndexes([
      { key: { userId: 1, createdAt: -1 }, name: 'user_orders' },
      { key: { status: 1 }, name: 'order_status' },
      { key: { createdAt: -1 }, name: 'order_date_desc' },
      { key: { 'items.productId': 1 }, name: 'order_products' },
      { key: { status: 1, createdAt: -1 }, name: 'status_date_compound' },
      { key: { total: -1 }, name: 'order_total_desc' }
    ]);

    // Индексы для коллекции users
    await db.collection('users').createIndexes([
      { key: { email: 1 }, name: 'email_unique', unique: true },
      { key: { role: 1 }, name: 'user_role' },
      { key: { createdAt: -1 }, name: 'user_created_desc' },
      { key: { lastLogin: -1 }, name: 'last_login_desc' },
      { key: { isActive: 1, role: 1 }, name: 'active_role_compound' }
    ]);

    // Индексы для коллекции categories
    await db.collection('categories').createIndexes([
      { key: { name: 1 }, name: 'category_name', unique: true },
      { key: { slug: 1 }, name: 'category_slug', unique: true },
      { key: { parentId: 1 }, name: 'category_parent' },
      { key: { isActive: 1, sortOrder: 1 }, name: 'active_sort_compound' }
    ]);

    // Индексы для коллекции reviews (если есть)
    await db.collection('reviews').createIndexes([
      { key: { productId: 1, createdAt: -1 }, name: 'product_reviews' },
      { key: { userId: 1 }, name: 'user_reviews' },
      { key: { rating: -1 }, name: 'rating_desc' },
      { key: { isApproved: 1, createdAt: -1 }, name: 'approved_recent' }
    ]);

    // Индексы для коллекции cart
    await db.collection('cart').createIndexes([
      { key: { userId: 1 }, name: 'cart_user', unique: true },
      { key: { 'items.productId': 1 }, name: 'cart_products' },
      { key: { updatedAt: -1 }, name: 'cart_updated_desc' }
    ]);

    // Индексы для коллекции sessions (если используется database sessions)
    await db.collection('sessions').createIndexes([
      { key: { expires: 1 }, name: 'session_expires', expireAfterSeconds: 0 },
      { key: { sessionToken: 1 }, name: 'session_token', unique: true },
      { key: { userId: 1 }, name: 'session_user' }
    ]);

    // Индексы для коллекции analytics/logs
    await db.collection('analytics').createIndexes([
      { key: { event: 1, createdAt: -1 }, name: 'event_time' },
      { key: { userId: 1, createdAt: -1 }, name: 'user_analytics' },
      { key: { createdAt: -1 }, name: 'analytics_time_desc' },
      { key: { createdAt: 1 }, name: 'analytics_ttl', expireAfterSeconds: 2592000 } // 30 дней TTL
    ]);

    console.log('Database indexes created successfully!');
    
    // Получаем статистику по индексам
    const collections = ['products', 'orders', 'users', 'categories'];
    for (const collectionName of collections) {
      try {
        const indexes = await db.collection(collectionName).listIndexes().toArray();
        console.log(`${collectionName} indexes:`, indexes.map(idx => idx.name));
      } catch (error) {
        console.log(`Collection ${collectionName} might not exist yet`);
      }
    }
    
  } catch (error) {
    console.error('Error creating database indexes:', error);
    throw error;
  }
}

/**
 * Анализ производительности индексов
 */
export async function analyzeIndexPerformance() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    if (!db) {
      throw new Error('Database connection not established');
    }

    console.log('Analyzing index performance...');
    
    const collections = ['products', 'orders', 'users'];
    const stats: any = {};
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        
        // Получаем статистику коллекции
        const collStats = await db.command({ collStats: collectionName });
        
        // Получаем информацию об индексах
        const indexStats = await collection.aggregate([
          { $indexStats: {} }
        ]).toArray();
        
        stats[collectionName] = {
          documentCount: collStats.count,
          avgDocumentSize: collStats.avgObjSize,
          totalIndexSize: collStats.totalIndexSize,
          indexes: indexStats.map(idx => ({
            name: idx.name,
            usageCount: idx.accesses?.ops || 0,
            usageSince: idx.accesses?.since
          }))
        };
        
      } catch (error) {
        console.log(`Could not analyze collection ${collectionName}:`, (error as Error).message);
      }
    }
    
    console.log('Index performance analysis:', JSON.stringify(stats, null, 2));
    return stats;
    
  } catch (error) {
    console.error('Error analyzing index performance:', error);
    throw error;
  }
}

/**
 * Удаление неиспользуемых индексов
 */
export async function removeUnusedIndexes(dryRun: boolean = true) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    if (!db) {
      throw new Error('Database connection not established');
    }

    console.log('Checking for unused indexes...');
    
    const collections = ['products', 'orders', 'users', 'categories'];
    const unusedIndexes: any[] = [];
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        
        const indexStats = await collection.aggregate([
          { $indexStats: {} }
        ]).toArray();
        
        for (const idx of indexStats) {
          // Индекс считается неиспользуемым, если к нему не было обращений
          // или обращений было очень мало
          if (idx.name !== '_id_' && (!idx.accesses?.ops || idx.accesses.ops < 10)) {
            unusedIndexes.push({
              collection: collectionName,
              indexName: idx.name,
              usageCount: idx.accesses?.ops || 0
            });
            
            if (!dryRun) {
              await collection.dropIndex(idx.name);
              console.log(`Dropped unused index: ${collectionName}.${idx.name}`);
            }
          }
        }
        
      } catch (error) {
        console.log(`Could not check collection ${collectionName}:`, (error as Error).message);
      }
    }
    
    if (dryRun) {
      console.log('Unused indexes (dry run):', unusedIndexes);
    } else {
      console.log('Removed unused indexes:', unusedIndexes);
    }
    
    return unusedIndexes;
    
  } catch (error) {
    console.error('Error removing unused indexes:', error);
    throw error;
  }
}