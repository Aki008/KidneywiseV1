import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Meals table
  await knex.schema.createTable('meals', (table) => {
    table.uuid('meal_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
    table.text('photo_url').notNullable();
    table.string('meal_type', 20);
    table.timestamp('consumed_at').notNullable().defaultTo(knex.fn.now());

    // Nutrients
    table.integer('potassium').notNullable();
    table.integer('phosphorus').notNullable();
    table.decimal('protein', 6, 1).notNullable();
    table.integer('sodium').notNullable();
    table.integer('calories').notNullable();
    table.integer('fluids').notNullable();

    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes
    table.index(['user_id', 'consumed_at']);
  });

  await knex.raw(`
    ALTER TABLE meals ADD CONSTRAINT meal_type_check
    CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack'))
  `);

  // Meal foods (breakdown)
  await knex.schema.createTable('meal_foods', (table) => {
    table.uuid('meal_food_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('meal_id').notNullable().references('meal_id').inTable('meals').onDelete('CASCADE');
    table.uuid('food_id').notNullable().references('food_id').inTable('foods');
    table.string('food_name', 200).notNullable();
    table.integer('portion_grams').notNullable();

    // Nutrients for this portion
    table.integer('potassium').notNullable();
    table.integer('phosphorus').notNullable();
    table.decimal('protein', 6, 1).notNullable();
    table.integer('sodium').notNullable();
    table.integer('calories').notNullable();
    table.integer('fluids').notNullable();

    table.index('meal_id');
  });

  // Daily nutrient totals (cache for performance)
  await knex.schema.createTable('daily_nutrient_totals', (table) => {
    table.uuid('user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
    table.date('date').notNullable();
    table.integer('potassium').defaultTo(0);
    table.integer('phosphorus').defaultTo(0);
    table.decimal('protein', 6, 1).defaultTo(0);
    table.integer('sodium').defaultTo(0);
    table.integer('calories').defaultTo(0);
    table.integer('fluids').defaultTo(0);

    table.primary(['user_id', 'date']);
    table.index(['user_id', 'date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('daily_nutrient_totals');
  await knex.schema.dropTableIfExists('meal_foods');
  await knex.schema.dropTableIfExists('meals');
}
