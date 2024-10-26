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

		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		let youtubeId: string;

		const getTranscriptFromYoutube = async function (youtubeId: string) {
			const browser: Browser = await puppeteer.launch({
				headless: true,
				ignoreDefaultArgs: ['--enable-automation'],
			});
			const page: Page = await browser.newPage();
			const url = `https://www.youtube.com/watch?v=${youtubeId}`;

			try {
				await page.goto(url, { waitUntil: 'domcontentloaded' });

				await page.evaluate(() => {
					const cookieButton = document.querySelector<HTMLButtonElement>(
						'button[aria-label*=cookies]',
					);
					cookieButton?.click();
				});

				await page.waitForSelector('ytd-video-description-transcript-section-renderer button', {
					timeout: 10_000,
				});
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
				throw new ApplicationError(`Failed to extract transcript: ${error.message}`);
			} finally {
				await page.close();
				await browser.close();
			}
		};

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				youtubeId = this.getNodeParameter('youtubeId', itemIndex, '') as string;

				const urlRegex = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/;

				if (urlRegex.test(youtubeId)) {
					const url = new URL(youtubeId);
					const v = url.searchParams.get('v');
					if (!v) {
						throw new ApplicationError(
							`The provided URL doesn't contain a valid YouTube video identifier. URL: ${youtubeId}`,
						);
					}
					youtubeId = v;
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
