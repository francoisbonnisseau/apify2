import * as sdk from '@botpress/sdk'
import * as bp from '.botpress'


import { getSimpleApiConfig, createWebhook, deleteWebhook, buildDataApiWebsite, buildDataApiInstagram, buildDataApiYoutubeTerm } from './client';

type ScrapeWebsiteOutput = bp.actions.scrapeWebsite.output.Output
type ScrapeInstagramOutput = bp.actions.scrapeInstagram.output.Output
type ScrapeYoutubeOutput = bp.actions.scrapeYoutube.output.Output

export default new bp.Integration({
  register: async (args) => {
    const apiKey = args.ctx.configuration.apiKey;
    try {
      // Initialize the Apify client
      const client = getSimpleApiConfig(args.ctx.configuration.apiKey);

      // Fetch the user profile
      const userProfile = await client.user().get();
      
      if (!userProfile) {
        throw new sdk.RuntimeError('Invalid API token');
      }
      
      args.logger.forBot().info('API token verified successfully');
    } catch (error:any) {
      args.logger.forBot().error('Error verifying API token', error.message);
      throw new sdk.RuntimeError('Error verifying API token', error);
    }
  },
  unregister: async () => {},
  actions: {
    scrapeWebsite : async (args) => {
      args.logger.forBot().info('Starting web scraping');

      const client = getSimpleApiConfig(args.ctx.configuration.apiKey);

      const startUrls = args.input.startUrls;
      const useSitemaps = args.input.useSitemaps || false;
      const crawlerType = args.input.crawlerType || 'playwright:adaptive';
      
      const input = buildDataApiWebsite(startUrls, useSitemaps, crawlerType);

      //create webhook
      await createWebhook(args, "aYG0l9s7dbB7j3gbS","website");

      try {
        // Run the Apify actor
        const run = await client.actor('apify/website-content-crawler').start(input);
        return { runId: run.defaultDatasetId };
      } catch (error: any) {
        args.logger.forBot().error('Error during scraping', error.message);
        throw new sdk.RuntimeError('Unexpected error during API call', error);
      }
    },
    scrapeInstagram : async (args): Promise<ScrapeInstagramOutput> => {
      args.logger.forBot().info('Starting instagram scraping');

      const client = getSimpleApiConfig(args.ctx.configuration.apiKey);

      const instagramUrl = args.input.instagramUrl;
      const scrapeType = args.input.scrapeType === undefined ? 'posts' : args.input.scrapeType;
      const maxItems = args.input.maxItems === undefined || args.input.maxItems < 1 ? 1 : args.input.maxItems;
      const input = buildDataApiInstagram(instagramUrl, scrapeType, maxItems);

      //create webhook
      await createWebhook(args, "shu8hvrXbJbY3Eb9W", "instagram");

      try {
        // Run the Apify actor
        const run = await client.actor('apify/instagram-scraper').start(input);
        return { runId: run.defaultDatasetId };
        // return {runId: 'test'};
      } catch (error: any) {
        args.logger.forBot().error('Error during instagram scraping', error.message);
        throw new sdk.RuntimeError('Unexpected error during API call', error);
      }
    },
    scrapeYoutube : async (args): Promise<ScrapeYoutubeOutput> => {
      args.logger.forBot().info('Starting youtube scraping - search term');

      const client = getSimpleApiConfig(args.ctx.configuration.apiKey);

      const searchTerm = args.input.searchTerm === undefined ? '' : args.input.searchTerm;
      const youtubeUrl = args.input.youtubeUrl === undefined ? '' : args.input.youtubeUrl;
      if(searchTerm === '' && youtubeUrl === ''){
        args.logger.forBot().error('Error during youtube-search scraping', "You must provide a search term or a youtube URL");
        return { runId: 'error' };
      }
      const maxSearchResult = args.input.maxSearchResult === undefined || args.input.maxSearchResult < 0 ? 5 : args.input.maxSearchResult;
      const maxShorts = args.input.maxShorts === undefined || args.input.maxShorts < 0 ? 0 : args.input.maxShorts;
      const input = buildDataApiYoutubeTerm(youtubeUrl, searchTerm, maxSearchResult, maxShorts);

      //create webhook
      await createWebhook(args, "h7sDV53CddomktSi5", "youtube-search");

      try {
        // Run the Apify actor
        const run = await client.actor('streamers/youtube-scraper').start(input);
        return { runId: run.defaultDatasetId };
      } catch (error: any) {
        args.logger.forBot().error('Error during youtube-search scraping', error.message);
        throw new sdk.RuntimeError('Unexpected error during API call', error);
      }
    },
  },
  channels: {},
  handler: async ({ ctx, logger, client, req })  => {
    const bodyObject = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    logger.forBot().info('Received webhook event from Apify:', bodyObject);

    const clientApify = getSimpleApiConfig(ctx.configuration.apiKey);

    //apify doc : https://docs.apify.com/platform/integrations/webhooks/events
    try {
      // Fetch actor run details
      const runDataset = clientApify.dataset(bodyObject.resource.defaultDatasetId);
      const results = await runDataset.listItems();


      const eventData = {
        defaultDatasetId: bodyObject.resource.defaultDatasetId,
        results: results
      }
      
      try{
        // Create an event in Botpress with the scraping results
        const event = {
          type: 'scrapingCompleted',
          payload: {
            conversationId: bodyObject.conversationId,
            type: bodyObject.scrapingType,
            data: eventData
          }
        };

        await client.createEvent(event as any);

        logger.forBot().debug('Apify scraping completed event created successfully.', event)

        //delete Webhook
        const webhookId = bodyObject.webhookId
        try{
          await deleteWebhook(ctx.configuration.apiKey, webhookId)
          logger.forBot().info('Webhook deleted successfully.')
        }
        catch (error) {
          logger.forBot().error('Failed to delete webhook:', error)
        }
      }
      catch (error) {
        logger.forBot().error('Failed to create event:', error)
      }
      
    } catch (error) {
      logger.forBot().error('Failed to fetch results:', error)
    }
  }
});
