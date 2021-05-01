import i18next from 'i18next';

export default (app) => {
  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        try {
          const tasks = await app.objection.models.task.query();
          reply.render('tasks/index', { tasks });
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
        console.log('список статусов');
        console.log(statuses);
        reply.render('tasks/new', { statuses });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
    })
    .get('/tasks/:id/edit', { name: 'editTask' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        const task = await app.objection.models.task.query().findById(+req.params.id);
        reply.render('tasks/edit', { task });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
    })
    .post('/tasks', async (req, reply) => {
      try {
        const task = await app.objection.models.status.fromJson(req.body.data);
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
        try {
          await app.objection.models.task.query().deleteById(+req.params.id);
          req.flash('info', i18next.t('flash.tasks.delete.success'));
        } catch (er) {
          console.log(er);
          req.flash('info', i18next.t('flash.tasks.delete.error'));
        }
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }

      reply.redirect(app.reverse('tasks'));
      return reply;
    });
};
