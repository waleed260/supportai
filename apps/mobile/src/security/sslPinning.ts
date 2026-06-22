import { Platform } from 'react-native'

const pinnedDomains: Record<string, { includeSubdomains: boolean; pinnedKeys: string[] }> = {
  'supportai.app': {
    includeSubdomains: true,
    pinnedKeys: [],
  },
}

export function getPinnedDomains() {
  return pinnedDomains
}

export function addPinnedKey(domain: string, keyHash: string) {
  if (pinnedDomains[domain]) {
    pinnedDomains[domain].pinnedKeys.push(keyHash)
  }
}
