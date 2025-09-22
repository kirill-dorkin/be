# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "Best Electronics" [ref=e4]:
        - /url: "#"
      - button "Toggle menu" [ref=e6] [cursor=pointer]
  - navigation "Мобильное меню" [ref=e10]:
    - link "Главная" [ref=e11]:
      - /url: "#hero"
  - main [ref=e16]:
    - heading "Система сервиса Best Electronics" [level=1] [ref=e17]
    - paragraph [ref=e18]: Мы предлагаем профессиональный ремонт и модернизацию электроники. Используйте кнопку ниже, чтобы отправить заявку.
    - navigation "Основная навигация" [ref=e19]:
      - link "Заказать ремонт" [ref=e20]:
        - /url: /request
        - button "Заказать ремонт" [ref=e21] [cursor=pointer]
  - region "Notifications (F8)":
    - list
  - alert [ref=e22]
```