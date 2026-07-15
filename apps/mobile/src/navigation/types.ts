import type { NavigatorScreenParams } from '@react-navigation/native'

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
  ResetPassword: { token?: string }
}

export type InboxStackParamList = {
  InboxList: undefined
  ConversationDetail: { id: string }
}

export type EscalationStackParamList = {
  EscalationsList: undefined
  ConversationDetail: { id: string }
}

export type LeadsStackParamList = {
  LeadsList: undefined
  LeadDetail: { id: string }
}

export type SettingsStackParamList = {
  SettingsMain: undefined
  AgentConfig: { orgId: string }
}

export type ClientAdminTabParamList = {
  Inbox: NavigatorScreenParams<InboxStackParamList>
  Escalations: NavigatorScreenParams<EscalationStackParamList>
  Leads: NavigatorScreenParams<LeadsStackParamList>
  Analytics: undefined
  Settings: NavigatorScreenParams<SettingsStackParamList>
}

export type TeamMemberTabParamList = {
  Inbox: NavigatorScreenParams<InboxStackParamList>
  Escalations: NavigatorScreenParams<EscalationStackParamList>
  Settings: NavigatorScreenParams<SettingsStackParamList>
}

export type SuperAdminTabParamList = {
  Clients: undefined
  Analytics: undefined
  Settings: NavigatorScreenParams<SettingsStackParamList>
}

export type AppStackParamList = {
  ClientAdmin: NavigatorScreenParams<ClientAdminTabParamList>
  TeamMember: NavigatorScreenParams<TeamMemberTabParamList>
  SuperAdmin: NavigatorScreenParams<SuperAdminTabParamList>
}

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>
  App: NavigatorScreenParams<AppStackParamList>
  AwaitingApproval: undefined
}
