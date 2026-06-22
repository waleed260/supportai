import { View } from 'react-native'

interface CardProps {
  children: React.ReactNode
  className?: string
  padded?: boolean
}

export function Card({ children, className = '', padded = true }: CardProps) {
  return (
    <View className={`bg-white rounded-xl border border-gray-200 ${padded ? 'p-4' : ''} ${className}`}>
      {children}
    </View>
  )
}
