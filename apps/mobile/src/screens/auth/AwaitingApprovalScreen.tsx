import { View, Text, TouchableOpacity } from 'react-native'
import { useAuth } from '../../hooks/useAuth'

export default function AwaitingApprovalScreen() {
  const { user, signOut } = useAuth()

  return (
    <View className="flex-1 justify-center items-center px-8 bg-white">
      <View className="bg-amber-50 border border-amber-200 rounded-2xl p-8 w-full max-w-sm items-center">
        <Text className="text-5xl mb-4">⏳</Text>
        <Text className="text-xl font-bold text-amber-800 mb-2">Awaiting Approval</Text>
        <Text className="text-amber-700 text-center mb-2">
          Your organization is pending approval by our team.
        </Text>
        <Text className="text-amber-600 text-sm text-center mb-6">
          You'll be able to use SupportAI once your account is activated. This usually takes less than 24 hours.
        </Text>
        {user && (
          <Text className="text-amber-600 text-xs mb-6">
            Signed in as {user.email}
          </Text>
        )}
        <TouchableOpacity className="bg-amber-600 rounded-xl py-3 px-8" onPress={signOut}>
          <Text className="text-white font-semibold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
