import { Model } from 'objection';
import objectionUnique from 'objection-unique';
import Task from './Task';

const unique = objectionUnique({ fields: ['name'] });

export default class Status extends unique(Model) {
  static get tableName() {
    return 'statuses';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 4, maxLength: 20 },
      },
    };
  }

  static relationMappings = {
    tasks: {
      relation: Model.HasManyRelation,
      modelClass: Task,
      join: {
        from: 'statuses.id',
        to: 'tasks.statusId',
      },
    },
  };
}
