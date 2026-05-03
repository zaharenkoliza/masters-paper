let liveRegion: HTMLElement | null = null

function getOrCreateRegion(): HTMLElement {
  if (liveRegion) return liveRegion

  liveRegion = document.createElement('div')
  liveRegion.setAttribute('role', 'status')
  liveRegion.setAttribute('aria-live', 'polite')
  liveRegion.setAttribute('aria-atomic', 'true')
  Object.assign(liveRegion.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    whiteSpace: 'nowrap',
    border: '0',
  })
  document.body.appendChild(liveRegion)
  return liveRegion
}

export function announce(message: string): void {
  const region = getOrCreateRegion()
  region.textContent = ''
  // Небольшая задержка чтобы скринридер заметил смену содержимого
  requestAnimationFrame(() => {
    region.textContent = message
  })
}

export function announceAssertive(message: string): void {
  const region = getOrCreateRegion()
  region.setAttribute('aria-live', 'assertive')
  region.textContent = ''
  requestAnimationFrame(() => {
    region.textContent = message
    requestAnimationFrame(() => {
      region.setAttribute('aria-live', 'polite')
    })
  })
}
