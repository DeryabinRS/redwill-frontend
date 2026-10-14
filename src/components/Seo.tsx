import { useEffect } from 'react'
import { SITE_NAME, SITE_URL } from '@config/constants'

type SeoProps = {
  title?: string
  description?: string
  path?: string
  image?: string
  type?: string
  jsonLd?: object | object[]
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)

  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }

  el.setAttribute('content', content)
}

function removeMeta(attr: 'name' | 'property', key: string): void {
  const el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (el) el.remove()
}

function upsertCanonical(href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')

  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }

  el.setAttribute('href', href)
}

function upsertJsonLd(data: object | object[]): void {
  const list = Array.isArray(data) ? data : [data]
  const id = 'page-jsonld'
  let el = document.getElementById(id) as HTMLScriptElement | null

  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    document.head.appendChild(el)
  }

  el.textContent = JSON.stringify(list.length === 1 ? list[0] : list)
}

function removeJsonLd(): void {
  const el = document.getElementById('page-jsonld')
  if (el) el.remove()
}

function Seo({ title, description, path, image, type = 'website', jsonLd }: SeoProps) {
  useEffect(() => {
    const base = SITE_URL || ''
    const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME

    document.title = fullTitle
    upsertMeta('property', 'og:title', fullTitle)

    if (description) {
      upsertMeta('name', 'description', description)
      upsertMeta('property', 'og:description', description)
    } else {
      removeMeta('name', 'description')
      removeMeta('property', 'og:description')
    }

    const url = path ? `${base}${path}` : base
    upsertCanonical(url)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:type', type)

    if (image) {
      upsertMeta('property', 'og:image', image)
    } else {
      removeMeta('property', 'og:image')
    }

    if (jsonLd) {
      upsertJsonLd(jsonLd)
    } else {
      removeJsonLd()
    }
  }, [title, description, path, image, type, jsonLd])

  return null
}

export default Seo
