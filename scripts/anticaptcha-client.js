/**
 * Anti-Captcha API Client
 * Документация: https://anti-captcha.com/apidoc
 */

const axios = require("axios");

const API_URL = "https://api.anti-captcha.com";

class AntiCaptchaClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error("Anti-Captcha API ключ не задан");
    }
    this.apiKey = apiKey;
  }

  /**
   * Получить баланс аккаунта
   */
  async getBalance() {
    try {
      const response = await axios.post(`${API_URL}/getBalance`, {
        clientKey: this.apiKey,
      });

      if (response.data.errorId > 0) {
        throw new Error(
          `Anti-Captcha ошибка: ${response.data.errorCode} - ${response.data.errorDescription}`,
        );
      }

      return response.data.balance;
    } catch (error) {
      if (error.response) {
        throw new Error(
          `Anti-Captcha API ошибка: ${JSON.stringify(error.response.data)}`,
        );
      }
      throw error;
    }
  }

  /**
   * Создать задачу для решения reCAPTCHA v2
   * @param {string} websiteURL - URL страницы с капчей
   * @param {string} websiteKey - Site key (data-sitekey)
   * @returns {Promise<number>} Task ID
   */
  async createRecaptchaV2Task(websiteURL, websiteKey) {
    try {
      console.log(
        `    🔧 Создаю задачу Anti-Captcha для ${websiteURL.substring(0, 50)}...`,
      );
      console.log(`    🔑 Site key: ${websiteKey}`);

      const response = await axios.post(`${API_URL}/createTask`, {
        clientKey: this.apiKey,
        task: {
          type: "NoCaptchaTaskProxyless",
          websiteURL: websiteURL,
          websiteKey: websiteKey,
        },
        softId: 0, // Ваш software ID (опционально)
      });

      if (response.data.errorId > 0) {
        throw new Error(
          `Anti-Captcha ошибка: ${response.data.errorCode} - ${response.data.errorDescription}`,
        );
      }

      const taskId = response.data.taskId;
      console.log(`    ✅ Задача создана, ID: ${taskId}`);

      return taskId;
    } catch (error) {
      if (error.response) {
        throw new Error(
          `Anti-Captcha API ошибка: ${JSON.stringify(error.response.data)}`,
        );
      }
      throw error;
    }
  }

  /**
   * Получить результат задачи
   * @param {number} taskId - ID задачи
   * @returns {Promise<object>} Результат
   */
  async getTaskResult(taskId) {
    try {
      const response = await axios.post(`${API_URL}/getTaskResult`, {
        clientKey: this.apiKey,
        taskId: taskId,
      });

      if (response.data.errorId > 0) {
        throw new Error(
          `Anti-Captcha ошибка: ${response.data.errorCode} - ${response.data.errorDescription}`,
        );
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          `Anti-Captcha API ошибка: ${JSON.stringify(error.response.data)}`,
        );
      }
      throw error;
    }
  }

  /**
   * Ждать решения задачи (с автоматическими повторными проверками)
   * @param {number} taskId - ID задачи
   * @param {number} maxWaitSeconds - Максимальное время ожидания в секундах
   * @returns {Promise<string>} gRecaptchaResponse токен
   */
  async waitForTaskSolution(taskId, maxWaitSeconds = 120) {
    const startTime = Date.now();
    const maxWaitMs = maxWaitSeconds * 1000;
    const checkInterval = 3000; // Проверяем каждые 3 секунды

    console.log(
      `    ⏳ Ожидаю решения капчи (макс. ${maxWaitSeconds} секунд)...`,
    );

    while (Date.now() - startTime < maxWaitMs) {
      await this.delay(checkInterval);

      const result = await this.getTaskResult(taskId);

      if (result.status === "ready") {
        console.log(`    ✅ Капча решена Anti-Captcha!`);
        return result.solution.gRecaptchaResponse;
      } else if (result.status === "processing") {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        if (elapsed % 10 === 0) {
          // Показываем прогресс каждые 10 секунд
          console.log(`    ⏳ Прошло ${elapsed}с, всё еще обрабатывается...`);
        }
      } else {
        throw new Error(`Anti-Captcha неизвестный статус: ${result.status}`);
      }
    }

    throw new Error(`Anti-Captcha не решил капчу за ${maxWaitSeconds} секунд`);
  }

  /**
   * Решить reCAPTCHA v2 (полный процесс: создание + ожидание)
   * @param {string} websiteURL - URL страницы с капчей
   * @param {string} websiteKey - Site key
   * @returns {Promise<string>} gRecaptchaResponse токен
   */
  async solveRecaptchaV2(websiteURL, websiteKey) {
    // Проверяем баланс
    const balance = await this.getBalance();
    console.log(`    💰 Баланс Anti-Captcha: $${balance.toFixed(2)}`);

    if (balance < 0.001) {
      throw new Error(
        "Недостаточно средств на балансе Anti-Captcha. Пополните баланс на https://anti-captcha.com",
      );
    }

    // Создаём задачу
    const taskId = await this.createRecaptchaV2Task(websiteURL, websiteKey);

    // Ждём решения
    const gRecaptchaResponse = await this.waitForTaskSolution(taskId);

    return gRecaptchaResponse;
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = AntiCaptchaClient;
