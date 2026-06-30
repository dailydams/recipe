import { google } from 'googleapis'

export type Recipe = {
  id: string
  title: string
  ingredients: string[]
  instructions: string[]
  source: string
  source_type: 'instagram' | 'image' | 'manual'
  category: '전체' | '소담' | '어른'
  created_at: string
  updated_at: string
}

// Environment variables
// const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID // Moved inside functions
// Import credentials directly to avoid .env formatting issues
// import credentials from '../../../recipe-481314-5838879b24c0.json'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

export async function getGoogleSheetClient() {
  const sheetId = process.env.GOOGLE_SHEETS_ID
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY

  console.log('Debug Env Vars:', {
    sheetIdLength: sheetId?.length,
    emailLength: email?.length,
    privateKeyLength: privateKey?.length,
    privateKeyHasLiteralNewline: privateKey?.includes('\\n'),
    privateKeyHasRealNewline: privateKey?.includes('\n')
  })

  if (!sheetId) {
    throw new Error('GOOGLE_SHEETS_ID is missing')
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: privateKey?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  })

  const client = await auth.getClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return google.sheets({ version: 'v4', auth: client as any })
}

export async function getRecipes(): Promise<Recipe[]> {
  const sheets = await getGoogleSheetClient()

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: '시트1!A2:I', // Assuming headers are in row 1
    })

    const rows = response.data.values || []

    return rows.map((row) => {
      // Handle potential missing columns safely
      const [
        id,
        title,
        ingredientsJson,
        instructionsJson,
        source,
        source_type,
        category,
        created_at,
        updated_at
      ] = row

      return {
        id: id || '',
        title: title || '',
        ingredients: parseJSON(ingredientsJson, []),
        instructions: parseJSON(instructionsJson, []),
        source: source || '',
        source_type: (source_type as Recipe['source_type']) || 'image',
        category: (category as Recipe['category']) || '전체',
        created_at: created_at || new Date().toISOString(),
        updated_at: updated_at || new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error('Error fetching recipes from Google Sheets:', error)
    return []
  }
}

export async function addRecipe(recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>): Promise<Recipe> {
  const sheets = await getGoogleSheetClient()

  const newRecipe: Recipe = {
    ...recipe,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const row = [
    newRecipe.id,
    newRecipe.title,
    JSON.stringify(newRecipe.ingredients),
    JSON.stringify(newRecipe.instructions),
    newRecipe.source,
    newRecipe.source_type,
    newRecipe.category,
    newRecipe.created_at,
    newRecipe.updated_at
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: '시트1!A:I',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [row],
    },
  })

  return newRecipe
}

export async function updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe | null> {
  const sheets = await getGoogleSheetClient()
  const recipes = await getRecipes()

  const rowIndex = recipes.findIndex(r => r.id === id)
  if (rowIndex === -1) return null

  const currentRecipe = recipes[rowIndex]
  const updatedRecipe = { ...currentRecipe, ...updates, updated_at: new Date().toISOString() }

  // Row index in sheet is rowIndex + 2 (1-based, plus header row)
  const sheetRowIndex = rowIndex + 2

  const row = [
    updatedRecipe.id,
    updatedRecipe.title,
    JSON.stringify(updatedRecipe.ingredients),
    JSON.stringify(updatedRecipe.instructions),
    updatedRecipe.source,
    updatedRecipe.source_type,
    updatedRecipe.category,
    updatedRecipe.created_at,
    updatedRecipe.updated_at
  ]

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: `시트1!A${sheetRowIndex}:I${sheetRowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [row],
    },
  })

  return updatedRecipe
}

export async function deleteRecipe(id: string): Promise<boolean> {
  const sheets = await getGoogleSheetClient()
  const recipes = await getRecipes()

  const rowIndex = recipes.findIndex(r => r.id === id)
  if (rowIndex === -1) return false

  // Row index in sheet is rowIndex + 2 (1-based, plus header row)
  // But for deleteDimension, it uses 0-based index. 
  // Header is 0, first data row is 1.
  // So if rowIndex is 0 (first item), it corresponds to sheet row 2, which is index 1.
  const sheetRowIndex = rowIndex + 1

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: 0, // Assuming first sheet
              dimension: 'ROWS',
              startIndex: sheetRowIndex,
              endIndex: sheetRowIndex + 1,
            },
          },
        },
      ],
    },
  })

  return true
}

function parseJSON<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}
