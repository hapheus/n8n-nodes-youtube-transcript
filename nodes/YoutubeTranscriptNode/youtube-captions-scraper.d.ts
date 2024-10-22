declare module 'youtube-captions-scraper' {
	export function getSubtitles(options: { videoID: string; lang: string }): any[];
}
