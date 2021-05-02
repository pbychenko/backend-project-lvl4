import i18next from 'i18next';

export default (app) => {
  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        try {
          const tasks = await app.objection.models.task.query();
          // console.log(tasks)
          const tasksForIndex = await Promise.all(tasks.map(async (task) => {
            const taskStatus = await task.$relatedQuery('status');
            const taskCreator = await task.$relatedQuery('creator');
            if (task.executorId) {
              const taskExecutor = await task.$relatedQuery('executor');
              return {
                ...task,
                status: taskStatus.name,
                creator: taskCreator.fullName(),
                executor: taskExecutor.fullName(),
              };
            }

            // console.log(taskStatus);
            return { ...task, status: taskStatus.name, creator: taskCreator.fullNam };
          }));

          reply.render('tasks/index', { tasks: tasksForIndex });
        } catch (er) {
          console.log(er);
        }
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
    })
    .get('/tasks/new', { name: 'newTask' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        const task = new app.objection.models.task();
        const statuses = await app.objection.models.status.query();
        const users = await app.objection.models.user.query();
        reply.render('tasks/new', { task, statuses, users });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
    })
    .get('/tasks/:id/edit', { name: 'editTask' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        const task = await app.objection.models.task.query().findById(+req.params.id);
        const statuses = await app.objection.models.status.query();
        const users = await app.objection.models.user.query();
        const taskStatus = await task.$relatedQuery('status');
        const taskExecutor = await task.$relatedQuery('executor');
        reply.render('tasks/edit', {
          task,
          statuses,
          users,
          selectedStatus: taskStatus.id,
          selectedExecutor: taskExecutor.id,
        });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
    })
    .post('/tasks', async (req, reply) => {
      try {
        // console.log(req.body.data);
        req.body.data.statusId = +req.body.data.statusId;

        if (req.body.data.executorId) {
          req.body.data.executorId = +req.body.data.executorId;
        }

        req.body.data.creatorId = req.user.id;
        const task = await app.objection.models.task.fromJson(req.body.data);

        await app.objection.models.task.query().insert(task);
        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
      } catch (er) {
        req.flash('error', i18next.t('flash.tasks.create.error'));
        console.log(er);
        reply.render('tasks/new', { task: req.body.data, errors: er.data });
      }
    })
    .patch('/tasks/:id', { name: 'updateTask' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        try {
          const task = await app.objection.models.task.query().findById(+req.params.id);
          req.body.data.statusId = +req.body.data.statusId;

          if (req.body.data.executorId) {
            req.body.data.executorId = +req.body.data.executorId;
          }
          await task.$query().patch(req.body.data);
          req.flash('info', i18next.t('flash.tasks.edit.success'));
          reply.redirect(app.reverse('tasks'));
          return reply;
        } catch (er) {
          req.flash('error', i18next.t('flash.tasks.edit.error'));
          console.log(er);
          reply.render('tasks/edit', { tasks: req.body.data, errors: er.data });
          return reply;
        }
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
        return reply;
      }
    })
    .delete('/tasks/:id', { name: 'deleteTask' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        const task = await app.objection.models.task.query().findById(+req.params.id);
        if (req.user.id === task.creatorId) {
          try {
            await app.objection.models.task.query().deleteById(+req.params.id);
            req.flash('info', i18next.t('flash.tasks.delete.success'));
          } catch (er) {
            console.log(er);
            req.flash('info', i18next.t('flash.tasks.delete.error'));
          }
        } else {
          req.flash('error', i18next.t('flash.tasks.authError'));
          reply.redirect(app.reverse('tasks'));
        }
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }

      reply.redirect(app.reverse('tasks'));
      return reply;
    });
};
