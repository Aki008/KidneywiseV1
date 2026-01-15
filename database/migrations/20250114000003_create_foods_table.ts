import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Foods database
  await knex.schema.createTable('foods', (table) => {
    table.uuid('food_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('food_name', 200).notNullable();
    table.string('food_name_local', 200);
    table.string('category', 50).notNullable();
    table.string('cuisine', 50);

    // Nutrients per 100g
    table.integer('potassium_per_100g').notNullable();
    table.integer('phosphorus_per_100g').notNullable();
    table.decimal('protein_per_100g', 6, 1).notNullable();
    table.integer('sodium_per_100g').notNullable();
    table.integer('calories_per_100g').notNullable();
    table.integer('water_content_per_100g').notNullable();

    // Metadata
    table.text('image_url');
    table.text('description');
    table.integer('serving_size_grams').defaultTo(100);
    table.boolean('is_verified').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('category');
    table.index('food_name');
  });

  // Create GIN index for similarity search
  await knex.raw('CREATE INDEX idx_food_name_trgm ON foods USING gin (food_name gin_trgm_ops)');

  // Food additions (butter, salt, etc.)
  await knex.schema.createTable('food_additions', (table) => {
    table.uuid('addition_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('addition_name', 100).unique().notNullable();
    table.integer('potassium').defaultTo(0);
    table.integer('phosphorus').defaultTo(0);
    table.decimal('protein', 6, 1).defaultTo(0);
    table.integer('sodium').defaultTo(0);
    table.integer('calories').defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('food_additions');
  await knex.schema.dropTableIfExists('foods');
}
