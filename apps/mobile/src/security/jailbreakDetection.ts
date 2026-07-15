import { Platform, NativeModules } from 'react-native'

const suspiciousPaths = [
  '/Applications/Cydia.app',
  '/Library/MobileSubstrate/MobileSubstrate.dylib',
  '/bin/bash',
  '/usr/sbin/sshd',
  '/etc/apt',
  '/private/var/lib/apt',
]

const suspiciousSchemes = [
  'cydia://',
  'sileo://',
  'zbra://',
  'filza://',
]

export async function isDeviceCompromised(): Promise<boolean> {
  if (Platform.OS === 'web') return false

  if (Platform.OS === 'ios') {
    for (const path of suspiciousPaths) {
      try {
        const fs = require('react-native-fs')
        const exists = await fs.exists(path)
        if (exists) return true
      } catch {}
    }

    try {
      const { canOpenURL } = require('react-native').Linking
      for (const scheme of suspiciousSchemes) {
        try {
          const canOpen = await canOpenURL(scheme)
          if (canOpen) return true
        } catch {}
      }
    } catch {}
  }

  if (Platform.OS === 'android') {
    try {
      const Build = require('react-native').NativeModules.Build
      const tags = Build?.TAGS ?? ''
      if (tags.includes('test-keys')) return true
    } catch {}
  }

  return false
}

export function isRunningOnEmulator(): boolean {
  if (Platform.OS === 'web') return false
  if (Platform.OS === 'ios') {
    return Platform.constants?.osVersion?.includes('simulator') ?? false
  }
  return false
}
