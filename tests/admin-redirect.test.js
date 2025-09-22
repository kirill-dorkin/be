/**
 * E2E тест для проверки автоматического перенаправления администратора
 */

const { test, expect } = require('@playwright/test');

test.describe('Автоматическое перенаправление администратора', () => {
  test.beforeEach(async ({ page }) => {
    // Очищаем cookies перед каждым тестом
    await page.context().clearCookies();
    // Очищаем localStorage только если доступен
    try {
      await page.evaluate(() => localStorage.clear());
    } catch (error) {
      // Игнорируем ошибки доступа к localStorage
    }
  });

  test('Администратор автоматически перенаправляется на /admin после логина', async ({ page }) => {
    // Переходим на страницу логина
    await page.goto('http://localhost:3000/login');
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что мы на странице логина
    expect(page.url()).toContain('/login');
    
    // Заполняем форму логина
    await page.fill('input[type="email"]', 'admin@be.kg');
    await page.fill('input[type="password"]', 'admin123');
    
    // Нажимаем кнопку входа
    await page.click('button[type="submit"]');
    
    // Ждем перенаправления
    await page.waitForURL('**/admin**', { timeout: 10000 });
    
    // Проверяем, что мы перенаправлены на админ панель
    expect(page.url()).toContain('/admin');
  });

  test('Обычный пользователь перенаправляется на главную страницу', async ({ page }) => {
    // Переходим на страницу логина
    await page.goto('http://localhost:3001/login');
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
    
    // Заполняем форму логина с данными обычного пользователя
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Нажимаем кнопку входа
    await page.click('button[type="submit"]');
    
    // Ждем перенаправления на главную страницу
    await page.waitForURL('http://localhost:3001/', { timeout: 10000 });
    
    // Проверяем, что мы на главной странице
    expect(page.url()).toBe('http://localhost:3001/');
  });

  test('Неавторизованный пользователь не может получить доступ к /admin', async ({ page }) => {
    // Пытаемся перейти на админ панель без авторизации
    await page.goto('http://localhost:3001/admin');
    
    // Ждем перенаправления на страницу логина
    await page.waitForURL('**/login**', { timeout: 10000 });
    
    // Проверяем, что мы перенаправлены на страницу логина
    expect(page.url()).toContain('/login');
  });

  test('Авторизованный администратор может получить доступ к /admin напрямую', async ({ page }) => {
    // Сначала логинимся
    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'admin@be.kg');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Ждем перенаправления на админ панель
    await page.waitForURL('**/admin**', { timeout: 10000 });
    
    // Теперь пытаемся перейти на админ панель напрямую
    await page.goto('http://localhost:3001/admin');
    
    // Проверяем, что мы остались на админ панели
    expect(page.url()).toContain('/admin');
  });
});