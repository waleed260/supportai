import { View } from 'react-native'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <View className={`bg-gray-200 rounded animate-pulse ${className}`} accessibilityLabel="Loading" />
  )
}

export function InboxSkeleton() {
  return (
    <View className="flex-1 bg-white p-4 gap-4">
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-8 w-full rounded-lg" />
      {Array.from({ length: 8 }).map((_, i) => (
        <View key={i} className="flex-row items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </View>
        </View>
      ))}
    </View>
  )
}

export function ConversationDetailSkeleton() {
  return (
    <View className="flex-1 bg-white p-4">
      <View className="gap-4 mt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} className={`${i % 2 === 0 ? 'self-start' : 'self-end'} max-w-[80%] gap-2`}>
            <Skeleton className={`h-3 w-16 rounded`} />
            <Skeleton className={`h-16 w-48 rounded-2xl`} />
          </View>
        ))}
      </View>
    </View>
  )
}

export function AnalyticsSkeleton() {
  return (
    <View className="flex-1 bg-gray-50 p-4 gap-4">
      <View className="flex-row gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="flex-1 h-24 rounded-xl" />
        ))}
      </View>
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </View>
  )
}
