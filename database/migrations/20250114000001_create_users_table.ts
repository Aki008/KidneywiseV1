import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Enable uuid extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pg_trgm"'); // For similarity searches

  // Create users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('user_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('full_name', 100).notNullable();
    table.string('phone', 20);
    table.date('date_of_birth');
    table.string('gender', 30);

    // Medical Info
    table.string('ckd_stage', 20).notNullable();
    table.date('diagnosis_date');
    table.string('dialysis_type', 20);
    table.date('transplant_date');
    table.decimal('weight', 5, 2).notNullable();
    table.decimal('height', 5, 2);
    table.decimal('egfr', 5, 2);

    // Dietary
    table.string('dietary_preference', 20).notNullable();
    table.specificType('cuisine_preferences', 'TEXT[]');
    table.specificType('food_allergies', 'TEXT[]');

    // Healthcare
    table.string('nephrologist', 100);
    table.string('hospital', 100);

    // App Settings
    table.boolean('notifications_enabled').defaultTo(true);
    table.time('reminder_time').defaultTo('08:00');
    table.string('language', 5).defaultTo('en');
    table.string('theme', 10).defaultTo('auto');

    // Permissions
    table.boolean('permission_camera').defaultTo(false);
    table.boolean('permission_notifications').defaultTo(false);
    table.boolean('permission_microphone').defaultTo(false);

    // Tracking
    table.integer('streak_days').defaultTo(0);
    table.timestamp('last_active_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('email');
    table.index('ckd_stage');
  });

  // Add check constraints
  await knex.raw(`
    ALTER TABLE users ADD CONSTRAINT ckd_stage_check
    CHECK (ckd_stage IN ('1', '2', '3a', '3b', '4', '5', 'dialysis', 'transplant'))
  `);

  await knex.raw(`
    ALTER TABLE users ADD CONSTRAINT dietary_preference_check
    CHECK (dietary_preference IN ('omnivore', 'vegetarian', 'vegan', 'pescatarian'))
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
