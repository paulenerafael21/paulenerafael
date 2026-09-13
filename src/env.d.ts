/// <reference types="vite/client" />

declare module '*.vue' {
	import type { DefineComponent } from 'vue';

	const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
	export default component;
}

declare module 'ionicons/icons' {
	export const add: string;
	export const cloudUploadOutline: string;
	export const trashOutline: string;
}
