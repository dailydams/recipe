-- Add category column to existing recipes table
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT '전체' CHECK (category IN ('전체', '소담', '어른'));

-- Create an index on category for faster filtering
CREATE INDEX IF NOT EXISTS recipes_category_idx ON recipes (category);

-- Update existing recipes to have '전체' category if they don't have one
UPDATE recipes SET category = '전체' WHERE category IS NULL;

-- Update the sample data to include categories (optional)
UPDATE recipes SET category = '소담' WHERE title LIKE '%김치찌개%';
UPDATE recipes SET category = '어른' WHERE title LIKE '%크림파스타%';