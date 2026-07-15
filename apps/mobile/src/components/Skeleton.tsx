import { useEffect, useMemo } from 'react'
import { View, Animated } from 'react-native'

function SkeletonBlock({ className }: { className?: string }) {
  const opacity = useMemo(() => new Animated.Value(0.3), [])

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [opacity])

  return (
    <Animated.View
      className={`bg-gray-200 rounded-lg ${className || ''}`}
      style={{ opacity }}
    />
  )
}

export function InboxSkeleton() {
  return (
    <View className="flex-1 bg-gray-50 px-4 pt-4">
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} className="flex-row items-center mb-4">
          <SkeletonBlock className="w-10 h-10 rounded-full mr-3" />
          <View className="flex-1">
            <SkeletonBlock className="h-4 w-2/3 mb-2" />
            <SkeletonBlock className="h-3 w-full" />
          </View>
        </View>
      ))}
    </View>
  )
}

export function AnalyticsSkeleton() {
  return (
    <View className="flex-1 bg-gray-50 px-4 pt-4">
      <View className="flex-row gap-3 mb-4">
        <SkeletonBlock className="flex-1 h-24 rounded-2xl" />
        <SkeletonBlock className="flex-1 h-24 rounded-2xl" />
      </View>
      <View className="flex-row gap-3 mb-4">
        <SkeletonBlock className="flex-1 h-24 rounded-2xl" />
        <SkeletonBlock className="flex-1 h-24 rounded-2xl" />
      </View>
      <SkeletonBlock className="h-48 rounded-2xl mb-4" />
      <SkeletonBlock className="h-48 rounded-2xl" />
    </View>
  )
}

export { SkeletonBlock }
