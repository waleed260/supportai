import { View, Text } from 'react-native'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon = '📭', title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <Text className="text-5xl mb-4">{icon}</Text>
      <Text className="text-gray-500 text-base font-medium text-center">{title}</Text>
      {description && (
        <Text className="text-gray-400 text-sm mt-1.5 text-center">{description}</Text>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="primary" size="md" className="mt-5" />
      )}
    </View>
  )
}
