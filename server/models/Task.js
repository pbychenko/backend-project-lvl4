// @ts-check

import { Model } from 'objection';
import objectionUnique from 'objection-unique';
import path from 'path';

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
        statusId: { type: 'integer' },
        creatorId: { type: 'integer' },
        executorId: { type: 'integer' },
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
  }
}
