exports.up = (knex) => (
  knex.schema.createTable('labels_tasks', (table) => {
    table.increments('id').primary();
    table.integer('label_id').references('id').inTable('labels');
    table.integer('task_id').references('id').inTable('tasks');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
);

exports.down = (knex) => knex.schema.dropTable('labels_tasks');
