import { zencode_exec } from "zenroom";
import {
	createZkpPrivateKey,
	createZkpPublicKey,
	createW3cKeyPair,
	ecdh_public_key,
	ecdh_key,
	issuer_keys,
	issuer_public_key
} from "./contracts.js";

export const CreateW3cKeyPair = async (did: string): Promise<{ ecdh_public_key: ecdh_public_key; keyring: { ecdh: ecdh_key; }; }> => {
	const result = await zencode_exec(createW3cKeyPair, {
		data: JSON.stringify({ did }),
		conf: `debug=0`,
	});
	const keypair: {
		ecdh_public_key: ecdh_public_key,
		keyring: {
			ecdh: ecdh_key,
		},
	} = JSON.parse(result.result)[did];

	return keypair;
}


export const CreateZkpPrivateKey = async (did: string): Promise<issuer_keys> => {
	const data = JSON.stringify({ did });

	let result = await zencode_exec(createZkpPrivateKey, { data });
	return result = JSON.parse(result.result)[did];
}

export const CreateZkpPublicKey = async (did: string, privateKey: issuer_keys): Promise<issuer_public_key> => {
	const data = JSON.stringify({ did });
	const keys = JSON.stringify({ [did]: privateKey });
	let result = await zencode_exec(createZkpPublicKey, { data, keys });

	return result = JSON.parse(result.result)[did];
}
