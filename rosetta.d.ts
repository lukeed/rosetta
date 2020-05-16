export interface Rosetta<T> {
	/** Set the language key */
	locale(lang: string): void;
	/** Define or extend the language table */
	set(lang: string, table: T): void;
	/** Retrieve a translation segment for the current language */
	t<X extends Record<string, any> | any[]>(key: string | (string | number)[], params?: X, lang?: string): string;
}

export default function<T>(dict?: Record<string, T>): Rosetta<T>;
