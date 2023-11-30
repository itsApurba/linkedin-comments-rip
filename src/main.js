// For more information, see https://crawlee.dev/
import { PlaywrightCrawler, ProxyConfiguration } from "crawlee";
import { router } from "./routes.js";
import * as dotenv from "dotenv";
dotenv.config();
import fs from "fs";

let isAuth = fs.existsSync("./auth");

let session = [];

if (isAuth) {
  session = JSON.parse(fs.readFileSync("./auth"));
}

const crawler = new PlaywrightCrawler({
//   headless: false,
  requestHandlerTimeoutSecs: 60000,
  requestHandler: router,
  preNavigationHooks: [
    async ({ page, browserController }) => {
      await browserController.setCookies(page, session);
      page.setViewportSize({ width: 1024, height: 500 });
    },
  ],
  maxRequestRetries: 0,

  failedRequestHandler: async ({ log, page }, error) => {
    // await page.locator("div.jobs-details__main-content").screenshot({ type: "png", path: `failed_.png` });
    log.error(`Error Log starts`);
    console.log(error);
    log.error(`Error Log ends`);
  },
});

if (!isAuth) {
  await crawler.addRequests([{ label: "login", url: "https://www.linkedin.com/login" }]);
} else {
  await crawler.addRequests([
    {
      label: "comments",
      url: `https://www.linkedin.com/posts/activity-7135721474836840448-Ywe7`,
    },
  ]);
}
await crawler.run();
