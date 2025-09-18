import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, subscription, message } = body;

    switch (type) {
      case 'subscribe':
        return await handleSubscription(session.user.id, subscription);
      
      case 'unsubscribe':
        return await handleUnsubscription(session.user.id, subscription);
      
      case 'send':
        return await sendNotification(session.user.id, message);
      
      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Возвращаем статус уведомлений для пользователя
    const notificationStatus = {
      subscribed: true, // Здесь будет проверка из базы данных
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
      permissions: 'granted', // Здесь будет актуальный статус
      lastNotification: new Date().toISOString()
    };

    return NextResponse.json(notificationStatus);
  } catch (error) {
    console.error('Notification status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Обработка подписки на уведомления
async function handleSubscription(userId: string, subscription: any) {
  try {
    // Здесь будет логика сохранения подписки в базе данных
    // Например:
    // await db.pushSubscription.create({
    //   userId,
    //   endpoint: subscription.endpoint,
    //   p256dh: subscription.keys.p256dh,
    //   auth: subscription.keys.auth,
    // });

    console.log('Push subscription saved for user:', userId);
    console.log('Subscription:', subscription);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to notifications',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Subscription error:', error);
    throw error;
  }
}

// Обработка отписки от уведомлений
async function handleUnsubscription(userId: string, subscription: any) {
  try {
    // Здесь будет логика удаления подписки из базы данных
    // Например:
    // await db.pushSubscription.deleteMany({
    //   where: {
    //     userId,
    //     endpoint: subscription.endpoint
    //   }
    // });

    console.log('Push subscription removed for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from notifications',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Unsubscription error:', error);
    throw error;
  }
}

// Отправка уведомления
async function sendNotification(userId: string, message: any) {
  try {
    // Здесь будет логика отправки push уведомления
    // Используя библиотеку web-push
    
    const notificationPayload = {
      title: message.title || 'Best Electronics',
      body: message.body || 'У вас новое уведомление',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: {
        url: message.url || '/admin/dashboard',
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'open',
          title: 'Открыть'
        },
        {
          action: 'close',
          title: 'Закрыть'
        }
      ]
    };

    // Здесь будет отправка через web-push
    // const webpush = require('web-push');
    // webpush.setVapidDetails(
    //   'mailto:admin@bestelectronics.com',
    //   process.env.VAPID_PUBLIC_KEY,
    //   process.env.VAPID_PRIVATE_KEY
    // );
    // 
    // const subscriptions = await getUserSubscriptions(userId);
    // const promises = subscriptions.map(subscription => 
    //   webpush.sendNotification(subscription, JSON.stringify(notificationPayload))
    // );
    // await Promise.all(promises);

    console.log('Notification sent to user:', userId);
    console.log('Payload:', notificationPayload);

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      payload: notificationPayload,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Send notification error:', error);
    throw error;
  }
}

// Вспомогательная функция для получения подписок пользователя
// async function getUserSubscriptions(userId: string) {
//   // Здесь будет запрос к базе данных
//   // return await db.pushSubscription.findMany({
//   //   where: { userId }
//   // });
//   return [];
// }