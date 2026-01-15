import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('daily_limits', (table) => {
    table.uuid('user_id').primary().references('user_id').inTable('users').onDelete('CASCADE');
    table.integer('potassium').notNullable();
    table.integer('phosphorus').notNullable();
    table.decimal('protein', 6, 1).notNullable();
    table.integer('sodium').notNullable();
    table.integer('fluids').notNullable();
    table.integer('calories');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create function to calculate daily limits based on CKD stage
  await knex.raw(`
    CREATE OR REPLACE FUNCTION calculate_daily_limits(
      p_ckd_stage VARCHAR,
      p_weight DECIMAL
    )
    RETURNS TABLE (
      potassium INTEGER,
      phosphorus INTEGER,
      protein DECIMAL,
      sodium INTEGER,
      fluids INTEGER
    ) AS $$
    BEGIN
      RETURN QUERY
      SELECT
        CASE p_ckd_stage
          WHEN '1' THEN 3500
          WHEN '2' THEN 3000
          WHEN '3a' THEN 2500
          WHEN '3b' THEN 2000
          WHEN '4' THEN 2000
          WHEN '5' THEN 2000
          WHEN 'dialysis' THEN 2000
          WHEN 'transplant' THEN 3000
        END AS potassium,
        CASE p_ckd_stage
          WHEN '1' THEN 1400
          WHEN '2' THEN 1200
          WHEN '3a' THEN 1000
          WHEN '3b' THEN 1000
          WHEN '4' THEN 900
          WHEN '5' THEN 800
          WHEN 'dialysis' THEN 1000
          WHEN 'transplant' THEN 1200
        END AS phosphorus,
        CASE p_ckd_stage
          WHEN '1' THEN p_weight * 1.0
          WHEN '2' THEN p_weight * 0.95
          WHEN '3a' THEN p_weight * 0.85
          WHEN '3b' THEN p_weight * 0.8
          WHEN '4' THEN p_weight * 0.75
          WHEN '5' THEN p_weight * 0.6
          WHEN 'dialysis' THEN p_weight * 1.2
          WHEN 'transplant' THEN p_weight * 0.9
        END AS protein,
        CASE p_ckd_stage
          WHEN 'dialysis' THEN 2000
          ELSE 2300
        END AS sodium,
        CASE p_ckd_stage
          WHEN '4' THEN 1500
          WHEN '5' THEN 1000
          WHEN 'dialysis' THEN 1000
          ELSE 2000
        END AS fluids;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create trigger to auto-calculate limits when user is created/updated
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_daily_limits_on_user_change()
    RETURNS TRIGGER AS $$
    DECLARE
      limits RECORD;
    BEGIN
      SELECT * INTO limits FROM calculate_daily_limits(NEW.ckd_stage, NEW.weight);

      INSERT INTO daily_limits (user_id, potassium, phosphorus, protein, sodium, fluids)
      VALUES (NEW.user_id, limits.potassium, limits.phosphorus, limits.protein, limits.sodium, limits.fluids)
      ON CONFLICT (user_id)
      DO UPDATE SET
        potassium = limits.potassium,
        phosphorus = limits.phosphorus,
        protein = limits.protein,
        sodium = limits.sodium,
        fluids = limits.fluids,
        updated_at = NOW();

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_daily_limits_trigger
    AFTER INSERT OR UPDATE OF ckd_stage, weight ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_limits_on_user_change();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TRIGGER IF EXISTS update_daily_limits_trigger ON users');
  await knex.raw('DROP FUNCTION IF EXISTS update_daily_limits_on_user_change()');
  await knex.raw('DROP FUNCTION IF EXISTS calculate_daily_limits(VARCHAR, DECIMAL)');
  await knex.schema.dropTableIfExists('daily_limits');
}
