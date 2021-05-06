import i18next from 'i18next';

export default (app) => {
  app
    .get('/labels', { name: 'labels' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        try {
          const labels = await app.objection.models.label.query();
          reply.render('labels/index', { labels });
        } catch (er) {
          console.log(er);
        }
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
    })
    .get('/labels/new', { name: 'newLabel' }, (req, reply) => {
      if (req.isAuthenticated()) {
        const label = new app.objection.models.label();
        reply.render('labels/new', { label });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
    })
    .get('/labels/:id/edit', { name: 'editLabel' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        const label = await app.objection.models.label.query().findById(+req.params.id);
        reply.render('labels/edit', { label });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
    })
    .post('/labels', async (req, reply) => {
      try {
        const label = await app.objection.models.label.fromJson(req.body.data);
        await app.objection.models.label.query().insert(label);
        req.flash('info', i18next.t('flash.labels.create.success'));
        reply.redirect(app.reverse('labels'));
      } catch (er) {
        req.flash('error', i18next.t('flash.labels.create.error'));
        console.log(er);
        reply.render('labels/new', { label: req.body.data, errors: er.data });
      }
    })
    .patch('/labels/:id', { name: 'updateLabel' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        try {
          const label = await app.objection.models.label.query().findById(+req.params.id);
          await label.$query().patch(req.body.data);
          req.flash('info', i18next.t('flash.labels.edit.success'));
          reply.redirect(app.reverse('labels'));
          return reply;
        } catch (er) {
          req.flash('error', i18next.t('flash.labels.edit.error'));
          console.log(er);
          reply.render('labels/edit', { label: { ...req.body.data, id: req.params.id }, errors: er.data });
          return reply;
        }
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
        return reply;
      }
    })
    .delete('/labels/:id', { name: 'deleteLabel' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        const label = await app.objection.models.label.query().findById(+req.params.id);
        const tasks = await label.$relatedQuery('tasks');
        if (tasks.length === 0) {
          try {
            await app.objection.models.label.query().deleteById(+req.params.id);
            req.flash('info', i18next.t('flash.labels.delete.success'));
          } catch (er) {
            console.log(er);
            req.flash('info', i18next.t('flash.labels.delete.error'));
          }
        } else {
          req.flash('error', i18next.t('flash.labels.labelsError'));
          reply.redirect(app.reverse('labels'));
        }
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }

      reply.redirect(app.reverse('labels'));
      return reply;
    });
};
