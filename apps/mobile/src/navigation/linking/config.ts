import type { LinkingOptions } from '@react-navigation/native'

export const linkingConfig: LinkingOptions<any> = {
  prefixes: ['supportai://', 'https://supportai.app'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
          ResetPassword: 'reset-password',
        },
      },
      App: {
        screens: {
          Inbox: {
            screens: {
              InboxList: 'inbox',
              ConversationDetail: 'conversation/:id',
            },
          },
          Leads: {
            screens: {
              LeadsList: 'leads',
              LeadDetail: 'lead/:id',
            },
          },
          Escalations: {
            screens: {
              EscalationsList: 'escalations',
            },
          },
          Analytics: 'analytics',
          Settings: {
            screens: {
              SettingsMain: 'settings',
              AgentConfig: 'agent/:orgId',
            },
          },
        },
      },
    },
  },
}
