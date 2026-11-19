import fs from 'node:fs/promises';
import path from 'node:path';

/** A sops YAML file as sops writes it: the keys in clear, every value encrypted, and its own metadata at the end. */
export const ENCRYPTED_SOPS_YAML = [
	'token: ENC[AES256_GCM,data:nq2Z7w==,iv:A1B2,tag:C3D4,type:str]',
	'db:',
	'    password: ENC[AES256_GCM,data:x9Yz,iv:E5F6,tag:G7H8,type:str]',
	'sops:',
	'    kms:',
	'        - arn: arn:aws:kms:eu-west-2:123456789012:key/00000000-0000-0000-0000-000000000000',
	'          created_at: "2026-10-27T10:00:00Z"',
	'          enc: AQICAHg=',
	'    lastmodified: "2026-10-27T10:00:00Z"',
	'    mac: ENC[AES256_GCM,data:bWFj,iv:I9J0,tag:K1L2,type:str]',
	'    version: 3.9.0',
	''
].join('\n');

/** The same document as sops writes it to a JSON file. */
export const ENCRYPTED_SOPS_JSON = JSON.stringify({
	token: 'ENC[AES256_GCM,data:nq2Z7w==,iv:A1B2,tag:C3D4,type:str]',
	db: { password: 'ENC[AES256_GCM,data:x9Yz,iv:E5F6,tag:G7H8,type:str]' },
	sops: { kms: [{ arn: 'arn:aws:kms:eu-west-2:123456789012:key/00000000-0000-0000-0000-000000000000' }], version: '3.9.0' }
}, null, '\t');

/**
 * The folder of a `sops` that cannot decrypt anything: every run reports "Failed to get the data key required to
 * decrypt the SOPS file." and fails. It is a file of the repository rather than one each test writes, because macOS
 * checks an executable the first time it runs, which costs a new file 75-250 ms on a quiet machine and several times
 * that on a loaded one, against 15 ms for every later run of the same file.
 */
const SOPS_WITHOUT_KEY = path.resolve('tests/fixtures/sops-without-key');

/**
 * Runs `work` with a `sops` on `PATH` that cannot decrypt anything, as on a machine without access to the key.
 *
 * @param work what to run while that `sops` is first on `PATH`.
 * @returns whatever `work` returns.
 */
export async function withoutSopsKey<T>(work: () => Promise<T>): Promise<T> {
	const previous = process.env.PATH;
	process.env.PATH = `${SOPS_WITHOUT_KEY}${path.delimiter}${previous ?? ''}`;
	try {
		return await work();
	} finally {
		process.env.PATH = previous;
	}
}

/**
 * Runs `work` with no `sops` anywhere on `PATH`, as on a machine where it was never installed.
 *
 * @param directory a directory the empty `PATH` folder can be made under.
 * @param work what to run while `PATH` holds only that folder.
 * @returns whatever `work` returns.
 */
export async function withoutSops<T>(directory: string, work: () => Promise<T>): Promise<T> {
	const bin = path.join(directory, 'empty-bin');
	await fs.mkdir(bin, { recursive: true });
	const previous = process.env.PATH;
	process.env.PATH = bin;
	try {
		return await work();
	} finally {
		process.env.PATH = previous;
	}
}
