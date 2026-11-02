/**
 * Runs a resolution that rejects with a plain Error when what it resolves does not resolve, such as a path still
 * being typed or one naming a file that is not there.
 *
 * @param resolve the resolution.
 * @returns what it resolved to, or undefined when it does not resolve.
 * @throws what it rejected with when that is a defect -- a TypeError, RangeError or ReferenceError, or not an Error
 *   at all -- and not something that does not resolve.
 */
export async function unlessUnresolved<T>(resolve: () => Promise<T>): Promise<T | undefined> {
	try {
		return await resolve();
	} catch (error) {
		if (!(error instanceof Error) || isDefect(error)) throw error;
		return undefined;
	}
}

/**
 * @param error an Error thrown.
 * @returns true when it is a defect in this code rather than a fault in what it reads: a TypeError, RangeError or
 *   ReferenceError.
 */
export function isDefect(error: Error): boolean {
	return error instanceof TypeError || error instanceof RangeError || error instanceof ReferenceError;
}
