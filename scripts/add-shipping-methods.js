#!/usr/bin/env node

const API_URL = 'https://bestelectronics.saleor.cloud/graphql/';
const APP_TOKEN = 'k87Z0cVj0OG95NelkWTz12XvyZfnyp';
const CHANNEL = 'default-channel';

async function graphqlRequest(query, variables = {}) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${APP_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();

  if (result.errors) {
    console.error('❌ GraphQL Errors:', JSON.stringify(result.errors, null, 2));
    throw new Error('GraphQL request failed');
  }

  return result.data;
}

async function getChannelId() {
  console.log('🔍 Получаю ID канала...');

  const query = `
    query {
      channel(slug: "${CHANNEL}") {
        id
        name
      }
    }
  `;

  const data = await graphqlRequest(query);

  if (!data.channel) {
    throw new Error(`Канал "${CHANNEL}" не найден`);
  }

  console.log(`✅ Найден канал: ${data.channel.name} (${data.channel.id})`);
  return data.channel.id;
}

async function getOrCreateWarehouse() {
  console.log('🔍 Проверяю существующие склады...');

  const query = `
    query {
      warehouses(first: 10) {
        edges {
          node {
            id
            name
            slug
          }
        }
      }
    }
  `;

  const data = await graphqlRequest(query);
  const warehouses = data.warehouses.edges;

  if (warehouses.length > 0) {
    console.log(`✅ Найден склад: ${warehouses[0].node.name}`);
    return warehouses[0].node.id;
  }

  console.log('📦 Создаю новый склад...');

  const createMutation = `
    mutation CreateWarehouse($input: WarehouseCreateInput!) {
      warehouseCreate(input: $input) {
        warehouse {
          id
          name
        }
        errors {
          field
          message
        }
      }
    }
  `;

  const createData = await graphqlRequest(createMutation, {
    input: {
      name: 'Основной склад',
      slug: 'main-warehouse',
      address: {
        country: 'KG',
        city: 'Бишкек',
        streetAddress1: 'Чингиза Айтматова',
        postalCode: '720000',
      },
    },
  });

  if (createData.warehouseCreate.errors.length > 0) {
    console.error('❌ Ошибки при создании склада:', createData.warehouseCreate.errors);
  } else {
    console.log(`✅ Склад создан: ${createData.warehouseCreate.warehouse.name}`);
  }

  return createData.warehouseCreate.warehouse.id;
}

async function createShippingZone(warehouseId, channelId) {
  console.log('\n🌍 Создаю зону доставки для Кыргызстана...');

  const mutation = `
    mutation CreateShippingZone($input: ShippingZoneCreateInput!) {
      shippingZoneCreate(input: $input) {
        shippingZone {
          id
          name
          countries {
            code
            country
          }
        }
        errors {
          field
          message
        }
      }
    }
  `;

  const data = await graphqlRequest(mutation, {
    input: {
      name: 'Кыргызстан',
      countries: ['KG'],
      addWarehouses: [warehouseId],
      addChannels: [channelId],
    },
  });

  if (data.shippingZoneCreate.errors.length > 0) {
    console.error('❌ Ошибки при создании зоны:', data.shippingZoneCreate.errors);
    return null;
  }

  console.log(`✅ Зона доставки создана: ${data.shippingZoneCreate.shippingZone.name}`);
  return data.shippingZoneCreate.shippingZone.id;
}

