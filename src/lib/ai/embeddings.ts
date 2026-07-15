import OpenAI from 'openai'

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY
  if (!key || key.startsWith('your-')) return null
  return new OpenAI({ apiKey: key })
}

export async function generateEmbedding(text: string): Promise<number[] | null> {
  const client = getOpenAI()
  if (!client) return null
  try {
    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1024,
    })
    return response.data[0].embedding
  } catch {
    return null
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][] | null> {
  const client = getOpenAI()
  if (!client) return null
  try {
    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
      dimensions: 1024,
    })
    return response.data.map(d => d.embedding)
  } catch {
    return null
  }
}

export async function chunkText(text: string, maxChunkSize = 1000): Promise<string[]> {
  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text]
  const chunks: string[] = []
  let current = ''

  for (const sentence of sentences) {
    if ((current + sentence).length > maxChunkSize && current) {
      chunks.push(current.trim())
      current = sentence
    } else {
      current += sentence
    }
  }
  if (current.trim()) chunks.push(current.trim())

  return chunks
}

export async function extractTextFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'SupportAI/1.0' },
    })
    const html = await response.text()

    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return text.slice(0, 50000)
  } catch {
    return ''
  }
}
