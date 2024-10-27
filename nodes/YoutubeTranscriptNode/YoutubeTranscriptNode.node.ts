import {
	ApplicationError,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';

export class YoutubeTranscriptNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Youtube Transcript',
		name: 'youtubeTranscriptNode',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:youTube.png',
		group: ['transform'],
		version: 1,
		description: 'Get Transcript of a youtube video',
		defaults: {
			name: 'Youtube Transcript',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Youtube Video ID or Url',
				name: 'youtubeId',
				type: 'string',
				default: '',
				placeholder: 'Youtube Video ID or Url',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		puppeteer.use(StealthPlugin());
		const checkBrowserWorks = async function () {
			let browser: Browser | null = null;
			try {
				browser = await puppeteer.launch({
					headless: true,
					ignoreDefaultArgs: ['--enable-automation'],
				});
			} catch (error) {
				throw new ApplicationError(`Failed to launch the browser: ${error.message}`);
			} finally {
				if (browser) await browser.close();
			}
		};

		const getTranscriptFromYoutube = async function (youtubeId: string) {
			let browser: Browser | null = null;
			let page: Page | null = null;
			try {
				browser = await puppeteer.launch({
					headless: true,
					ignoreDefaultArgs: ['--enable-automation'],
				});

				page = await browser.newPage();

				const url = `https://www.youtube.com/watch?v=${youtubeId}`;
				await page.goto(url, { waitUntil: 'domcontentloaded' });

				await page.evaluate(() => {
					const cookieButton = document.querySelector<HTMLButtonElement>(
						'button[aria-label*="cookie"], button[aria-label*="cookies"]',
					);
					cookieButton?.click();
				});

				const transcriptButtonAvailable = await page
					.waitForSelector('ytd-video-description-transcript-section-renderer button', {
						timeout: 10_000,
					})
					.catch(() => null);

				if (!transcriptButtonAvailable) {
					throw new ApplicationError(
						`The video with ID ${youtubeId} either does not exist or does not have a transcript available. Please check the video URL or try again later.`,
					);
				}

				await page.evaluate(() => {
					const transcriptButton = document.querySelector<HTMLButtonElement>(
						'ytd-video-description-transcript-section-renderer button',
					);
					transcriptButton?.click();
				});

				await page.waitForSelector('#segments-container', { timeout: 10_000 });

				const transcript = await page.evaluate(() => {
					return Array.from(document.querySelectorAll('#segments-container yt-formatted-string'))
						.map((element) => element.textContent?.trim() || '')
						.filter((text) => text !== '');
				});

				return transcript;
			} catch (error) {
				if (error instanceof ApplicationError) {
					throw error;
				} else {
					throw new ApplicationError(`Failed to extract transcript: ${error.message}`);
				}
			} finally {
				if (page) await page.close();
				if (browser) await browser.close();
			}
		};

		try {
			await checkBrowserWorks();
		} catch (error) {
			throw new NodeOperationError(this.getNode(), error, {
				message: 'Failed to launch the browser before processing.',
			});
		}

		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		let youtubeId: string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				youtubeId = this.getNodeParameter('youtubeId', itemIndex, '') as string;

				const urlRegex = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/;

				if (urlRegex.test(youtubeId)) {
					const url = new URL(youtubeId);

					if (url.hostname === 'youtu.be') {
						youtubeId = url.pathname.slice(1); // Extract the video ID from the path
					} else {
						const v = url.searchParams.get('v');
						if (!v) {
							throw new ApplicationError(
								`The provided URL doesn't contain a valid YouTube video identifier. URL: ${youtubeId}`,
							);
						}
						youtubeId = v;
					}
				}

				const transcript = await getTranscriptFromYoutube(youtubeId);

				let text = '';
				for (const line of transcript) {
					text += line + ' ';
				}
				returnData.push({
					json: {
						youtubeId: youtubeId,
						text: text,
					},
					pairedItem: { item: itemIndex },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [returnData];
	}
}
