import { IntegrationDefinition , z} from '@botpress/sdk'
import { integrationName, name } from './package.json'

const conversationIdDescription = 'ID of the conversation : {{event.conversationId}}'
const startUrlsDescription = 'Array of URLs to start crawling from. One or more URLs of pages where the crawler will start. By default, the Actor will also crawl sub-pages of these URLs. For example, for start URL https://example.com/blog, it will crawl also https://example.com/blog/post or https://example.com/blog/article. The Include URLs (globs) option overrides this automation behavior.'
const useSitemapsDescription = 'Whether to use sitemaps for crawling. Defaults to false.'
const crawlerTypeDescription = 'Type of crawler to use. Defaults to "playwright:adaptive".'

const instagramUrlDescription = "Instagram Url to scrape"
const maxItemsDescription = "Maximum number of items to scrape"
const instagramScrapeType = "Choose either to scraper profile details or posts. Details by default"

const maxSearchResultDescription = "Limit the number of videos you want to crawl. If you scrape a channel, acts as a limit for regular videos."
const maxShortsDescription = "Limit the number of Shorts videos you want to crawl."
const searchTermDescription = "Enter a search term just like you would enter it in YouTube's search bar."
const youtubeUrlDescription = "Enter a link to a YouTube video, channel, playlist or search results page. Note that input from Search term will be ignored when using this option."

export default new IntegrationDefinition({
  name: integrationName ?? name,
  version: '2.0.2',
  icon: 'icon.svg',
  title: 'Apify Web Scraping',
  description: 'Integrate Apify to perform web scraping directly within your chatbot conversations',
  readme: 'hub.md',
  configuration: {
    schema: z.object({
      apiKey: z.string().describe('Apify API Key'),
    }),
  },
  channels: {},
  actions: {
    scrapeWebsite: {
      title: 'Scrape Website',
      description: 'Scrape a website or a page using Apify',
      input: {
        schema: z.object({
          conversationId: z.string().describe(conversationIdDescription), 
          startUrls: z.string().describe(startUrlsDescription),
          useSitemaps: z.boolean().optional().describe(useSitemapsDescription),
          crawlerType: z.string().optional().describe(crawlerTypeDescription),
        }),
      },
      output: {
        schema: z.object({
          runId: z.string(),
        }),
      },
    },
    scrapeInstagram: {
      title: 'Scrape Instagram',
      description: 'Scrape an instagram profile, or posts',
      input: {
        schema: z.object({
          conversationId: z.string().describe(conversationIdDescription), 
          instagramUrl: z.string().describe(instagramUrlDescription),
          scrapeType: z.string().default('posts').describe(instagramScrapeType),
          maxItems: z.number().default(1).optional().describe(maxItemsDescription),
        }),
      },
      output: {
        schema: z.object({
          runId: z.string(),
        }),
      },
    },
    scrapeYoutube: {
      title: 'Scrape Youtube',
      description: 'Scrape Youtube videos and shorts',
      input: {
        schema: z.object({
          conversationId: z.string().describe(conversationIdDescription), 
          searchTerm: z.string().optional().describe(searchTermDescription),
          youtubeUrl: z.string().optional().describe(youtubeUrlDescription),
          maxSearchResult: z.number().default(5).optional().describe(maxSearchResultDescription),
          maxShorts: z.number().default(0).optional().describe(maxShortsDescription)
        }),
      },
      output: {
        schema: z.object({
          runId: z.string(),
        }),
      },
    }
  },
  events: {
    scrapingCompleted: {
      title: 'Apify Scraping Completed',
      description: 'This event is triggered when an Apify scraping task is completed.',
      schema: z.object({
        conversationId: z.string().describe('ID of the conversation'),
        type: z.string().describe('Type of scraping task'),
        data: z.object({
          defaultDatasetId: z.string(),
          results: z.record(z.unknown()),
        }),
      }).passthrough(),
    },
  },
})