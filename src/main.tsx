import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { getAccessToken } from './features/auth/infrastructure/authStorage'
import { configureAccessTokenResolver } from './shared/lib/httpClient'
import './index.css'
import App from './App.tsx'
import './performance.css'

const documentElement = document.documentElement
const materialSymbolsFamily = 'Material Symbols Outlined'
const materialSymbolsFont = `24px "${materialSymbolsFamily}"`
const materialIconsFallbackDelay = 2200
const materialIconsReadyPollInterval = 250
const materialIconsReadyPollDuration = 8000
const performanceProfileQueries = [
  window.matchMedia('(max-width: 900px)'),
  window.matchMedia('(pointer: coarse)'),
  window.matchMedia('(prefers-reduced-motion: reduce)'),
  window.matchMedia('(update: slow)'),
]

configureAccessTokenResolver(getAccessToken)

let materialIconsFallbackTimer: number | undefined
let materialIconsReadyPollTimer: number | undefined
let materialIconsStopPollingTimer: number | undefined

function syncPerformanceProfile() {
  const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number }
  const cpuCores = navigator.hardwareConcurrency ?? 8
  const deviceMemory = navigatorWithMemory.deviceMemory ?? 8
  const shouldUseLiteProfile = (
    cpuCores <= 4 ||
    deviceMemory <= 4 ||
    performanceProfileQueries.some((query) => query.matches)
  )

  documentElement.classList.toggle('performance-lite', shouldUseLiteProfile)
}

function measureInitialFrameBudget() {
  const maxSamples = 24
  let samples = 0
  let slowFrames = 0
  let previousFrameTime = performance.now()

  function sampleFrame(currentFrameTime: number) {
    const frameDuration = currentFrameTime - previousFrameTime
    previousFrameTime = currentFrameTime
    samples += 1

    if (frameDuration > 24) {
      slowFrames += 1
    }

    if (samples < maxSamples) {
      window.requestAnimationFrame(sampleFrame)
      return
    }

    if (slowFrames >= 6) {
      documentElement.classList.add('performance-lite')
    }
  }

  window.requestAnimationFrame(sampleFrame)
}

syncPerformanceProfile()
performanceProfileQueries.forEach((query) => {
  query.addEventListener('change', syncPerformanceProfile)
})
measureInitialFrameBudget()

documentElement.classList.remove('material-icons-ready', 'material-icons-fallback')
documentElement.classList.add('material-icons-pending')

function markMaterialIconsReady() {
  if (materialIconsFallbackTimer) {
    window.clearTimeout(materialIconsFallbackTimer)
  }
  if (materialIconsReadyPollTimer) {
    window.clearInterval(materialIconsReadyPollTimer)
  }
  if (materialIconsStopPollingTimer) {
    window.clearTimeout(materialIconsStopPollingTimer)
  }

  documentElement.classList.add('material-icons-ready')
  documentElement.classList.remove('material-icons-pending', 'material-icons-fallback')
}

function markMaterialIconsFallback() {
  if (documentElement.classList.contains('material-icons-ready')) {
    return
  }

  documentElement.classList.add('material-icons-fallback')
  documentElement.classList.remove('material-icons-pending')
}

function hasLoadedMaterialSymbols(fontFaces: FontFace[] = Array.from(document.fonts)) {
  return fontFaces.some((fontFace) => (
    fontFace.family.replace(/["']/g, '') === materialSymbolsFamily &&
    fontFace.status === 'loaded'
  ))
}

function startMaterialIconsReadyPolling() {
  materialIconsReadyPollTimer = window.setInterval(() => {
    if (hasLoadedMaterialSymbols()) {
      markMaterialIconsReady()
    }
  }, materialIconsReadyPollInterval)

  materialIconsStopPollingTimer = window.setTimeout(() => {
    if (materialIconsReadyPollTimer) {
      window.clearInterval(materialIconsReadyPollTimer)
    }
  }, materialIconsReadyPollDuration)
}

if ('fonts' in document) {
  materialIconsFallbackTimer = window.setTimeout(markMaterialIconsFallback, materialIconsFallbackDelay)
  startMaterialIconsReadyPolling()

  void document.fonts.load(materialSymbolsFont, 'school')
    .then((fontFaces) => {
      if (hasLoadedMaterialSymbols(fontFaces) || hasLoadedMaterialSymbols()) {
        markMaterialIconsReady()
      }
    })
    .catch(() => {
      markMaterialIconsFallback()
    })

  void document.fonts.ready
    .then(() => {
      if (hasLoadedMaterialSymbols()) {
        markMaterialIconsReady()
      }
    })
    .catch(() => {
      markMaterialIconsFallback()
    })
} else {
  markMaterialIconsReady()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
