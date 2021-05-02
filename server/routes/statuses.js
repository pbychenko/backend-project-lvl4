import i18next from 'i18next';

export default (app) => {
  app
    .get('/statuses', { name: 'statuses' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        try {
          const statuses = await app.objection.models.status.query();
          reply.render('statuses/index', { statuses });
        } catch (er) {
          console.log(er);
        }
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
    })
    .get('/statuses/new', { name: 'newStatus' }, (req, reply) => {
      if (req.isAuthenticated()) {
        const status = new app.objection.models.user();
        reply.render('statuses/new', { status });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
    })
    .get('/statuses/:id/edit', { name: 'editStatus' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        const status = await app.objection.models.status.query().findById(+req.params.id);
        reply.render('statuses/edit', { status });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
    })
    .post('/statuses', async (req, reply) => {
      try {
        const status = await app.objection.models.status.fromJson(req.body.data);
        await app.objection.models.status.query().insert(status);
        req.flash('info', i18next.t('flash.statuses.create.success'));
        reply.redirect(app.reverse('statuses'));
      } catch (er) {
        req.flash('error', i18next.t('flash.statuses.create.error'));
        console.log(er);
        reply.render('statuses/new', { status: req.body.data, errors: er.data });
      }
    })
    .patch('/statuses/:id', { name: 'updateStatus' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        try {
          const status = await app.objection.models.status.query().findById(+req.params.id);
          await status.$query().patch(req.body.data);
          req.flash('info', i18next.t('flash.statuses.edit.success'));
          reply.redirect(app.reverse('statuses'));
          return reply;
        } catch (er) {
          req.flash('error', i18next.t('flash.statuses.edit.error'));
          console.log(er);
          reply.render('statuses/edit', { status: req.body.data, errors: er.data });
          return reply;
        }
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
        return reply;
      }
    })
    .delete('/statuses/:id', { name: 'deleteStatus' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        const status = await app.objection.models.status.query().findById(+req.params.id);
        const tasks = await status.$relatedQuery('tasks');
        if (tasks.length === 0) {
          try {
            await app.objection.models.status.query().deleteById(+req.params.id);
            req.flash('info', i18next.t('flash.statuses.delete.success'));
          } catch (er) {
            console.log(er);
            req.flash('info', i18next.t('flash.statuses.delete.error'));
          }
        } else {
          req.flash('error', i18next.t('flash.statuses.tasksError'));
          reply.redirect(app.reverse('statuses'));
        }
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }

      reply.redirect(app.reverse('statuses'));
      return reply;
    });
};