async function createShippingMethod(zoneId, methodData, channelId) {
  console.log(`\n📦 Создаю метод доставки: ${methodData.name}...`);

  // Сначала создаём метод доставки
  const createMutation = `
    mutation CreateShippingPrice($input: ShippingPriceInput!) {
      shippingPriceCreate(input: $input) {
        shippingMethod {
          id
          name
        }
        errors {
          field
          message
          code
        }
      }
    }
  `;

  const createData = await graphqlRequest(createMutation, {
    input: {
      name: methodData.name,
      shippingZone: zoneId,
      type: 'PRICE',
    },
  });

  if (createData.shippingPriceCreate.errors.length > 0) {
    console.error(`❌ Ошибки при создании метода "${methodData.name}":`, createData.shippingPriceCreate.errors);
    return null;
  }

  const methodId = createData.shippingPriceCreate.shippingMethod.id;

  // Теперь добавляем канал с ценой
  const updateMutation = `
    mutation UpdateShippingPrice($id: ID!, $input: ShippingPriceInput!) {
      shippingPriceUpdate(id: $id, input: $input) {
        shippingMethod {
          id
          name
        }
        errors {
          field
          message
          code
        }
      }
    }
  `;

  const updateData = await graphqlRequest(updateMutation, {
    id: methodId,
    input: {
      name: methodData.name,
      type: 'PRICE',
    },
  });

  if (updateData.shippingPriceUpdate.errors.length > 0) {
    console.error(`❌ Ошибки при обновлении метода "${methodData.name}":`, updateData.shippingPriceUpdate.errors);
  }

  // Добавляем канал отдельно
  const channelMutation = `
    mutation AddShippingMethodChannel($id: ID!, $input: ShippingMethodChannelListingInput!) {
      shippingMethodChannelListingUpdate(id: $id, input: $input) {
        shippingMethod {
          id
          name
        }
        errors {
          field
          message
          code
        }
      }
    }
  `;

  const channelData = await graphqlRequest(channelMutation, {
    id: methodId,
    input: {
      addChannels: [{
        channelId: channelId,
        price: methodData.price,
      }],
    },
  });

  if (channelData.shippingMethodChannelListingUpdate.errors.length > 0) {
    console.error(`❌ Ошибки при добавлении канала:`, channelData.shippingMethodChannelListingUpdate.errors);
    return null;
  }

  console.log(`✅ Метод создан: ${methodData.name} - ${methodData.price} сом`);
  return methodId;
}

async function getExistingShippingZones() {
  console.log('🔍 Проверяю существующие зоны доставки...');

  const query = `
    query {
      shippingZones(first: 10) {
        edges {
          node {
            id
            name
            countries {
              code
            }
          }
        }
      }
    }
  `;

  const data = await graphqlRequest(query);
  return data.shippingZones.edges;
}

async function main() {
  console.log('🚀 Начинаю настройку методов доставки...\n');

  try {
    // Получаем ID канала
    const channelId = await getChannelId();

    // Проверяем существующие зоны
    const existingZones = await getExistingShippingZones();
    let zoneId = null;

    // Ищем зону для Кыргызстана
    const kgZone = existingZones.find(edge =>
      edge.node.countries.some(c => c.code === 'KG')
    );

    if (kgZone) {
      console.log(`✅ Найдена существующая зона: ${kgZone.node.name}`);
      zoneId = kgZone.node.id;
    } else {
      // Создаем склад и зону
      const warehouseId = await getOrCreateWarehouse();
      zoneId = await createShippingZone(warehouseId, channelId);
    }

    if (!zoneId) {
      throw new Error('Не удалось создать или найти зону доставки');
    }

    // Создаем методы доставки
    const shippingMethods = [
      {
        name: 'Стандартная доставка',
        price: 250,
      },
      {
        name: 'Экспресс доставка',
        price: 500,
      },
      {
        name: 'Самовывоз из офиса',
        price: 0,
      },
    ];

    for (const method of shippingMethods) {
      await createShippingMethod(zoneId, method, channelId);
    }

    console.log('\n✅ Все методы доставки успешно добавлены!');
    console.log('\n📋 Добавлены следующие методы:');
    console.log('  • Стандартная доставка - 250 сом');
    console.log('  • Экспресс доставка - 500 сом');
    console.log('  • Самовывоз из офиса - 0 сом (бесплатно)');

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    process.exit(1);
  }
}

main();
