const fs = require('fs');
const puppeteer = require('puppeteer');
const { WebClient } = require('@slack/web-api')

// For puppeteer
const TARGET_URL = process.env.TARGET_URL || 'https://github.com';
const FILE_NAME = process.env.FILE_NAME || 'example.png';
const WIDTH = process.env.WIDTH || 1280;
const HEIGHT = process.env.HEIGHT || 768;
const FULL_PAGE = process.env.FULL_PAGE;

// For posting to slack
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const CHANNEL = process.env.CHANNEL || 'general';
// refs: https://api.slack.com/methods/conversations.list
const CONVERSATIONS_TYPES = process.env.CONVERSATIONS_TYPES || 'public_channel'

async function loginWithCookie(page, cookiesStr) {
  const cookies = JSON.parse(cookiesStr);
  for (let cookie of cookies) {
    await page.setCookie(cookie);
  }
}

(async () => {
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      `--window-size=${WIDTH},${HEIGHT}`,
    ]
  });

  const page = await browser.newPage();

  // Basic Auth
  const BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME;
  const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD;
  if (BASIC_AUTH_USERNAME != null && BASIC_AUTH_PASSWORD != null) {
    await page.authenticate({ username: BASIC_AUTH_USERNAME, password: BASIC_AUTH_PASSWORD });
  }
  // Set Cookie
  if (process.env.COOKIES != null) {
    await loginWithCookie(page, process.env.COOKIES);
  }

  await page.goto(TARGET_URL);
  //// disable default viewport
  // see https://github.com/GoogleChrome/puppeteer/issues/1183
  await page._client.send('Emulation.clearDeviceMetricsOverride');

  // Wait delay
  if (process.env.SCREENSHOT_DELAY_SEC != null) {
    await page.waitFor(process.env.SCREENSHOT_DELAY_SEC * 1000);
  }
  await page.screenshot({ path: FILE_NAME, fullPage: (FULL_PAGE === 'true') });

  await browser.close();

  const web = new WebClient(SLACK_BOT_TOKEN)

  // Get channel id
  try {
    const conversationsResponse = await web.conversations.list({
      types: CONVERSATIONS_TYPES
    })
    const channel = conversationsResponse.channels.find((it) => {
      return it.name === CHANNEL
    })

    if (channel == null) {
      throw new Error(`${CHANNEL} channel is not found.`)
    }

    // Upload file
    await web.filesUploadV2({
      channel_id: channel.id,
      file: fs.createReadStream('./' + FILE_NAME),
      filename: FILE_NAME,
    })

    console.log('Uploading a screenshot to slack is Success :)');
  } catch (error) {
    console.log('Uploading a screenshot to slack is Failure :(');
    console.log(error);
  }
})();
