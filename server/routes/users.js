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
      if (req.isAuthenticated() && req.user.id === +req.params.id) {
        const user = await app.objection.models.user.query().findById(+req.params.id);
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
        if (req.isAuthenticated() && req.user.id === +req.params.id) {
          const user = await app.objection.models.user.query().findById(+req.params.id);
          console.log(req.body.data);
          await user.$query().patch(req.body.data);
          req.flash('info', i18next.t('flash.users.edit.success'));
        }
        reply.redirect(app.reverse('root'));
        return reply;
      } catch (er) {
        req.flash('error', i18next.t('flash.users.edit.error'));
        // console.log(er);
        // console.log(req.body.data)
        // console.log(req.params)
        // reply.render('users/edit', { user: req.body.data, errors: er });
        reply.redirect(app.reverse('editUser', { id: req.params.id }));
      }
    })
    .delete('/users/:id', { name: 'deleteUser' }, async (req, reply) => {
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
