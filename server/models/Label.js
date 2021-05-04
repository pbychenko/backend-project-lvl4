// @ts-check

import { Model } from 'objection';
import path from 'path';
import objectionUnique from 'objection-unique';

const unique = objectionUnique({ fields: ['email'] });

export default class Label extends unique(Model) {
  static get tableName() {
    return 'labels';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 200 },
      },
    };
  }

  static relationMappings = {
    tasks: {
      relation: Model.ManyToManyRelation,
      modelClass: path.join(__dirname, 'Task'),
      join: {
        from: 'labels.id',
        through: {
          from: 'labels_tasks.labelId',
          to: 'labels_tasks.taskId',
        },
        to: 'tasks.id',
      },
    },
  }
}
