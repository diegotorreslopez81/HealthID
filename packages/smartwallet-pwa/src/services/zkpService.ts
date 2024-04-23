import { zencode_exec } from 'zenroom';
import { LS_DID_KEY } from '../Const';

export type keyring = {
	credential?: string;
	ecdh?: string;
}

export type issuer_public_key = {
	alpha: string;
	beta: string;
}

export type credential_signature = {
	a_tilde: string;
	b_tilde: string;
	h: string;
}

export type aggregated_credential = {
	h: string;
	s: string;
}

export type credential_request = {
	commit: string;
	pi_s: {
		commit: string;
		rk: string;
		rm: string;
		rr: string;
	};
	public: string;
	sign: {
		a: string;
		b: string;
	};
}

export type credential_proof = {
	kappa: string;
	nu: string;
	pi_v: {
		c: string;
		m: string;
		rr: string;
	},
	sigma_prime: {
		h_prime: string;
		s_prime: string;
	}
}

export type secret_message = {
	checksum: string;
	header: string;
	iv: string;
	text: string;
}

/** 
 * @typedef {Object.<string, string>} keys zkp cryptographic key
 * @property {string} credential cryptographic key
 * @example
 * 
		"keys": {
				"credential": "Wqazqj9muBGZLOKWCx3u16IkbIantYapNXXm0xEKqFg="
		}
 */

/** 
 * @typedef {Object.<string, string>} derived_key
 * @description cryptographic keys derivated from {@link keys}
 * @property {string} alpha cryptographic key
 * @property {string} beta cryptographic key 
 * @example
 * 
		"issuer_public_key": {
				"alpha": "Ci3RNr3mQgZ+vdhwEokPnq7djLCyoTotPpqfBRQZoX8VdKdGBhkGoIAKfwGQSZH0CG1ZyssgkjW/SRKElf5sHhOjZWzt9xhfwv70RWy8rZVCxQjlYsq+ziFVPPj/DEbLD+1UzGq3qD0awV5oWOmbP76ogkBobBrLboBT5cTLiLTqBdFo356Y1LwOFrafSeKQFxkZxsFi6TCXrzKqzJDOo7zPSXmbBQgh14cz9JNdKNxt+vc94qVJCbpdJufLjQeE",
				"beta": "C1PrsjE2/BamDZIlMgqs+X26/RzgzKkcG4gL2QhEvubGwwE1+jOEcZlvn/Tv3htxCr/8ytK6o6QNit9ry83btHtKkXaTmeg2DbvX9A5vix9K6s9Y5kcbj0BDsEAePcu0EOdxtJlFsjOcCmOV/DqD+9zq1uVxQvcqSa25PGAtxVOrSOTAuCVX8enZ2mpiNtRZGIF5kROS3KZk98wPz4QtarzbQwV+TWPnE36/R0twjk/S14xYhGMYvjLPKBXr8YpP"
		}
 */

/** 
 * @typedef {Object.<string, string | Object>} credential_request
 * @property {string} commit
 * @property {string} public
 * @property {Object} pi_s
 * @property {Object} sign
 * @example
 * "credential_request": {
				"commit": "AxKluVHA4I86nE9LBr6c/QWz7oBjZT1XQBLv9CEG1cr0e3DOWAyOd+uXxNCknzCFfA==",
				"pi_s": {
						"commit": "UCZFspfQNI4rysCDIxyKRfRBJ6FUge2VhdXFy4u4APs=",
						"rk": "JlHxeyPgfC83xrYn/SodS6f6AwNALHFxFY/GIV39+IA=",
						"rm": "W7QWHqm/YER4FUtDUx+wAu2C6JwKzN/mzf7XEfI8xlY=",
						"rr": "UOFXIJclPXdhzl9282F3fLt99hwsYw/ItNJIKbE8nJs="
				},
				"public": "AhYCP1Ct2ZapJuTYNTzWMUIlgPwFNweJFTrJ/0UWg9a/UwvY8g/9VPTgRJCV0X1SXA==",
				"sign": {
						"a": "AwHC0gMKZALnZ36DnB18bgNGRcOZU1NZNkCMkJsBdegstZxzfSFMVyar9CncbFa5oA==",
						"b": "AwJKblxB6OHktzgT4GvQMbTNleuuV1JxNpqpu/SSGi+hf2XHC2q6N5kHRMucikVQPA=="
				}
		}
 */

/** 
 * @typedef {Object.<string, string>} credential_signature
 * @property {string} a_tilde
 * @property {string} b_tilde
 * @property {string} h
 * @example
 * 
	"credential_signature": {
		"a_tilde": "AhN3jd6CDAWc1jLyE8ITfySsnNBg9tkwF1ndduGJb5cQTonfL6wYi0TWcY/J+9p+7Q==",
		"b_tilde": "AwW32XvYpMJn6jKeHLBy6gsAaW3cZdP2fPXK717lQeA3faYwCAKhONBntknsAp0neg==",
		"h": "AxcTRhBzHHzouliDOtqeuFAsi/6LOznjxnMWv7EMTrEMVmfj5nH16mt7IDGmAD5sfw=="
	}
 */

