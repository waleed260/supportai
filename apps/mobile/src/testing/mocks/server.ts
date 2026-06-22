import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('*/api/conversations', () => {
    return HttpResponse.json([
      {
        id: '1',
        organization_id: 'org-1',
        channel: 'web_chat',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        status: 'active',
        sentiment: 'neutral',
        is_sales_mode: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
  }),

  http.get('*/api/conversations/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      organization_id: 'org-1',
      channel: 'web_chat',
      customer_name: 'John Doe',
      status: 'active',
      sentiment: 'neutral',
      is_sales_mode: false,
      messages: [
        {
          id: 'msg-1',
          conversation_id: params.id,
          role: 'customer',
          content: 'Hello, I need help',
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }),

  http.post('*/api/messages', () => {
    return HttpResponse.json({ id: 'new-msg-1' }, { status: 201 })
  }),

  http.get('*/api/leads', () => {
    return HttpResponse.json([
      {
        id: 'lead-1',
        organization_id: 'org-1',
        name: 'Jane Smith',
        email: 'jane@example.com',
        status: 'new',
        source: 'web_chat',
        created_at: new Date().toISOString(),
      },
    ])
  }),

  http.get('*/api/analytics', () => {
    return HttpResponse.json({
      total_conversations: 150,
      active_conversations: 12,
      avg_response_time: 45,
      resolution_rate: 0.87,
      escalation_rate: 0.12,
      lead_conversion_rate: 0.23,
      sentiment_breakdown: { positive: 60, neutral: 25, negative: 10, frustrated: 3, high_risk: 2 },
      conversations_by_channel: { web_chat: 80, whatsapp: 40, email: 30 },
      conversations_over_time: [],
    })
  }),
]

export const server = setupServer(...handlers)
