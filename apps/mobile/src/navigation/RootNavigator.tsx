import { View, ActivityIndicator } from 'react-native'
import { useAuth } from '../hooks/useAuth'
import AuthStack from './AuthStack'
import ClientAdminTabs from './ClientAdminTabs'
import TeamMemberTabs from './TeamMemberTabs'
import SuperAdminTabs from './SuperAdminTabs'
import AwaitingApprovalScreen from '../screens/auth/AwaitingApprovalScreen'

export default function RootNavigator() {
  const { user, isLoading, isPendingApproval, role } = useAuth()

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  if (!user) {
    return <AuthStack />
  }

  if (isPendingApproval) {
    return <AwaitingApprovalScreen />
  }

  switch (role) {
    case 'super_admin':
      return <SuperAdminTabs />
    case 'client_admin':
      return <ClientAdminTabs />
    case 'team_member':
      return <TeamMemberTabs />
    default:
      return <AuthStack />
  }
}
