import { Dataset, createPlaywrightRouter, sleep } from "crawlee";
import * as linkify from "linkifyjs";

import * as dotenv from "dotenv";
dotenv.config();
import fs from "fs";

export const router = createPlaywrightRouter();

router.addDefaultHandler(async ({ enqueueLinks, log }) => {
  log.info(`enqueueing new URLs`);
  // await enqueueLinks({
  //     globs: ['https://crawlee.dev/**'],
  //     label: 'detail',
  // });
});

router.addHandler("comments", async ({ request, page, log, pushData, infiniteScroll }) => {
  const title = await page.title();
  await infiniteScroll({
    buttonSelector: "button.comments-comments-list__load-more-comments-button",
    // maxScrollHeight: 2000,
  });
  const comments = page.locator("article.comments-comments-list__comment-item");
  console.log(await comments.count());
  for (let i = 0; i < (await comments.count()); i++) {
    let commentText = null;
    commentText = await comments.nth(i).locator("div.comments-comment-item-content-body").innerText();
    const profileURL = await comments.nth(i).locator("a.comments-post-meta__actor-link").first().getAttribute("href");
    // console.log(commentText);
    const text = linkify.find(commentText);
    console.log(text);
    if (text[0] != undefined) {
      await pushData({
        profileURL: profileURL,
        comment: text[0].href,
        raw: text
      });
    }
    if (text[1] != undefined) {
      await pushData({
        profileURL: profileURL,
        comment: text[1].href,
        raw: text
      });
    }
  }
  await Dataset.exportToCSV("output", { toKVS: "myvalue" });
});

router.addHandler("login", async ({ browserController, page, log }) => {
  log.info(`Logging in...`);
  //  const email = process.env.LINKEDIN_EMAIL;
  //  const password = process.env.LINKEDIN_PASSWORD;
  log.info("Logging in");
  await sleep(2_000);

  //  await page.fill("#username", email);
  //  await page.fill("#password", password);
  //  await page.click(".btn__primary--large");

  await sleep(80_000);
  const cookies = await browserController.getCookies(page);
  fs.writeFileSync("./auth", JSON.stringify(cookies), "utf-8");
  page.screenshot({ path: "login.png" });
  log.info(`Logged in`);
  await sleep(1_000);
});
