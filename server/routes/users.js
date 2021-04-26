// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await app.objection.models.user.query();
      reply.render('users/index', { users });
      return reply;
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new app.objection.models.user();
      reply.render('users/new', { user });
    })
    .get('/users/:id/edit', { name: 'editUser' }, async (req, reply) => {
      if (req.user.id === +req.params.id) {
        const user = await app.objection.models.user.query().findById(req.params.id);
        reply.render('users/edit', { user });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('users'));
      }
    })
    .post('/users', async (req, reply) => {
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
    .patch('/users/:id', { name: 'updateUser' }, async (req, reply) => {
      try {
        if (req.user.id === +req.params.id) {
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
    });
};
