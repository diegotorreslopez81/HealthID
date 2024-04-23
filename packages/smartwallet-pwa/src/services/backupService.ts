import { zencode_exec } from 'zenroom';
import { keyring, secret_message } from './zkpService';

export const getDataFromLS = () => {
	const keys = Object.keys(localStorage);
	const data: { [key: string]: any } = {};
	keys.forEach((key) => {
		data[key] = localStorage.getItem(key);
	});
	return JSON.stringify(data, null, 4);
}

/** 
 * @typedef {Object.<string, string>} keypair
 * @property {string} private_key ecdh private key
 * @property {string} public_key ecdh public key
 * @example
 * 
	"keypair": {
		"private_key": "yXtHASzOVzwQaKuCpnq20jwwVedBaDNd9h6qEgewhxo=",
		"public_key": "BAqV0F7EEhddLkATOLR+sXBf6ktmcFEFeqbm1EorhrtTDMr8R8J0dfNmEOYWqaAMh2g4WnHdt7knKEXhIWOb7sE="
	}
 */

/** 
 * Encrypt user data
 * @param {Object} info data to encrypt
 * @param {keypair} keipair user ecdh keypair
 * @return {JSON} encrypted data
 */

export const encrypt = async (message: any, key: keyring): Promise<secret_message> => {
	const keys = JSON.stringify({ password: key.ecdh });
	const data = JSON.stringify({ message, header: 'data backup' });
	const contract = `Scenario 'ecdh': Encrypt a message with a password/secret
		Given that I have a 'string' named 'password' 
		Given that I have a 'string' named 'header' 
		Given that I have a 'string' named 'message'
    When I encrypt the secret message 'message' with 'password'
    Then print the 'secret message'`;
	console.log("data", data);
	console.log("keys", keys);
	const { result } = await zencode_exec(contract, { data, keys });
	const secret_message: secret_message = JSON.parse(result).secret_message;
	return secret_message;
};

/** 
 * Decrypt user data
 * @param {JSON} encryptedData json that contains the information
 * @param {keypair} keypair user ecdh keypair
 * @return {Object}
 */

export const decrypt = async (encryptedData: any, key: keyring): Promise<string> => {
	const keys = JSON.stringify({ password: key.ecdh });
	const data = JSON.stringify(encryptedData);
	const contract = `Scenario 'ecdh': Decrypt the message with the password 
	Given that I have a valid 'secret message' 
	Given that I have a 'string' named 'password' 
	When I decrypt the text of 'secret message' with 'password' 
	When I rename the 'text' to 'textDecrypted'
	Then print the 'textDecrypted' as 'string'`;

	const { result } = await zencode_exec(contract, { data, keys });
	const decrypted = JSON.parse(result).textDecrypted;
	return decrypted;
};
