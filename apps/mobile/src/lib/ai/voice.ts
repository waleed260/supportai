import * as Speech from 'expo-speech'
import { Platform } from 'react-native'

export async function speakText(text: string, language?: string) {
  if (Platform.OS === 'web') return
  const voices = await Speech.getVoicesAsync()
  const voice = language
    ? voices.find(v => v.language.startsWith(language))
    : undefined
  Speech.speak(text, {
    voice: voice?.identifier,
    language: language ?? 'en',
    rate: 1.0,
    pitch: 1.0,
  })
}

export function stopSpeaking() {
  Speech.stop()
}

export function isSpeakingAvailable(): boolean {
  return Platform.OS !== 'web'
}
