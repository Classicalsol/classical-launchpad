import { classicalDocs, classicalSources } from '@/lib/classical-docs'

export function GET() {
  const sections = classicalDocs.map(section => `## ${section.title}\n\n${section.paragraphs.join('\n\n')}${section.bullets.length ? '\n\n' + section.bullets.map(bullet => `- ${bullet}`).join('\n') : ''}`).join('\n\n')
  const sources = classicalSources.map(source => `- [${source.title}](${source.url})`).join('\n')
  return new Response(`# Classical — The Field Guide\n\nBits over buzzwords. A counterpoint to quantum-themed promises, not a rejection of quantum science.\n\n${sections}\n\n## References\n\n${sources}\n`, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Content-Disposition': 'attachment; filename="classical-field-guide.md"', 'X-Content-Type-Options': 'nosniff' },
  })
}
