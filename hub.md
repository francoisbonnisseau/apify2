# Apify Web Scraping Integration

This integration allows you to perform web scraping tasks using Apify directly within your chatbot conversations. You can choose to scrape websites, Instagram profiles, or YouTube videos and shorts.
Explanation Video : 

## Configuration

- `apiKey`: Your Apify API key.

## Actions

### Scrape Website

This action scrapes a website or a page using Apify.

#### Input

- `conversationId`: ID of the conversation: `{{event.conversationId}}`.
- `startUrls`: Array of URLs to start crawling from. One or more URLs of pages where the crawler will start. By default, the Actor will also crawl sub-pages of these URLs. For example, for start URL `https://example.com/blog`, it will also crawl `https://example.com/blog/post` or `https://example.com/blog/article`. The Include URLs (globs) option overrides this automation behavior.
- `useSitemaps`: (Optional) Whether to use sitemaps for crawling. Defaults to `false`.
- `crawlerType`: (Optional) Type of crawler to use. Defaults to `playwright:adaptive`.

#### Output

- `runId`: ID of the scraping run.

### Scrape Instagram

This action scrapes an Instagram profile or posts.

#### Input

- `conversationId`: ID of the conversation: `{{event.conversationId}}`.
- `instagramUrl`: Instagram URL to scrape.
- `scrapeType`: Choose either to scrape profile details or posts. Defaults to `posts`.
- `maxItems`: (Optional) Maximum number of items to scrape. Defaults to `1`.

#### Output

- `runId`: ID of the scraping run.

### Scrape YouTube

This action scrapes YouTube videos and shorts.

#### Input

- `conversationId`: ID of the conversation: `{{event.conversationId}}`.
- `searchTerm`: (Optional) Enter a search term just like you would enter it in YouTube's search bar.
- `youtubeUrl`: (Optional) Enter a link to a YouTube video, channel, playlist, or search results page. Note that input from Search term will be ignored when using this option.
- `maxSearchResult`: (Optional) Limit the number of videos you want to crawl. If you scrape a channel, acts as a limit for regular videos. Defaults to `5`.
- `maxShorts`: (Optional) Limit the number of Shorts videos you want to crawl. Defaults to `0`.

#### Output

- `runId`: ID of the scraping run.

## Events

### Apify Scraping Completed

This event is triggered when an Apify scraping task is completed.

#### Schema

- `conversationId`: ID of the conversation.
- `type`: Type of scraping task. Can be useful to create filter on events
- `data`:
  - `defaultDatasetId`: ID of the dataset with scraping results.
  - `results`: Scraping results. The structure depends on the choosen scraping. See the presentation video to know more about it

- Some exemples :
  - Website text : `{{event.payload.data.results.items[0].text}}`
  - Instagram profile : `{{event.payload.data.results.items[0].biography}}`
  - Youtube : `{{event.payload.data.results.items[0].title}}`