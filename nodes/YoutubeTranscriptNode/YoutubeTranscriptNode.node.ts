import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import {YoutubeTranscript} from "youtube-transcript";

export class YoutubeTranscriptNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Youtube Transcript',
		name: 'youtubeTranscriptNode',
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
				displayName: 'Youtube Video Id or Url',
				name: 'youtubeId',
				type: 'string',
				default: '',
				placeholder: 'Youtube Video Id or Url'
			},
			{
				displayName: 'Return merged text',
				name: 'returnMergedText',
				type: 'boolean',
				default: 'false',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		let item: INodeExecutionData;
		let youtubeId: string;
		let returnMergedText: boolean;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {

			try {

				youtubeId = this.getNodeParameter('youtubeId', itemIndex, '') as string;
				returnMergedText = this.getNodeParameter('returnMergedText', itemIndex, false) as boolean;

				let transcript = await YoutubeTranscript.fetchTranscript(youtubeId);

				if (returnMergedText) {
					item = items[itemIndex];

					let text = '';
					for (const line of transcript) {
						text += line.text + ' ';
					}
					item.json.text = text;
					returnData.push(item);
				} else {
					const outputItems = transcript.map(chunk => ({
						json: {
							"text": chunk.text,
							"offset": chunk.offset,
							"duration": chunk.duration
						},
						pairedItem: { item: itemIndex },
					}));
					for (const item of outputItems) {
						returnData.push(item);
					}
				}

			} catch (error) {
				if (this.continueOnFail()) {
					items.push({json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex});
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
