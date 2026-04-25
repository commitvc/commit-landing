import { SITE_URL } from '@/lib/structured-data';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

/**
 * Explicit allow blocks for major AI crawlers, then a catch-all `*` block.
 *
 * Why we name AI bots specifically rather than relying on `*: Allow /`:
 * 1. It's a positive, intentional signal that the fund welcomes AI
 *    crawling — useful when GEO scoring tools and AI vendors check.
 * 2. It insulates AI crawlers from a future change to the catch-all (e.g.
 *    if we ever block a class of scrapers via `*`, the bots we care about
 *    keep their explicit allow).
 *
 * The bot list covers the crawlers AI assistants actually use today:
 *   GPTBot, ChatGPT-User             — OpenAI training + ChatGPT browsing
 *   ClaudeBot, anthropic-ai, Claude-Web — Anthropic crawl + browsing
 *   PerplexityBot                    — Perplexity index + answer engine
 *   Google-Extended                  — Gemini/Bard training opt-in
 *   Applebot-Extended                — Apple Intelligence training
 *   CCBot                            — Common Crawl, training corpus for many
 *   Bytespider                       — TikTok / ByteDance LLMs
 *   Amazonbot                        — Alexa / Amazon LLMs
 *   DuckAssistBot                    — DuckDuckGo's AI assistant
 *   FacebookBot, meta-externalagent  — Meta AI
 *   Diffbot                          — knowledge-graph extraction many AIs use
 */
const AI_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'anthropic-ai',
  'Claude-Web',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'Bytespider',
  'Amazonbot',
  'DuckAssistBot',
  'FacebookBot',
  'meta-externalagent',
  'Diffbot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: '/' })),
      { userAgent: '*', allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
