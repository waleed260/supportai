import { Platform } from 'react-native'

let Speech: typeof import('expo-speech') | null = null

async function initSpeech() {
  if (!Speech) {
    Speech = await import('expo-speech')
  }
  return Speech
}

export async function speakText(text: string, language?: string) {
  if (Platform.OS === 'web') return
  const speech = await initSpeech()
  speech.speak(text, {
    language: language ?? 'en',
    rate: 1.0,
    pitch: 1.0,
  })
}

export async function stopSpeaking() {
  if (Platform.OS === 'web') return
  const speech = await initSpeech()
  speech.stop()
}

export function isSpeakingAvailable(): boolean {
  return Platform.OS !== 'web'
}
