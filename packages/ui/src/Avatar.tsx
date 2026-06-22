import { View, Text, Image } from 'react-native'

interface AvatarProps {
  name?: string
  imageUrl?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = { sm: 8, md: 10, lg: 14 }
const textSizeMap = { sm: 'text-xs', md: 'text-sm', lg: 'text-lg' }

function getInitials(name?: string): string {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function Avatar({ name, imageUrl, size = 'md', className = '' }: AvatarProps) {
  const dim = sizeMap[size]

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        className={`w-${dim} h-${dim} rounded-full ${className}`}
        accessibilityLabel={name ?? 'Avatar'}
      />
    )
  }

  return (
    <View className={`w-${dim} h-${dim} rounded-full bg-blue-100 items-center justify-center ${className}`}>
      <Text className={`font-semibold text-blue-600 ${textSizeMap[size]}`}>{getInitials(name)}</Text>
    </View>
  )
}
