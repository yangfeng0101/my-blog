import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', {
  transform(raw) {
    return raw
      .map(({ url, frontmatter }) => ({
        title: frontmatter.title || '无标题',
        date: formatDate(frontmatter.date),
        summary: frontmatter.summary || '',
        tags: frontmatter.tags || [],
        url,
      }))
      .sort((a, b) => b.date.raw - a.date.raw)
  },
})

function formatDate(date) {
  if (!date) return { raw: 0, text: '' }
  const d = new Date(date)
  return {
    raw: d.getTime(),
    text: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
  }
}
