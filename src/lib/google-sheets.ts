import { google } from 'googleapis'
import { Recipe } from '@/types'

export type { Recipe }

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const SHEET_RANGE = '시트1'

// Sheet columns: A=id, B=title, C=ingredients(JSON), D=instructions(JSON),
// E=source, F=source_type, G=category, H=created_at, I=updated_at, J=favorite
export async function getGoogleSheetClient() {
  const sheetId = process.env.GOOGLE_SHEETS_ID
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY

  if (!sheetId) {
    throw new Error('GOOGLE_SHEETS_ID is missing')
  }
  if (!email || !privateKey) {
    throw new Error('Google service account credentials are missing')
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: privateKey.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  })

  const client = await auth.getClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return google.sheets({ version: 'v4', auth: client as any })
}

function recipeToRow(recipe: Recipe): (string | number)[] {
  return [
    recipe.id,
    recipe.title,
    JSON.stringify(recipe.ingredients),
    JSON.stringify(recipe.instructions),
    recipe.source,
    recipe.source_type,
    recipe.category,
    recipe.created_at,
    recipe.updated_at,
    recipe.favorite ? 'TRUE' : 'FALSE',
  ]
}

export async function getRecipes(): Promise<Recipe[]> {
  const sheets = await getGoogleSheetClient()

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: `${SHEET_RANGE}!A2:J`, // Headers are in row 1
    })

    const rows = response.data.values || []

    return rows.map((row) => {
      const [
        id,
        title,
        ingredientsJson,
        instructionsJson,
        source,
        source_type,
        category,
        created_at,
        updated_at,
        favorite
      ] = row

      return {
        id: id || '',
        title: title || '',
        ingredients: parseJSON(ingredientsJson, []),
        instructions: parseJSON(instructionsJson, []),
        source: source || '',
        source_type: (source_type as Recipe['source_type']) || 'image',
        category: (category as Recipe['category']) || '전체',
        favorite: favorite === 'TRUE',
        created_at: created_at || new Date().toISOString(),
        updated_at: updated_at || new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error('Error fetching recipes from Google Sheets:', error)
    return []
  }
}

export async function addRecipe(
  recipe: Omit<Recipe, 'id' | 'favorite' | 'created_at' | 'updated_at'> & { favorite?: boolean }
): Promise<Recipe> {
  const sheets = await getGoogleSheetClient()

  const newRecipe: Recipe = {
    ...recipe,
    favorite: recipe.favorite ?? false,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: `${SHEET_RANGE}!A:J`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [recipeToRow(newRecipe)],
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
  const updatedRecipe = { ...currentRecipe, ...updates, id, updated_at: new Date().toISOString() }

  // Row index in sheet is rowIndex + 2 (1-based, plus header row)
  const sheetRowIndex = rowIndex + 2

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: `${SHEET_RANGE}!A${sheetRowIndex}:J${sheetRowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [recipeToRow(updatedRecipe)],
    },
  })

  return updatedRecipe
}

export async function deleteRecipe(id: string): Promise<boolean> {
  const sheets = await getGoogleSheetClient()
  const recipes = await getRecipes()

  const rowIndex = recipes.findIndex(r => r.id === id)
  if (rowIndex === -1) return false

  // deleteDimension uses 0-based index: header is 0, first data row is 1
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
