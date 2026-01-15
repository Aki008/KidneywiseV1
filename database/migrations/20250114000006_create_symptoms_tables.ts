import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Symptoms table
  await knex.schema.createTable('symptoms', (table) => {
    table.uuid('symptom_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.string('symptom_type', 50).notNullable(); // fatigue, swelling, nausea, etc.
    table.integer('severity').notNullable(); // 1-10 scale
    table.text('notes');
    table.timestamp('logged_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.foreign('user_id').references('user_id').inTable('users').onDelete('CASCADE');
    table.index('user_id');
    table.index('logged_at');
  });

  // Predefined symptom types reference
  await knex.schema.createTable('symptom_types', (table) => {
    table.uuid('symptom_type_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 50).notNullable().unique();
    table.string('display_name', 100).notNullable();
    table.text('description');
    table.string('category', 50); // physical, mental, digestive, etc.
    table.string('icon', 50); // emoji or icon name
    table.boolean('requires_medical_attention').defaultTo(false);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // Seed symptom types
  await knex('symptom_types').insert([
    {
      name: 'fatigue',
      display_name: 'Fatigue',
      description: 'Feeling tired or lacking energy',
      category: 'physical',
      icon: '😴',
      requires_medical_attention: false,
    },
    {
      name: 'swelling',
      display_name: 'Swelling (Edema)',
      description: 'Swelling in legs, ankles, feet, or face',
      category: 'physical',
      icon: '🦵',
      requires_medical_attention: true,
    },
    {
      name: 'nausea',
      display_name: 'Nausea',
      description: 'Feeling sick to your stomach',
      category: 'digestive',
      icon: '🤢',
      requires_medical_attention: false,
    },
    {
      name: 'vomiting',
      display_name: 'Vomiting',
      description: 'Throwing up',
      category: 'digestive',
      icon: '🤮',
      requires_medical_attention: true,
    },
    {
      name: 'shortness_of_breath',
      display_name: 'Shortness of Breath',
      description: 'Difficulty breathing or breathlessness',
      category: 'physical',
      icon: '😮‍💨',
      requires_medical_attention: true,
    },
    {
      name: 'chest_pain',
      display_name: 'Chest Pain',
      description: 'Pain or discomfort in the chest',
      category: 'physical',
      icon: '💔',
      requires_medical_attention: true,
    },
    {
      name: 'headache',
      display_name: 'Headache',
      description: 'Pain in your head',
      category: 'physical',
      icon: '🤕',
      requires_medical_attention: false,
    },
    {
      name: 'dizziness',
      display_name: 'Dizziness',
      description: 'Feeling lightheaded or unsteady',
      category: 'physical',
      icon: '😵‍💫',
      requires_medical_attention: false,
    },
    {
      name: 'itching',
      display_name: 'Itching',
      description: 'Skin itchiness',
      category: 'physical',
      icon: '🥴',
      requires_medical_attention: false,
    },
    {
      name: 'muscle_cramps',
      display_name: 'Muscle Cramps',
      description: 'Painful muscle contractions',
      category: 'physical',
      icon: '💪',
      requires_medical_attention: false,
    },
    {
      name: 'loss_of_appetite',
      display_name: 'Loss of Appetite',
      description: 'Not feeling hungry',
      category: 'digestive',
      icon: '🍽️',
      requires_medical_attention: false,
    },
    {
      name: 'confusion',
      display_name: 'Confusion',
      description: 'Difficulty thinking clearly',
      category: 'mental',
      icon: '😵',
      requires_medical_attention: true,
    },
    {
      name: 'difficulty_sleeping',
      display_name: 'Difficulty Sleeping',
      description: 'Trouble falling or staying asleep',
      category: 'mental',
      icon: '😪',
      requires_medical_attention: false,
    },
    {
      name: 'anxiety',
      display_name: 'Anxiety',
      description: 'Feeling worried or nervous',
      category: 'mental',
      icon: '😰',
      requires_medical_attention: false,
    },
    {
      name: 'depression',
      display_name: 'Depression',
      description: 'Feeling sad or hopeless',
      category: 'mental',
      icon: '😔',
      requires_medical_attention: false,
    },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('symptoms');
  await knex.schema.dropTableIfExists('symptom_types');
}
