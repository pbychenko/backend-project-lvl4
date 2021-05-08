// @ts-check

import { Model } from 'objection';
import path from 'path';
import objectionUnique from 'objection-unique';

const unique = objectionUnique({ fields: ['email'] });

export default class Task extends unique(Model) {
  static get tableName() {
    return 'tasks';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'statusId', 'creatorId'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 200 },
        description: { type: 'string', minLength: 1, maxLength: 400 },
        statusId: { type: 'integer' },
        creatorId: { type: 'integer' },
      },
    };
  }

  static relationMappings = {
    status: {
      relation: Model.BelongsToOneRelation,
      modelClass: path.join(__dirname, 'Status'),
      join: {
        from: 'tasks.statusId',
        to: 'statuses.id',
      },
    },
    creator: {
      relation: Model.BelongsToOneRelation,
      modelClass: path.join(__dirname, 'User'),
      join: {
        from: 'tasks.creatorId',
        to: 'users.id',
      },
    },
    executor: {
      relation: Model.BelongsToOneRelation,
      modelClass: path.join(__dirname, 'User'),
      join: {
        from: 'tasks.executorId',
        to: 'users.id',
      },
    },
    labels: {
      relation: Model.ManyToManyRelation,
      modelClass: path.join(__dirname, 'Label'),
      join: {
        from: 'tasks.id',
        through: {
          from: 'labels_tasks.taskId',
          to: 'labels_tasks.labelId',
        },
        to: 'labels.id',
      },
    },
  }

  static modifiers = {
    defaultSelects(query) {
      return query;
    },

    filterByStatus(query, statusId) {
      if (statusId) {
        return query.where('statusId', statusId);
      }
      return query;
    },

    filterByExecutor(query, executorId) {
      if (executorId) {
        return query.where('executorId', executorId);
      }
      return query;
    },

    filterByLabel(query, labelId) {
      if (labelId) {
        return query.withGraphJoined('labels').where('labelId', labelId);
      }
      return query;
    },

    filterByCreator(query, creatorId) {
      if (creatorId) {
        return query.where('creatorId', creatorId);
      }
      return query;
    },
  };
}
