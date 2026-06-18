const CHUNK_SIZE = 2000
const CHUNK_OVERLAP = 200

export function splitIntoChunks(text: string, chunkSize = CHUNK_SIZE): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    let end = start + chunkSize

    if (end < text.length) {
      const boundary = text.lastIndexOf('\n\n', end)
      if (boundary > start) {
        end = boundary
      } else {
        const sentence = text.lastIndexOf('. ', end)
        if (sentence > start) {
          end = sentence + 1
        }
      }
    }

    chunks.push(text.slice(start, end).trim())
    start = end - CHUNK_OVERLAP
  }

  return chunks.filter(c => c.length > 0)
}

export async function chunkText(text: string): Promise<string[]> {
  return splitIntoChunks(text, CHUNK_SIZE)
}
