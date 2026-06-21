const PUSHED_KEY = 'makeNuse_pushed_page'
const SLOTS_KEY = 'makeNuse_page_slots'
const SAVED_KEY = 'makeNuse_saved_pages'

export function getPushedPage() {
  try {
    const raw = localStorage.getItem(PUSHED_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setPushedPage(page) {
  localStorage.setItem(PUSHED_KEY, JSON.stringify(page))
}

export function getPageSlots() {
  try {
    const raw = localStorage.getItem(SLOTS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function setPageSlot(name, page) {
  const slots = getPageSlots()
  slots[name] = { ...page, updatedAt: new Date().toISOString() }
  localStorage.setItem(SLOTS_KEY, JSON.stringify(slots))
}

export function deletePageSlot(name) {
  const slots = getPageSlots()
  delete slots[name]
  localStorage.setItem(SLOTS_KEY, JSON.stringify(slots))
}

export function getAllSlotNames() {
  const slots = getPageSlots()
  return Object.keys(slots).sort()
}

export function getSavedPages() {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function savePage(page) {
  const pages = getSavedPages()
  pages.push({ ...page, id: Date.now(), createdAt: new Date().toISOString() })
  localStorage.setItem(SAVED_KEY, JSON.stringify(pages))
}

export function updateSavedPage(id, page) {
  const pages = getSavedPages().map((p) => (p.id === id ? { ...p, ...page } : p))
  localStorage.setItem(SAVED_KEY, JSON.stringify(pages))
}

export function deletePage(id) {
  const pages = getSavedPages().filter((p) => p.id !== id)
  localStorage.setItem(SAVED_KEY, JSON.stringify(pages))
}
