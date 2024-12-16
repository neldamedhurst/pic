const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const randomUseragent = require('random-useragent');

puppeteer.use(StealthPlugin());

const urls = [
    'https://piclinks.in/directlink?id=468332'
];

const referers = [
    'https://www.google.com/',
    'https://www.facebook.com/',
    'https://www.twitter.com/',
    'https://www.linkedin.com/',
    'https://www.instagram.com/',
    'https://www.reddit.com/',
    'https://www.pinterest.com/',
    'https://www.tumblr.com/',
    'https://www.quora.com/',
    'https://www.medium.com/',
    'https://www.snapchat.com/',
    'https://www.whatsapp.com/',
    'https://www.weibo.com/',
    'https://www.qq.com/',
    'https://www.taobao.com/',
    'https://www.tiktok.com/',
    'https://www.telegram.org/',
    'https://www.vk.com/',
    'https://www.odnoklassniki.ru/',
    'https://www.wechat.com/',
    'https://www.line.me/',
    'https://www.skype.com/',
    'https://www.slack.com/',
    'https://www.github.com/',
    'https://www.stackoverflow.com/',
    'https://www.bitbucket.org/',
    'https://www.dribbble.com/',
    'https://www.behance.net/',
    'https://www.flickr.com/',
    'https://www.deviantart.com/',
    'https://www.vimeo.com/',
    'https://www.dailymotion.com/',
    'https://www.twitch.tv/',
    'https://www.mixer.com/',
    'https://www.soundcloud.com/',
    'https://www.spotify.com/',
    'https://www.apple.com/',
    'https://www.amazon.com/',
    'https://www.ebay.com/',
    'https://www.alibaba.com/',
    'https://www.aliexpress.com/',
    'https://www.walmart.com/',
    'https://www.target.com/',
    'https://www.bestbuy.com/',
    'https://www.homedepot.com/',
    'https://www.lowes.com/',
    'https://www.costco.com/',
    'https://www.samsclub.com/',
    'https://www.newegg.com/',
    'https://www.wayfair.com/'
];

const proxyUrl = 'gw.dataimpulse.com:823';
const proxyUsername = 'ca792ee1df540ef1876f';
const proxyPassword = 'afb6d6e246728fb2';

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function simulateHumanInteraction(page) {
    console.log('Scrolling the page fast');
    let scrollHeight = await page.evaluate(() => document.body.scrollHeight);

    while (scrollHeight > 0) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await page.waitForTimeout(getRandomInt(500, 1000)); // Faster scrolling
        scrollHeight -= window.innerHeight;
    }

    await page.waitForTimeout(getRandomInt(2000, 5000));
}

async function handleIframe(page) {
    console.log('Waiting for iframe to load');
    const iframeElement = await page.$('iframe'); // Select iframe
    if (iframeElement) {
        const iframe = await iframeElement.contentFrame();
        if (iframe) {
            console.log('Interacting with iframe');
            await iframe.waitForTimeout(60000); // Wait for 60 seconds inside iframe
        } else {
            console.log('Iframe content could not be loaded');
        }
    } else {
        console.log('No iframe found on the page');
    }
}

async function visitAndInteract(browser, url) {
    const page = await browser.newPage();
    const userAgent = randomUseragent.getRandom();
    const referer = referers[Math.floor(Math.random() * referers.length)];
    const viewport = {
        width: getRandomInt(1200, 1920),
        height: getRandomInt(800, 1080),
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: true
    };

    await page.setUserAgent(userAgent);
    await page.setExtraHTTPHeaders({ referer });
    await page.setViewport(viewport);

    console.log(`Using referer: ${referer}`);
    console.log(`Browser fingerprint: User Agent: ${userAgent}, Viewport: ${JSON.stringify(viewport)}`);

    try {
        await page.authenticate({ username: proxyUsername, password: proxyPassword });
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log(`Visiting URL: ${url}`);
        await page.waitForTimeout(getRandomInt(3000, 5000));

        await simulateHumanInteraction(page);
        await handleIframe(page);

        console.log('Interaction complete');
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        console.log('Closing page');
        await page.close();
    }
}

(async () => {
    while (true) {
        for (const url of urls) {
            try {
                console.log(`Launching browser with proxy: ${proxyUrl}`);
                const browser = await puppeteer.launch({
                    headless: true,
                    args: [
                        `--proxy-server=${proxyUrl}`,
                        '--disable-setuid-sandbox',
                        '--no-sandbox',
                        '--disable-web-security',
                        '--disable-features=IsolateOrigins,site-per-process',
                    ],
                    ignoreHTTPSErrors: true,
                });

                await visitAndInteract(browser, url);
                await browser.close();
            } catch (err) {
                console.error('Error during interaction:', err);
            }

            await new Promise(resolve => setTimeout(resolve, getRandomInt(5000, 10000)));
        }
    }
})();
