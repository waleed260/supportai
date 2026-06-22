import { View, Text } from 'react-native'

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  destructive: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
}

export function Badge({ label, variant = 'default', className = '' }: BadgeProps) {
  const s = variantStyles[variant]
  return (
    <View className={`self-start px-2 py-0.5 rounded ${s.split(' ')[0]} ${className}`}>
      <Text className={`text-xs font-medium ${s.split(' ')[1]}`}>{label}</Text>
    </View>
  )
}
