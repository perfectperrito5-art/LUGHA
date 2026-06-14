/** Pick a MediaRecorder mime type that works on mobile Safari + Chrome. */
export function getRecorderMimeType() {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
    'audio/ogg;codecs=opus',
  ]
  if (typeof MediaRecorder === 'undefined') return ''
  return types.find((t) => MediaRecorder.isTypeSupported(t)) || ''
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/** ~15s voice clip at reasonable quality */
export const MAX_AUDIO_BYTES = 600_000
