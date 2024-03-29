// @ts-check

import { Model } from 'objection';
import objectionUnique from 'objection-unique';
import Task from './Task';

import encrypt from '../lib/secure.js';

const unique = objectionUnique({ fields: ['email'] });

export default class User extends unique(Model) {
  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['firstName', 'lastName', 'email', 'password'],
      properties: {
        id: { type: 'integer' },
        firstName: { type: 'string', minLength: 1 },
        lastName: { type: 'string', minLength: 1 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 3 },
      },
    };
  }

  set password(value) {
    this.passwordDigest = encrypt(value);
  }

  verifyPassword(password) {
    return encrypt(password) === this.passwordDigest;
  }

  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  static relationMappings = {
    createdTasks: {
      relation: Model.HasManyRelation,
      modelClass: Task,
      join: {
        from: 'users.id',
        to: 'tasks.creatorId',
      },
    },
    executeTasks: {
      relation: Model.HasManyRelation,
      modelClass: Task,
      join: {
        from: 'users.id',
        to: 'tasks.executorId',
      },
    },
  };
}
