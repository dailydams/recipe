import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabase'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'your-gemini-api-key-here') {
      return NextResponse.json(
        { error: 'Google API Key가 설정되지 않았습니다. .env.local 파일에서 GOOGLE_API_KEY를 설정해주세요.' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const image = formData.get('image') as File
    
    if (!image) {
      return NextResponse.json(
        { error: '이미지 파일이 제공되지 않았습니다.' },
        { status: 400 }
      )
    }

    // Validate image type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '업로드된 파일이 이미지가 아닙니다.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '이미지 파일 크기는 10MB 이하여야 합니다.' },
        { status: 400 }
      )
    }

    console.log(`Processing image with Gemini: ${image.name}, size: ${(image.size / 1024 / 1024).toFixed(2)}MB`)

    // Convert image to base64
    const imageBuffer = Buffer.from(await image.arrayBuffer())
    const base64Image = imageBuffer.toString('base64')

    try {
      // Get Gemini Pro Vision model
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      // Create the prompt for recipe extraction
      const promptText = [
        "Extract recipe information from this image and respond ONLY in JSON format:",
        "",
        'Expected JSON format:',
        "{",
        '  "title": "Recipe Title",',
        '  "ingredients": ["ingredient 1", "ingredient 2"],',
        '  "instructions": ["step 1", "step 2"]',
        "}",
        "",
        "Rules:",
        "1. Korean recipes in Korean, English recipes in English",
        "2. Include quantities with ingredients",
        "3. Separate cooking steps",
        "4. Empty arrays if no recipe found",
        "5. JSON only, no markdown, no extra text",
        "",
        "If no recipe found, return:",
        '{"title": "", "ingredients": [], "instructions": []}'
      ].join('\n')
      
      const prompt = promptText

      // Analyze image with Gemini
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: image.type,
          },
        },
      ])

      const response = await result.response
      const text = response.text()
      
      console.log('Gemini response:', text)

      // Parse JSON response
      let recipeData
      try {
        // Clean the response text (remove any potential markdown or extra characters)
        const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim()
        recipeData = JSON.parse(cleanedText)
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', text)
        return NextResponse.json(
          { error: 'AI 응답을 파싱하는데 실패했습니다. 다시 시도해주세요.' },
          { status: 500 }
        )
      }

      // Validate extracted data
      if (!recipeData.title && (!recipeData.ingredients || recipeData.ingredients.length === 0)) {
        return NextResponse.json(
          { error: '이미지에서 레시피 정보를 찾을 수 없습니다. 레시피가 포함된 이미지를 업로드해주세요.' },
          { status: 404 }
        )
      }

      // Set default title if empty
      if (!recipeData.title) {
        recipeData.title = '이름 없는 레시피'
      }

      // Ensure arrays exist
      recipeData.ingredients = recipeData.ingredients || []
      recipeData.instructions = recipeData.instructions || []

      console.log('Extracted recipe data:', {
        title: recipeData.title,
        ingredientCount: recipeData.ingredients.length,
        instructionCount: recipeData.instructions.length
      })

      // Save to database
      if (!supabase) {
        return NextResponse.json(
          { error: '데이터베이스 연결이 구성되지 않았습니다.' },
          { status: 500 }
        )
      }

      const { data: savedRecipe, error: dbError } = await supabase
        .from('recipes')
        .insert({
          title: recipeData.title,
          ingredients: recipeData.ingredients,
          instructions: recipeData.instructions,
          source: `gemini_${Date.now()}.${image.name.split('.').pop()}`,
          source_type: 'image',
          raw_content: text
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        return NextResponse.json(
          { error: '레시피를 데이터베이스에 저장하는데 실패했습니다.' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        recipe: savedRecipe,
        extractedData: recipeData
      })

    } catch (aiError) {
      console.error('Gemini AI error:', aiError)
      return NextResponse.json(
        { error: 'AI 이미지 분석 중 오류가 발생했습니다. 다시 시도해주세요.' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Image processing error:', error)
    return NextResponse.json(
      { error: '이미지 처리 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}