#!/usr/bin/env node
import puppeteer from 'puppeteer';
import express from "express";
import { parseArgs } from "util";

const options = {
    subEarthLatitude: {
        type: "string"
    },
    subEarthLongitude: {
        type: "string"
    },
    subSunLatitude: {
        type: "string"
    },
    subSunLongitude: {
        type: "string"
    },
    imageWidth: {
        type: "string",
        default: "1264"
    },
    imageHeight: {
        type: "string",
        default: "1264"
    },
    imagePath: {
        type: "string",
        default: ""
    },
    port: {
        type: "string",
        default: "0"
    }
}
const {
  values,
  positionals,
} = parseArgs({options});

var ok = true;
for (const key of Object.keys(options)) {
    if (values[key] === undefined) {
        console.error(`option --${key} is required`);
        ok = false;
    }
}
if (!ok) {
    process.exit(127);
}

const subEarthLatitude = parseFloat(values.subEarthLatitude);
const subEarthLongitude = parseFloat(values.subEarthLongitude);
const subSunLatitude = parseFloat(values.subSunLatitude);
const subSunLongitude = parseFloat(values.subSunLongitude);
const imageWidth = parseFloat(values.imageWidth);
const imageHeight = parseFloat(values.imageHeight);
const imagePath = values.imagePath;
const port = parseInt(values.port);
console.log({subEarthLatitude, subEarthLongitude, subSunLatitude, subSunLongitude, imageWidth, imageHeight, imagePath});

const __dirname = import.meta.dirname;

const app = express();
app.use(express.static(__dirname + '/../assets'));
console.log("opening server " + __dirname);
const server = app.listen(port);
console.log("listening on " + server.address().port);

// Launch the browser and open a new blank page.
console.log("puppeteer");
const browser = await puppeteer.launch({
    dumpio: true,
    executablePath: process.env.CHROME,
});
const page = await browser.newPage();

if (imagePath) {
    await page.setViewport({width: imageWidth, height: imageHeight});
    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {
      console.log(interceptedRequest.url())
      interceptedRequest.continue();
    });

    const url = `http://localhost:${server.address().port}/rewrite/index.html`;
    console.log(url);
    await page.goto(url)
    // TODO: something smarter than a time wait for rendering to be complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('evaluating');
    await page.evaluate(function(subEarthLatitude, subEarthLongitude, subSunLatitude, subSunLongitude) {
        // This function is executed in the browser.

        //globeViewer.setSubEarth(subEarthLatitude, subEarthLongitude);
        //globeViewer.setSubSun(subSunLatitude, subSunLongitude);
        moon.setSubEarth(subEarthLatitude, subEarthLongitude);
        moon.setSubSun(subSunLatitude, subSunLongitude);
        moon.render();
    }, subEarthLatitude, subEarthLongitude, subSunLatitude, subSunLongitude);

    console.log('screenshot');
    await page.screenshot({
        captureBeyondViewport: true,
        path: imagePath,
        omitBackground: true
    })
    console.log("got screenshot");
}
await browser.close();
console.log("closed browser");
if (values.port != 0) {
    console.log("waiting for ctrl-c...");
    process.on('SIGINT',async () => {
      await server.close();
      console.log("closed server, bye");
      process.exit();
    });
} else {
  await server.close();
  console.log("closed server, bye");
}
