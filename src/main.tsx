import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { getAccessToken } from './features/auth/infrastructure/authStorage'
import { configureAccessTokenResolver } from './shared/lib/httpClient'
import './index.css'
import App from './App.tsx'

const documentElement = document.documentElement
const materialSymbolsFamily = 'Material Symbols Outlined'
const materialSymbolsFont = `24px "${materialSymbolsFamily}"`
const materialIconsFallbackDelay = 2200
const materialIconsReadyPollInterval = 250
const materialIconsReadyPollDuration = 8000

configureAccessTokenResolver(getAccessToken)

let materialIconsFallbackTimer: number | undefined
let materialIconsReadyPollTimer: number | undefined
let materialIconsStopPollingTimer: number | undefined

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
