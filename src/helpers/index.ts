import { z } from 'zod';
import axios from 'axios';
// import imagejs from 'image-js';
import { Buffer } from 'node:buffer';
import { zValidator } from '@hono/zod-validator';

type Song = {
	name: string;
	artist: string;
	url: string;
	image: string;
};

// from: https://github.com/tthn0/Spotify-Readme
const spectrum: string[] = [
	'#ff0000',
	'#ff4000',
	'#ff8000',
	'#ffbf00',
	'#ffff00',
	'#bfff00',
	'#80ff00',
	'#40ff00',
	'#00ff00',
	'#00ff40',
	'#00ff80',
	'#00ffbf',
	'#00ffff',
	'#00bfff',
	'#0080ff',
	'#0040ff',
	'#0000ff',
	'#4000ff',
	'#8000ff',
	'#bf00ff',
	'#ff00ff',
];

// from: https://github.com/tthn0/Spotify-Readme
export function generateBars(isRainbow: boolean, color: string, count: number = 12): string {
	let bars = '';
	let css = '';
	if (isRainbow) css += '.bar-container { animation-duration: 2s; }';
	for (let i = 0; i < count; i++) {
		bars += "<div class='bar'></div>";
		css += `.bar:nth-child(${i + 1}) { animation-duration: ${Math.floor(Math.random() * 251) + 500}ms; background: ${
			isRainbow ? spectrum[i] : `#${color}`
		}; }`;
	}
	return `${bars}<style>${css}</style>`;
}

// from: https://github.com/tthn0/Spotify-Readme
export async function imageToBase64(imageUrl: string): Promise<string> {
	const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
	return Buffer.from(response.data).toString('base64');
}

// todo: add default color when image is not found (star type image)
// export async function getDominantColor(base64Image: string): Promise<string> {
// 	const image = await imagejs.load(Buffer.from(base64Image, 'base64'));
// 	const [r, g, b] = image.getHistograms();
// 	return ((1 << 24) + (r.indexOf(Math.max(...r)) << 16) + (g.indexOf(Math.max(...g)) << 8) + b.indexOf(Math.max(...b)))
// 		.toString(16)
// 		.slice(1);
// }

export async function getSongData(username: string, apiKey: string): Promise<Song> {
	const { data } = await axios.get(
		`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&limit=1&format=json&})`
	);

	const track = data.recenttracks.track[0];

	return {
		name: track.name,
		artist: track.artist['#text'],
		url: track.url,
		image: await imageToBase64(track.image[3]['#text']),
	} as Song;
}

// validation schemas
const booleanSchema = z
	.string()
	.optional()
	.transform((val) => val != undefined);

const colorSchema = z.string().min(3).max(8).optional().default('d51007'); // lastfm logo color

export const paramValidator = zValidator('param', z.object({ username: z.string() }));
export const queryValidator = zValidator(
	'query',
	z.object({ dark: booleanSchema, spin: booleanSchema, rainbow: booleanSchema, color: colorSchema })
);
