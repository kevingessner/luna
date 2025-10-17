import puppeteer from 'puppeteer';
// Or import puppeteer from 'puppeteer-core';

// Launch the browser and open a new blank page.
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({width: 1080, height: 1024});
await page.setRequestInterception(true);
page.on('request', interceptedRequest => {
  console.log(interceptedRequest.url())
  interceptedRequest.continue();
});
//await page.goto("https://moon.nasa.gov/module/17/")
await page.goto("file:///home/kevin/src/luna/README.md")
await new Promise(resolve => setTimeout(resolve, 1000));
await page.screenshot({path: "test.png"})
await browser.close();
