import i18next from 'i18next';

export default (app) => {
  app
    .get('/statuses', { name: 'users' }, async (req, reply) => {
      const users = await app.objection.models.user.query();
      reply.render('users/index', { users });
      return reply;
    })
    .get('/statuses/new', { name: 'newStatus' }, (req, reply) => {
      const user = new app.objection.models.user();
      reply.render('users/new', { user });
    })
    .get('/statuses/:id/edit', { name: 'editStatus' }, async (req, reply) => {
      if (req.isAuthenticated() && req.user.id === +req.params.id) {
        const user = await app.objection.models.user.query().findById(req.params.id);
        reply.render('users/edit', { user });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('users'));
      }
    })
    .post('/statuses', async (req, reply) => {
      try {
        const user = await app.objection.models.user.fromJson(req.body.data);
        await app.objection.models.user.query().insert(user);
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
        return reply;
      } catch (er) {
        req.flash('error', i18next.t('flash.users.create.error'));
        console.log(er);
        reply.render('users/new', { user: req.body.data, errors: er.data });
        return reply;
      }
    })
    .patch('/statuses/:id', { name: 'updateStatus' }, async (req, reply) => {
      try {
        if (req.isAuthenticated() && req.user.id === +req.params.id) {
          const user = await app.objection.models.user.query().findById(+req.params.id);
          await user.$query().patch(req.body.data);
          req.flash('info', i18next.t('flash.users.edit.success'));
        } else {
          req.flash('info', 'Иди нахуй');
        }
        reply.redirect(app.reverse('root'));
        return reply;
      } catch (er) {
        req.flash('error', i18next.t('flash.users.edit.error'));
        console.log(er);
        reply.render('users/edit', { user: req.body.data, errors: er });
        return reply;
      }
    })
    .delete('/statuses/:id', { name: 'deleteUser' }, async (req, reply) => {
      try {
        if (req.isAuthenticated() && req.user.id === +req.params.id) {
          req.logOut();
          await app.objection.models.user.query().deleteById(+req.params.id);
          req.flash('info', i18next.t('flash.users.delete.success'));
        } else {
          req.flash('info', i18next.t('flash.users.delete.error'));
        }
      } catch (er) {
        console.log(er);
        req.flash('info', i18next.t('flash.users.delete.error'));
      }
      reply.redirect(app.reverse('users'));
      return reply;
    });
};