-- ─── Seed: Common Food Items (public catalog) ────────────────────────────────

INSERT INTO food_items (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, is_custom) VALUES
  ('Chicken breast (raw)',     120, 22.5, 2.6, 0,    false),
  ('Chicken breast (cooked)',  165, 31.0, 3.6, 0,    false),
  ('Beef mince (lean)',        172, 21.0, 9.5, 0,    false),
  ('Salmon (raw)',             208, 20.0, 13.0, 0,   false),
  ('Tuna (canned in water)',    99, 23.0, 0.5, 0,    false),
  ('Egg (whole)',              143, 13.0, 10.0, 0.7, false),
  ('Egg white',                 52, 11.0, 0.2, 0.7,  false),
  ('Greek yogurt (0%)',         59,  9.9, 0.4, 3.6,  false),
  ('Cottage cheese',            98, 11.1, 4.3, 3.4,  false),
  ('Milk (whole)',              61,  3.2, 3.3, 4.8,  false),
  ('Whey protein powder',      370, 80.0, 5.0, 5.0,  false),

  ('White rice (cooked)',      130,  2.7, 0.3, 28.0, false),
  ('Brown rice (cooked)',      112,  2.6, 0.9, 23.5, false),
  ('Oats (dry)',               389, 17.0, 7.0, 66.0, false),
  ('White bread',              265,  9.0, 3.2, 49.0, false),
  ('Pasta (cooked)',           131,  5.0, 0.9, 25.0, false),
  ('Sweet potato (cooked)',     86,  1.6, 0.1, 20.0, false),
  ('Potato (boiled)',           87,  1.9, 0.1, 20.0, false),

  ('Broccoli',                  34,  2.8, 0.4, 6.6,  false),
  ('Spinach',                   23,  2.9, 0.4, 3.6,  false),
  ('Tomato',                    18,  0.9, 0.2, 3.9,  false),
  ('Cucumber',                  15,  0.7, 0.1, 3.6,  false),
  ('Banana',                    89,  1.1, 0.3, 23.0, false),
  ('Apple',                     52,  0.3, 0.2, 14.0, false),
  ('Orange',                    47,  0.9, 0.1, 12.0, false),
  ('Blueberries',               57,  0.7, 0.3, 14.5, false),

  ('Olive oil',                884,  0.0, 100.0, 0,  false),
  ('Butter',                   717,  0.9, 81.0, 0.1, false),
  ('Almonds',                  579, 21.0, 50.0, 22.0, false),
  ('Peanut butter',            588, 25.0, 50.0, 20.0, false),
  ('Avocado',                  160,  2.0, 15.0, 9.0,  false),

  ('Coca-Cola (330ml)',          42,  0.0, 0.0, 10.6, false),
  ('Orange juice',               45,  0.7, 0.2, 10.4, false);
