import { View, Text } from 'react-native'
import { Button } from './Button'

interface ErrorStateProps {
  message?: string
  error?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Something went wrong', error, onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-5xl mb-4">⚠️</Text>
      <Text className="text-gray-600 text-base text-center font-medium">{message}</Text>
      {error && (
        <Text className="text-gray-400 text-sm mt-1.5 text-center">{error}</Text>
      )}
      {onRetry && (
        <Button title="Retry" onPress={onRetry} variant="primary" size="md" className="mt-5" />
      )}
    </View>
  )
}
