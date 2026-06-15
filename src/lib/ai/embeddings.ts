export async function generateEmbedding(_text: string): Promise<number[]> {
  return new Array(1024).fill(0).map(() => Math.random() - 0.5)
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
