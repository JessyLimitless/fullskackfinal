const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;

// 🔥 Serve static files from the "public" directory (like index.html)
app.use(express.static('public'));

/**
 * Route to crawl and extract quotes from 'http://quotes.toscrape.com/' (only the first page)
 * URL: http://localhost:3000/crawl
 */
app.get('/crawl', async (req, res) => {
  try {
    const url = 'http://quotes.toscrape.com/';
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const quotes = [];

    $('div.quote').each((index, element) => {
      const text = $(element).find('span.text').text();
      const author = $(element).find('small.author').text();
      const tags = $(element).find('div.tags a.tag').map((i, tag) => $(tag).text()).get();

      quotes.push({
        text,
        author,
        tags
      });
    });

    res.json({ success: true, quotes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred', error: error.message });
  }
});

/**
 * Route to crawl and extract quotes from all pages of 'http://quotes.toscrape.com/'
 * URL: http://localhost:3000/crawl-all
 */
app.get('/crawl-all', async (req, res) => {
  try {
    let page = 1;
    let url = `http://quotes.toscrape.com/page/${page}/`;
    const allQuotes = [];

    while (true) {
      console.log(`Crawling: ${url}`);
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const quotes = $('div.quote').map((index, element) => {
        const text = $(element).find('span.text').text();
        const author = $(element).find('small.author').text();
        const tags = $(element).find('div.tags a.tag').map((i, tag) => $(tag).text()).get();

        return {
          text,
          author,
          tags
        };
      }).get();

      if (quotes.length === 0) break; // No more quotes on the next page
      allQuotes.push(...quotes);

      page++;
      url = `http://quotes.toscrape.com/page/${page}/`;
    }

    res.json({ success: true, total: allQuotes.length, quotes: allQuotes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred', error: error.message });
  }
});

/**
 * Start the server
 */
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
