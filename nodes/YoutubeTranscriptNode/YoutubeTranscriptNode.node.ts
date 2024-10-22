import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { getSubtitles } from 'youtube-captions-scraper';

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
			{
				displayName: 'Language',
				name: 'language',
				type: 'string',
				default: 'en',
				description: 'Enter the language code (for example, "en" for English)',
				placeholder: 'language code ',
			},
			{
				displayName: 'Fallback Language',
				name: 'fallbackLanguage',
				type: 'string',
				default: 'en',
				description:
					'Enter the fallback language code (for example, "en" for English) to be used if the video does not support the selected language',
				placeholder: 'fallback language code',
			},
			{
				displayName: 'Return Merged Text',
				name: 'returnMergedText',
				type: 'boolean',
				default: false,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		let youtubeId: string;
		let returnMergedText: boolean;
		let language: string;
		let fallbackLanguage: string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				youtubeId = this.getNodeParameter('youtubeId', itemIndex, '') as string;
				returnMergedText = this.getNodeParameter('returnMergedText', itemIndex, false) as boolean;
				language = this.getNodeParameter('language', itemIndex, 'en') as string;
				fallbackLanguage = this.getNodeParameter('fallbackLanguage', itemIndex, 'en') as string;

				let transcript;
				try {
					transcript = await getSubtitles({
						videoID: youtubeId,
						lang: language,
					});
				} catch (e) {
					transcript = await getSubtitles({
						videoID: youtubeId,
						lang: fallbackLanguage,
					});
				}

				if (returnMergedText) {
					let text = '';
					for (const line of transcript) {
						text += line.text + ' ';
					}
					returnData.push({
						json: {
							youtubeId: youtubeId,
							text: text,
						},
						pairedItem: { item: itemIndex },
					});
				} else {
					const outputItems = transcript.map((chunk: any) => ({
						json: {
							youtubeId: youtubeId,
							text: chunk.text,
							offset: chunk.start,
							duration: chunk.dur,
						},
						pairedItem: { item: itemIndex },
					}));
					for (const item of outputItems) {
						returnData.push(item);
					}
				}
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
