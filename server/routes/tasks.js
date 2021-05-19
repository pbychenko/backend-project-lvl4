import i18next from 'i18next';
import { transaction } from 'objection';
import _ from 'lodash';

export default (app) => {
  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        try {
          const {
            status,
            executor,
            label,
            isCreatorUser,
          } = req.query;
          const creator = isCreatorUser ? req.user.id : '';
          const statuses = await app.objection.models.status.query();
          const users = await app.objection.models.user.query();
          const labels = await app.objection.models.label.query();
          const tasks = await app.objection.models.task.query()
            .modify('defaultSelects')
            .modify('filterByStatus', status)
            .modify('filterByExecutor', executor)
            .modify('filterByLabel', label)
            .modify('filterByCreator', creator);

          const tasksForIndex = await Promise.all(tasks.map(async (task) => {
            const taskStatus = await task.$relatedQuery('status');
            const taskCreator = await task.$relatedQuery('creator');

            const taskExecutor = await task.$relatedQuery('executor');
            return {
              ...task,
              status: taskStatus.name,
              creator: taskCreator.fullName(),
              executor: taskExecutor ? taskExecutor.fullName() : '',
            };
          }));

          reply.render('tasks/index', {
            tasks: tasksForIndex,
            statuses,
            users,
            labels,
            selectedStatus: +status,
            selectedExecutor: +executor,
            selectedLabel: +label,
            isCreatorUser,
          });
        } catch (er) {
          console.log(er);
          return reply;
        }
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
      return reply;
    })
    .get('/tasks/new', { name: 'newTask' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        const task = new app.objection.models.task();
        const statuses = await app.objection.models.status.query();
        const users = await app.objection.models.user.query();
        const labels = await app.objection.models.label.query();
        reply.render('tasks/new', {
          task,
          statuses,
          users,
          labels,
        });
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
        const labels = await app.objection.models.label.query();
        const taskLabels = await task.$relatedQuery('labels');
        const taskExecutor = await task.$relatedQuery('executor');
        reply.render('tasks/edit', {
          task,
          statuses,
          users,
          labels,
          selectedStatus: task.statusId,
          selectedExecutor: taskExecutor ? taskExecutor.id : '',
          selectedLabels: taskLabels.map((taskLabel) => taskLabel.id),
        });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
    })
    .get('/tasks/:id', { name: 'showTask' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        const task = await app.objection.models.task.query().findById(+req.params.id);
        const taskLabels = await task.$relatedQuery('labels');
        const taskExecutor = await task.$relatedQuery('executor');
        const taskCreator = await task.$relatedQuery('creator');
        const taskStatus = await task.$relatedQuery('status');
        reply.render('tasks/show', {
          task: {
            ...task,
            status: taskStatus.name,
            creator: taskCreator ? taskCreator.fullName() : '',
            executor: taskExecutor ? taskExecutor.fullName() : '',
            labels: taskLabels.map((taskLabel) => taskLabel.name),
          },
        });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
    })
    .post('/tasks', async (req, reply) => {
      const taskData = {
        name: req.body.data.name,
        description: req.body.data.description,
        creatorId: req.user.id,
        statusId: req.body.data.statusId ? +req.body.data.statusId : '',
        executorId: req.body.data.executorId ? +req.body.data.executorId : null,
      };

      const taskLabels = (Array.isArray(req.body.data.labels) ? req.body.data.labels
        : [req.body.data.labels]);
      const taskLabelsIds = taskLabels.filter((el) => el !== '' && el).map((el) => +el);

      try {
        const task = await app.objection.models.task.fromJson(taskData);

        await transaction(
          app.objection.models.task,
          app.objection.models.label,
          async (Task, Label) => {
            const dbTask = await Task.query().insert(task);
            await Promise.all(taskLabelsIds.map(async (id) => {
              const label = await Label.query().findById(id);
              await dbTask.$relatedQuery('labels').relate(label);
            }));
          },
        );

        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
      } catch (er) {
        req.flash('error', i18next.t('flash.tasks.create.error'));
        console.log(er);
        const statuses = await app.objection.models.status.query();
        const users = await app.objection.models.user.query();
        const labels = await app.objection.models.label.query();
        reply.render('tasks/new', {
          task: taskData,
          statuses,
          users,
          labels,
          errors: er.data,
        });
      }
    })
    .patch('/tasks/:id', { name: 'updateTask' }, async (req, reply) => {
      if (req.isAuthenticated()) {
        try {
          const taskData = {
            name: req.body.data.name,
            description: req.body.data.description,
            statusId: req.body.data.statusId ? +req.body.data.statusId : '',
            executorId: req.body.data.executorId ? +req.body.data.executorId : '',
          };

          const taskNewLabels = (Array.isArray(req.body.data.labels) ? req.body.data.labels
            : [req.body.data.labels]);
          const taskNewLabelsIds = taskNewLabels.filter((el) => el !== '' && el).map((el) => +el);

          await transaction(
            app.objection.models.task,
            app.objection.models.label,
            async (Task, Label) => {
              const task = await Task.query().findById(+req.params.id);
              const taskOldLabelsIds = (await task.$relatedQuery('labels')).map((el) => el.id);
              const labelIdsForDeletion = _.difference(taskOldLabelsIds, taskNewLabelsIds);
              const labelIdsForInsertion = _.difference(taskNewLabelsIds, taskOldLabelsIds);

              await task.$query().patch(taskData);
              await Promise.all(labelIdsForDeletion.map(async (id) => {
                await task.$relatedQuery('labels').unrelate().where('labelId', id);
              }));
              await Promise.all(labelIdsForInsertion.map(async (id) => {
                const label = await Label.query().findById(id);
                await task.$relatedQuery('labels').relate(label);
              }));
            },
          );

          req.flash('info', i18next.t('flash.tasks.edit.success'));
          reply.redirect(app.reverse('tasks'));
          return reply;
        } catch (er) {
          req.flash('error', i18next.t('flash.tasks.edit.error'));
          console.log(er);
          const task = await app.objection.models.task.query().findById(+req.params.id);
          const statuses = await app.objection.models.status.query();
          const users = await app.objection.models.user.query();
          const labels = await app.objection.models.label.query();
          const taskLabels = await task.$relatedQuery('labels');

          reply.render('tasks/edit', {
            task: { ...req.body.data, id: req.params.id },
            statuses,
            users,
            labels,
            selectedStatus: req.body.data.statusId,
            selectedExecutor: req.body.data.executorId,
            selectedLabels: taskLabels.map((taskLabel) => taskLabel.id),
            errors: er.data,
          });

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
