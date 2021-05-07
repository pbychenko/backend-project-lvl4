import i18next from 'i18next';
import { transaction } from 'objection';
import _ from 'lodash';

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
            return { ...task, status: taskStatus.name, creator: taskCreator.fullName() };
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
        const labels = await app.objection.models.label.query();
        reply.render('tasks/new', { task, statuses, users, labels });
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
    .post('/tasks', async (req, reply) => {
      // console.log(req.body.data);
      const taskData = {
        name: req.body.data.name,
        description: req.body.data.description,
        creatorId: req.user.id,
      };

      if (req.body.data.statusId) {
        taskData.statusId = +req.body.data.statusId;
      }

      if (req.body.data.executorId) {
        taskData.executorId = +req.body.data.executorId;
      }
      console.log(taskData);
      try {
        const task = await app.objection.models.task.fromJson(taskData);
        const modelTask = app.objection.models.task;
        const modelLabel = app.objection.models.label;
        await transaction(modelTask, modelLabel, async (Task, Label) => {
          const dbTask = await Task.query().insert(task);
          if (req.body.data.labels !== '') {
            if (Array.isArray(req.body.data.labels)) {
              const labelsIds = req.body.data.labels
                .filter((el) => el !== '')
                .map((el) => +el);
              const dbLabels = await Promise.all(labelsIds.map(async (id) => {
                const label = await Label.query().findById(id);
                await dbTask.$relatedQuery('labels').relate(label);
              }));
              return dbLabels;
            }
            const labelId = +req.body.data.labels;
            const label = await Label.query().findById(labelId);
            return dbTask.$relatedQuery('labels').relate(label);
          }
          return dbTask;
        });

        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
      } catch (er) {
        console.log('in error block')
        req.flash('error', i18next.t('flash.tasks.create.error'));
        console.log(er.data);
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
          // const task = await app.objection.models.task.query().findById(+req.params.id);
          const taskData = {
            name: req.body.data.name,
            description: req.body.data.description,
          };
    
          // if (req.body.data.statusId) {
          taskData.statusId = req.body.data.statusId ? +req.body.data.statusId : '';
          // }

          taskData.executorId = req.body.data.executorId ? +req.body.data.executorId : '';
    
          // if (req.body.data.executorId) {
          //   taskData.executorId = +req.body.data.executorId;
          // }

          console.log(req.body.data);
          console.log(taskData);


          // await task.$query().patch(req.body.data);
          const modelTask = app.objection.models.task;
          const modelLabel = app.objection.models.label;
          const datalabels = (Array.isArray(req.body.data.labels) ? req.body.data.labels
            : [req.body.data.labels]);
          const newTaskLabelsIds = datalabels.filter((el) => el !== '' && el).map((el) => +el);
          await transaction(modelTask, modelLabel, async (Task, Label) => {
            // console.log('begin');
            const task = await Task.query().findById(+req.params.id);
            const oldTaskLabelsIds = (await task.$relatedQuery('labels')).map((el) => el.id);
            const labelIdsForDeletion = _.difference(oldTaskLabelsIds, newTaskLabelsIds);
            const labelIdsForInsertion = _.difference(newTaskLabelsIds, oldTaskLabelsIds);

            await task.$query().patch(taskData);
            await Promise.all(labelIdsForDeletion.map(async (id) => {
              await task.$relatedQuery('labels').unrelate().where('labelId', id);
            }));
            const insertLabels = await Promise.all(labelIdsForInsertion.map(async (id) => {
              const label = await Label.query().findById(id);
              await task.$relatedQuery('labels').relate(label);
            }));
            return insertLabels;
          });

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
          console.log(req.body.data);
          reply.render('tasks/edit', {
            // task: { ...req.body.data, id: req.params.id },
            task: { ...taskData, id: req.params.id },
            statuses,
            users,
            labels,
            selectedStatus: req.body.data.statusId,
            selectedExecutor: req.body.data.executorId,
            selectedLabels: taskLabels.map((taskLabel) => taskLabel.id),
            errors: er.data,
          });

        //   const task = await app.objection.models.task.query().findById(+req.params.id);
        // const statuses = await app.objection.models.status.query();
        // const users = await app.objection.models.user.query();
        // const labels = await app.objection.models.label.query();
        // const taskStatus = await task.$relatedQuery('status');
        // const taskLabels = await task.$relatedQuery('labels');
        // const taskExecutor = await task.$relatedQuery('executor');
        // // console.log(taskLabels);
        // reply.render('tasks/edit', {
        //   task,
        //   statuses,
        //   users,
        //   labels,
        //   selectedStatus: taskStatus.id,
        //   selectedExecutor: taskExecutor ? taskExecutor.id : '',
        //   selectedLabels: taskLabels.map((taskLabel) => taskLabel.id),
        // });


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
