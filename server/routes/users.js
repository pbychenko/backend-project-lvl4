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
      // return reply;
    })
    .get('/users/:id/edit', { name: 'userEdit' }, async (req, reply) => {
      const user = await app.objection.models.user.query().findById(req.params.id);
      reply.render('users/edit', { user });
      // return reply;
    })
    .post('/users', async (req, reply) => {
      try {
        console.log('heres');
        const user = await app.objection.models.user.fromJson(req.body.data);
        await app.objection.models.user.query().insert(user);
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user: req.body.data, errors: data });
        return reply;
      }
    })
    .patch('/users/:id', async (req, reply) => {
      try {
        console.log('here');
        console.log(req.body.data);
        const user = await app.objection.models.user.query().findById(req.params.id)
          .patch(req.body.data);
        await app.objection.models.user.query().insert(user);
        req.flash('info', i18next.t('flash.users.edit.success'));
        reply.redirect(app.reverse('root'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.edit.error'));
        reply.render('users/edit', { user: req.body.data, errors: data });
        return reply;
      }
    });
};
