import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native'

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  className?: string
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: 'bg-blue-600', text: 'text-white' },
  secondary: { bg: 'bg-gray-100', text: 'text-gray-900' },
  destructive: { bg: 'bg-red-600', text: 'text-white' },
  ghost: { bg: 'bg-transparent', text: 'text-blue-600' },
  outline: { bg: 'bg-transparent', text: 'text-blue-600', border: 'border border-blue-600' },
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 rounded-lg',
  md: 'px-4 py-2.5 rounded-xl',
  lg: 'px-6 py-3.5 rounded-xl',
}

const textSizes: Record<ButtonSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

export function Button({ title, onPress, variant = 'primary', size = 'md', disabled, loading, icon, className = '' }: ButtonProps) {
  const v = variantStyles[variant]
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`flex-row items-center justify-center ${v.bg} ${sizeStyles[size]} ${isDisabled ? 'opacity-50' : ''} ${v.border ?? ''} ${className}`}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'destructive' ? 'white' : '#2563eb'} size="small" />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className={`font-semibold ${v.text} ${textSizes[size]}`}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}
