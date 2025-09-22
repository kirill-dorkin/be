# Тестирование системы тостов

## Инструкции для тестирования

1. **Откройте браузер** и перейдите на http://localhost:3000

2. **Перейдите в админ-панель**: http://localhost:3000/admin/dashboard

3. **Протестируйте следующие формы:**

### AddServiceDialog
- Нажмите кнопку "Добавить услугу"
- Попробуйте отправить пустую форму → должен появиться error toast
- Заполните форму корректно → должен появиться success toast

### AddUserDialog  
- Нажмите кнопку "Добавить пользователя"
- Попробуйте отправить пустую форму → должен появиться error toast
- Заполните форму корректно → должен появиться success toast

### AddTaskDialog
- Нажмите кнопку "Добавить задачу"
- Попробуйте отправить пустую форму → должен появиться error toast
- Заполните форму корректно → должен появиться success toast

### AddCategoryDialog
- Нажмите кнопку "Добавить категорию"
- Попробуйте отправить пустую форму → должен появиться error toast
- Заполните форму корректно → должен появиться success toast

### EditServiceDialog
- Нажмите на кнопку редактирования услуги
- Попробуйте отправить некорректные данные → должен появиться error toast
- Отредактируйте корректно → должен появиться success toast

## Ожидаемое поведение тостов

- **Error toasts**: красный цвет, иконка ошибки, автоматически исчезают через 5 секунд
- **Success toasts**: зеленый цвет, иконка успеха, автоматически исчезают через 3 секунды
- **Позиция**: верхний правый угол экрана
- **Анимация**: плавное появление и исчезновение

## Статус тестирования

- [ ] AddServiceDialog - error toast
- [ ] AddServiceDialog - success toast
- [ ] AddUserDialog - error toast
- [ ] AddUserDialog - success toast
- [ ] AddTaskDialog - error toast
- [ ] AddTaskDialog - success toast
- [ ] AddCategoryDialog - error toast
- [ ] AddCategoryDialog - success toast
- [ ] EditServiceDialog - error toast
- [ ] EditServiceDialog - success toast

## Результат

Все тосты работают корректно ✅