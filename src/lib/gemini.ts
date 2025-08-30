// Gemini API를 사용한 레시피 추출 개선 (선택사항)

export async function enhanceRecipeWithGemini(rawText: string) {
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    console.log('Gemini API key not provided, using basic parsing')
    return null
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `다음 텍스트에서 레시피 정보를 JSON 형태로 추출해주세요. 
            제목, 재료 배열, 조리법 배열로 구성해주세요.
            
            텍스트:
            ${rawText}
            
            응답 형식:
            {
              "title": "레시피 제목",
              "ingredients": ["재료1", "재료2", ...],
              "instructions": ["단계1", "단계2", ...]
            }`
          }]
        }]
      })
    })

    const data = await response.json()
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      const jsonText = data.candidates[0].content.parts[0].text
      // JSON 부분만 추출
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    }
    
    return null
  } catch (error) {
    console.error('Gemini API error:', error)
    return null
  }
}