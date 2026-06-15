import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generateEmbedding, chunkText, extractTextFromUrl } from '@/lib/ai/embeddings'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const knowledge_source_id = formData.get('knowledge_source_id') as string
    const file = formData.get('file') as File | null

    if (!knowledge_source_id) {
      return NextResponse.json({ error: 'knowledge_source_id is required' }, { status: 400 })
    }

    const supabase = await createServiceRoleClient()

    const { data: source } = await supabase.from('knowledge_sources')
      .select('*').eq('id', knowledge_source_id).single()

    if (!source) {
      return NextResponse.json({ error: 'Knowledge source not found' }, { status: 404 })
    }

    await supabase.from('knowledge_sources')
      .update({ status: 'processing' }).eq('id', knowledge_source_id)

    let text = ''

    if (source.type === 'website' && source.source_url) {
      text = await extractTextFromUrl(source.source_url)
    } else if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileName = file.name.toLowerCase()

      if (fileName.endsWith('.pdf')) {
        const pdfParse = (await import('pdf-parse')).default
        const pdfData = await pdfParse(buffer)
        text = pdfData.text
      } else if (fileName.endsWith('.docx')) {
        const mammoth = await import('mammoth')
        const result = await mammoth.extractRawText({ buffer })
        text = result.value
      } else {
        text = buffer.toString('utf-8')
      }
    }

    if (!text) {
      await supabase.from('knowledge_sources')
        .update({ status: 'failed', error_message: 'No content extracted' }).eq('id', knowledge_source_id)
      return NextResponse.json({ error: 'No content extracted' }, { status: 400 })
    }

    const chunks = await chunkText(text)
    let chunkCount = 0

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk)
      if (embedding) {
        const embeddingArray = `[${embedding.join(',')}]`
        await supabase.from('documents').insert({
          knowledge_source_id,
          organization_id: source.organization_id,
          content: chunk,
          embedding: embeddingArray as any,
          metadata: { source_url: source.source_url, chunk_index: chunkCount, file_name: file?.name },
        })
        chunkCount++
      }
    }

    await supabase.from('knowledge_sources')
      .update({ status: 'completed', chunk_count: chunkCount }).eq('id', knowledge_source_id)

    return NextResponse.json({ success: true, chunks_processed: chunkCount })
  } catch (error) {
    console.error('Knowledge processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
