import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Refresh tokens
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.uuid('token_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
    table.string('token_hash', 255).unique().notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('revoked_at');

    table.index('user_id');
    table.index('token_hash');
  });

  // Password reset tokens
  await knex.schema.createTable('password_reset_tokens', (table) => {
    table.uuid('token_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
    table.string('token_hash', 255).unique().notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('used_at');

    table.index('user_id');
    table.index('token_hash');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('password_reset_tokens');
  await knex.schema.dropTableIfExists('refresh_tokens');
}
