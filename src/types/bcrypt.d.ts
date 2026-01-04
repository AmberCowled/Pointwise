declare module "bcrypt" {
	export function compare(
		data: string | Uint8Array,
		encrypted: string,
	): Promise<boolean>;

	export function hash(
		data: string | Uint8Array,
		saltOrRounds: string | number,
	): Promise<string>;

	export function genSalt(rounds?: number): Promise<string>;

	const _default: {
		compare: typeof compare;
		hash: typeof hash;
		genSalt: typeof genSalt;
	};
	export default _default;
}
