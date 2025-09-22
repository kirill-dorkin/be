# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "Best Electronics" [ref=e4] [cursor=pointer]:
        - /url: "#"
      - navigation [ref=e5]:
        - link "Главная" [ref=e6] [cursor=pointer]:
          - /url: "#hero"
  - navigation "Мобильное меню" [ref=e7]:
    - link "Главная" [ref=e8] [cursor=pointer]:
      - /url: "#hero"
  - main [ref=e13]:
    - heading "Система сервиса Best Electronics" [level=1] [ref=e14]
    - paragraph [ref=e15]: Мы предлагаем профессиональный ремонт и модернизацию электроники. Используйте кнопку ниже, чтобы отправить заявку.
    - navigation "Основная навигация" [ref=e16]:
      - link "Заказать ремонт" [ref=e17] [cursor=pointer]:
        - /url: /request
        - button "Заказать ремонт" [ref=e18] [cursor=pointer]
  - region "Notifications (F8)":
    - list
  - alert [ref=e19]
```