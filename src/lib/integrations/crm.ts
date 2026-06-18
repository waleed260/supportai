import { createServiceRoleClient } from '@/lib/supabase/server'
import { log } from '@/lib/logger'

type LeadData = {
  name?: string
  email?: string
  phone?: string
  product_interest?: string
  budget?: string
  source?: string
}

export async function syncLeadToCrm(organizationId: string, lead: LeadData) {
  const supabase = await createServiceRoleClient()

  const { data: integrations } = await supabase
    .from('org_integrations')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_enabled', true)

  if (!integrations || integrations.length === 0) return

  for (const integration of integrations) {
    try {
      switch (integration.provider) {
        case 'hubspot':
          await pushToHubspot(integration.credentials, lead)
          break
        case 'salesforce':
          await pushToSalesforce(integration.credentials, lead)
          break
        case 'zoho':
          await pushToZoho(integration.credentials, lead)
          break
        case 'google_sheets':
          await pushToGoogleSheets(integration.credentials, lead)
          break
      }
    } catch (err) {
      log.error(`CRM sync failed for ${integration.provider}`, {
        error: err,
        route: 'crm:syncLeadToCrm',
        orgId: organizationId,
        provider: integration.provider,
      })
    }
  }
}

async function pushToHubspot(credentials: Record<string, any>, lead: LeadData) {
  const apiKey = credentials.api_key || credentials.access_token
  if (!apiKey) return

  await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        firstname: lead.name?.split(' ')[0] || '',
        lastname: lead.name?.split(' ').slice(1).join(' ') || '',
        email: lead.email || '',
        phone: lead.phone || '',
        hs_lead_status: 'NEW',
        lead_source__c: lead.source || 'SupportAI',
        product_interest: lead.product_interest || '',
      },
    }),
  })
}

async function pushToSalesforce(credentials: Record<string, any>, lead: LeadData) {
  const { instance_url, access_token } = credentials
  if (!instance_url || !access_token) return

  await fetch(`${instance_url}/services/data/v58.0/sobjects/Lead`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      FirstName: lead.name?.split(' ')[0] || '',
      LastName: lead.name?.split(' ').slice(1).join(' ') || lead.name || 'Unknown',
      Email: lead.email || '',
      Phone: lead.phone || '',
      LeadSource: lead.source || 'SupportAI',
      Product_Interest__c: lead.product_interest || '',
    }),
  })
}

async function pushToZoho(credentials: Record<string, any>, lead: LeadData) {
  const { access_token, api_domain } = credentials
  if (!access_token || !api_domain) return

  await fetch(`${api_domain || 'https://www.zohoapis.com'}/crm/v2/Leads`, {
    method: 'POST',
    headers: {
      'Authorization': `Zoho-oauthtoken ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: [{
        First_Name: lead.name?.split(' ')[0] || '',
        Last_Name: lead.name?.split(' ').slice(1).join(' ') || lead.name || 'Unknown',
        Email: lead.email || '',
        Phone: lead.phone || '',
        Lead_Source: lead.source || 'SupportAI',
      }],
    }),
  })
}

async function pushToGoogleSheets(credentials: Record<string, any>, lead: LeadData) {
  const { spreadsheet_id, sheet_name, service_account_email, private_key } = credentials
  if (!spreadsheet_id) return

  const values = [
    [new Date().toISOString(), lead.name || '', lead.email || '', lead.phone || '', lead.product_interest || '', lead.source || 'SupportAI'],
  ]

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${sheet_name || 'Sheet1'}!A:F:append?valueInputOption=USER_ENTERED`

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: private_key,
    }),
  })
  const tokenData = await tokenResponse.json() as { access_token?: string }

  if (tokenData.access_token) {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    })
  }
}
