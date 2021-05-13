// @ts-check

module.exports = {
  translation: {
    appName: 'Fastify Шаблон',
    flash: {
      session: {
        create: {
          success: 'Вы залогинены',
          error: 'Неправильный емейл или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      users: {
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        edit: {
          error: 'Не удалось отредактировать пользователя',
          success: 'Пользователь успешно изменён',
        },
        delete: {
          error: 'Не удалось удалить пользователя',
          success: 'Пользователь успешно удалён',
        },
        authError: 'Вы не можете редактировать или удалять другого пользователя',
      },
      statuses: {
        create: {
          error: 'Не удалось создать статус',
          success: 'Статус успешно создан',
        },
        edit: {
          error: 'Не удалось изменить статус',
          success: 'Статус успешно изменён',
        },
        delete: {
          error: 'Не удалось удалить статус',
          success: 'Статус успешно удалён',
        },
        tasksError: 'Есть задачи в этом статусе',
      },
      labels: {
        create: {
          error: 'Не удалось создать метку',
          success: 'Метка успешно создана',
        },
        edit: {
          error: 'Не удалось изменить метку',
          success: 'Метка успешно изменена',
        },
        delete: {
          error: 'Не удалось удалить метку',
          success: 'Метка успешно удалена',
        },
        labelsError: 'Есть задачи с этой меткой',
      },
      tasks: {
        create: {
          error: 'Не удалось создать задачу',
          success: 'Задача успешно создана',
        },
        edit: {
          error: 'Не удалось изменить задачу',
          success: 'Задача успешно изменена',
        },
        delete: {
          error: 'Не удалось удалить задачу',
          success: 'Задача успешно удалена',
        },
        authError: 'Задачу может удалить только ее автор',
      },
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
    },
    layouts: {
      application: {
        users: 'Пользователи',
        statuses: 'Статусы',
        tasks: 'Задачи',
        labels: 'Метки',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
      },
    },
    views: {
      new: 'Создать',
      session: {
        new: {
          signIn: 'Вход',
          submit: 'Войти',
          email: 'Email',
          password: 'Пароль',
        },
      },
      users: {
        id: 'ID',
        fullName: 'Полное имя',
        email: 'Email',
        createdAt: 'Дата создания',
        new: {
          firstName: 'Имя',
          lastName: 'Фамилия',
          password: 'Пароль',
          submit: 'Сохранить',
          signUp: 'Регистрация',
        },
        edit: {
          submit: 'Изменить',
          edit: 'Редактирование',
        },
        delete: {
          submit: 'Удалить',
        },
      },
      statuses: {
        id: 'ID',
        name: 'Наименование',
        createdAt: 'Дата создания',
        new: {
          submit: 'Создать статус',
          signUp: 'Создание статуса',
        },
        edit: {
          submit: 'Изменить',
          edit: 'Изменение статуса',
        },
        delete: {
          submit: 'Удалить',
        },
      },
      tasks: {
        id: 'ID',
        name: 'Наименование',
        status: 'Статус',
        creator: 'Автор',
        executor: 'Исполнитель',
        isCreator: 'Только мои задачи',
        show: 'Показать',
        label: 'Метка',
        createdAt: 'Дата создания',
        new: {
          name: 'Наименование',
          description: 'Описание',
          status: 'Статус',
          executor: 'Исполнитель',
          labels: 'Метки',
          submit: 'Создать задачу',
          signUp: 'Создание задачи',
        },
        edit: {
          submit: 'Изменить',
          edit: 'Изменение задачи',
        },
        delete: {
          submit: 'Удалить',
        },
      },
      labels: {
        id: 'ID',
        name: 'Наименование',
        createdAt: 'Дата создания',
        new: {
          submit: 'Создать метку',
          signUp: 'Создание метки',
        },
        edit: {
          submit: 'Изменить',
          edit: 'Изменение метки',
        },
        delete: {
          submit: 'Удалить',
        },
      },
      welcome: {
        index: {
          hello: 'Привет от Хекслета!',
          description: 'Практические курсы по программированию',
          more: 'Узнать Больше',
        },
      },
    },
  },
};