/** 
 * @typedef {Object.<string, string>} aggregated_credentials
 * @property {string} h
 * @property {string} s
 * @example
 * "credentials": {
			"h": "AhPY7CWI4FraIkfdVSFryiqmmhsrMAUQZ2cU9gx8NagElM6EVmvwkquyGvvmNVfPvw==",
			"s": "AhBAe/odrb36r/vxQrY5cosIdDyTTRdTw7AnNK7WdBq/HANKkGZUd+fuIMnCHal2FQ=="
		}
 */

/** 
 * @typedef {Object.<string, Object>} proof
 * @property {Object} credential_proof
 * @property {Object} sigma_prime
 * @example
 * "credential_proof": {
			"kappa": "GTdiS3buEUkjPyqGNPMc9Mr3kE5bolT0lRgF+S23nS/aplA9XQRQD2mwK6nhYXtDB7CTFkUjQ8OAWdM3qOeH6aoO4cSKIuppZbdgIXy5srn6Rs2QrtGva8JXh8YgovAhD1HUoTCyqaz3L/FkGaPfWJdBW2/gaCYyGQGTJnCM4K4G77tJbStPMF/rhqK6t0EmFUiEjy2kfCR+WUjhjqTXSuELHM5JRn1Gr5VJQsvyRAlJtjNlnDZQru3M87rMyZ3E",
			"nu": "AwmLe0WONv25ih82UmST1u8Lcjm3+rXjP+uQHlAcxRNyK/37hZA6VEFH6nFZgLFP5w==",
			"pi_v": {
				"c": "SCvUZDi260JkRcuVuHcG4wn/UwUQZIWynDJ+BSHM0fw=",
				"rm": "BxPP2u3sfu9HOeEwIR2Aj19sx2IJPT1Lm26fwTV2gcY=",
				"rr": "KpH1KBfSP83DFFfKI4lGhVXjMDifarf4wq7ZTNc4d3Y="
			},
			"sigma_prime": {
				"h_prime": "AgMKaz9wJB6Xapwnluk/My/GBWKZPw10TxU0fKlShP0dtgjpm5s59W0csaALzZXKwA==",
				"s_prime": "AxMW1P/lxg+aHtyyRepv6ImNMMZLpLsA0/tc3C4w589PRkVz/b0tHRohQaZuLOZ/Dw=="
			}
		}
 */

/** 
 * Zenroom contract that creates a zkp credential key and request
 * @param {Object} data dynamic data
 * @param {string} data.userId did of the user
 * @returns {keys} credential_key
 * @returns {credential_request} credential_request
 */

export const createZkpRequest = async (): Promise<{ credential_request: credential_request, keyring: keyring }> => {
	const contract = `
    Rule check version 2.0.0
    Scenario credential: credential keygen
    Given my name is in a 'string' named 'userId'
    When I create the credential key
    When I create the credential request
    Then print my 'keyring'
		Then print my 'credential request'`

	const userId = localStorage.getItem(LS_DID_KEY);
	const data = JSON.stringify({ userId });
	let result = await zencode_exec(contract, { data });

	const request: { credential_request: credential_request, keyring: keyring } = JSON.parse(result.result);
	console.log(result);
	return request;
}

/** 
 * Zenroom contract that aggregates the credential signature with the user keys
 * @param {Object} data dynamic data
 * @param {string} data.userId user did
 * @param {credential_signature} data.credential_signature signed credential request
 * @param {Object} userId where userId is the value of the string
 * @param {keys} userId.keys user private key
 * @returns {aggregated_credential} aggregated_credential
 */

export const aggregatesSignature = async (credential_signature: credential_signature, keyring: keyring): Promise<aggregated_credential> => {
	const contract = `
    Rule check version 2.0.0
    Scenario 'credential': participant aggregates credential signature(s)
    Given my name is in a 'string' named 'userId'
    and I have my 'keyring'
    Given I have a 'credential signature'
    When I create the credentials
    Then print my 'credentials'`;

	const userId: string = localStorage.getItem(LS_DID_KEY) as string;
	const data = JSON.stringify({ userId, credential_signature });
	const keys = JSON.stringify({
		[userId]: {
			keyring: keyring,
		}
	});

	let result: any = await zencode_exec(contract, { data, keys });

	result = JSON.parse(result.result);
	console.log(result)
	return result[userId].credential;
}


/** 
 * Create ZKP
 * @param {aggregated_credentials} aggregated_credentials
 * @param {keys} _keys
 * @param {derived_key} issuer_public_key
 * @return {proof}
 */

export const createProof = async (aggregated_credentials: aggregated_credential, keyring: keyring, issuer_public_key: issuer_public_key): Promise<credential_proof> => {
	const contract = `Rule check version 2.0.0
    Scenario 'credential': participant generates proof 
    Given my name is in a 'string' named 'userId'
    Given I have my 'keys'
    Given I have a 'issuer public key' inside 'issuer'
    Given I have my 'credentials'
    When I aggregate all the issuer public keys
    When I create the credential proof
    Then print the 'credential proof'`;

	const userId: string = localStorage.getItem(LS_DID_KEY) as string;
	const keys = JSON.stringify({
		[userId]: {
			keyring: keyring,
			credentials: aggregated_credentials
		}
	});

	const issuer = {
		issuer_public_key,
	}
	console.log('issuer data', issuer);
	console.log(`public key`, issuer_public_key)
	const data = JSON.stringify({ issuer, userId });
	let result = await zencode_exec(contract, { data, keys });
	const proof: credential_proof = JSON.parse(result.result).credential_proof;
	console.log(proof);
	return proof;
}
