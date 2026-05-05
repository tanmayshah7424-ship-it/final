const axios = require('axios');

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;

/**
 * ApifyService provides a way to run web scrapers and actors 
 * to fetch data that isn't available via standard APIs.
 */
class ApifyService {
    constructor() {
        this.client = axios.create({
            baseURL: 'https://api.apify.com/v2',
            params: {
                token: APIFY_API_TOKEN
            }
        });
    }

    /**
     * Runs a specific actor and waits for results
     * @param {string} actorId e.g., 'm_vignesh/cricbuzz-scraper'
     * @param {object} input Actor input configuration
     */
    async runActor(actorId, input) {
        if (!APIFY_API_TOKEN) {
            console.error('❌ APIFY_API_TOKEN is missing');
            return null;
        }

        try {
            console.log(`🚀 Starting Apify Actor: ${actorId}`);
            const runResponse = await this.client.post(`/acts/${actorId}/runs`, input);
            const runId = runResponse.data.data.id;
            const datasetId = runResponse.data.data.defaultDatasetId;

            // Wait for completion (simple polling for this example)
            let status = 'RUNNING';
            while (status === 'RUNNING' || status === 'READY') {
                await new Promise(resolve => setTimeout(resolve, 2000));
                const statusRes = await this.client.get(`/acts/${actorId}/runs/${runId}`);
                status = statusRes.data.data.status;
                console.log(`⏳ Actor Status: ${status}`);
            }

            if (status === 'SUCCEEDED') {
                const resultsRes = await this.client.get(`/datasets/${datasetId}/items`);
                return resultsRes.data;
            } else {
                throw new Error(`Actor failed with status: ${status}`);
            }
        } catch (error) {
            console.error('❌ Apify Service Error:', error.message);
            return null;
        }
    }

    /**
     * Specialized method to scrape live scores from Cricbuzz 
     * using a community actor if available.
     */
    async scrapeLiveScores() {
        // Example: Using a generic web scraper to get data from Cricbuzz
        // In a real scenario, you'd use a specific actor ID
        const input = {
            "startUrls": [{ "url": "https://www.cricbuzz.com/cricket-match/live-scores" }],
            "maxPagesPerCrawl": 1
        };
        return this.runActor('apify/web-scraper', input);
    }
}

module.exports = new ApifyService();
