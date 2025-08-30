-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    ingredients TEXT[] NOT NULL DEFAULT '{}',
    instructions TEXT[] NOT NULL DEFAULT '{}',
    source TEXT,
    source_type TEXT NOT NULL CHECK (source_type IN ('instagram', 'image')),
    raw_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on title for faster searching
CREATE INDEX IF NOT EXISTS recipes_title_idx ON recipes USING GIN (to_tsvector('english', title));

-- Create an index on ingredients for faster ingredient-based searching
CREATE INDEX IF NOT EXISTS recipes_ingredients_idx ON recipes USING GIN (ingredients);

-- Create an index on source_type for filtering
CREATE INDEX IF NOT EXISTS recipes_source_type_idx ON recipes (source_type);

-- Create an index on created_at for ordering
CREATE INDEX IF NOT EXISTS recipes_created_at_idx ON recipes (created_at DESC);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_recipes_updated_at 
    BEFORE UPDATE ON recipes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - optional, for future user authentication
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations for now (you can make this more restrictive later)
CREATE POLICY "Allow all operations on recipes" ON recipes
    FOR ALL
    TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- Insert some sample data for testing (optional)
INSERT INTO recipes (title, ingredients, instructions, source, source_type, raw_content) VALUES 
(
    '간단한 김치찌개',
    ARRAY['김치 200g', '돼지고기 150g', '두부 1모', '대파 1대', '고춧가루 1큰술', '다시마육수 2컵'],
    ARRAY[
        '팬에 돼지고기를 볶아주세요',
        '김치를 넣고 함께 �볶아주세요', 
        '육수를 넣고 끓여주세요',
        '두부와 대파를 넣고 5분간 더 끓여주세요',
        '간을 맞춰 완성하세요'
    ],
    'https://www.instagram.com/example',
    'instagram',
    '김치찌개 만드는 법: 돼지고기와 김치를 볶고...'
),
(
    '크림파스타',
    ARRAY['파스타면 100g', '생크림 200ml', '마늘 3쪽', '베이컨 100g', '파르메산치즈 50g', '소금', '후추'],
    ARRAY[
        '파스타면을 삶아주세요',
        '팬에 베이컨을 볶아주세요',
        '마늘을 넣고 향을 내세요',
        '생크림을 넣고 끓여주세요',
        '삶은 파스타와 치즈를 넣고 섞어주세요'
    ],
    'image_upload.jpg',
    'image',
    'Cream Pasta Recipe: Cook pasta, fry bacon, add cream...'
);

-- Function to search recipes by ingredients
CREATE OR REPLACE FUNCTION search_recipes_by_ingredients(search_ingredients TEXT[])
RETURNS SETOF recipes AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM recipes
    WHERE ingredients && search_ingredients
    ORDER BY (
        SELECT COUNT(*)
        FROM unnest(ingredients) AS ingredient
        WHERE ingredient = ANY(search_ingredients)
    ) DESC, created_at DESC;
END;
$$ LANGUAGE plpgsql;