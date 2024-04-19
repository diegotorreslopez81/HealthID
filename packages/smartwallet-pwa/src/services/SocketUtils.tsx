import toast from 'react-hot-toast';
import { Socket } from 'socket.io-client';
import { MutableRefObject } from 'react';
import { DefaultEventsMap } from 'socket.io-client/build/typed-events';
import apiService from './apiService';
import { aggregatesSignature, credential_signature, keyring } from "./zkpService";
import { LS_USER_KEY } from "../Const"

export const updateCredential = async (data: any, socketRef: MutableRefObject<Socket<DefaultEventsMap, DefaultEventsMap>>, dispatch: Function) => {
	const socket = socketRef.current
	const payload = { id: `${data.credential}`, value: `${data.claim}`, pending: false, status: false };

	payload.status = data.status === 'approved';
	if (!data.signedCredential) {
		data.signedCredential = {}
	}

	if (data.credential == "credential_address") {
		const ls = JSON.parse(localStorage.getItem(LS_USER_KEY) as string);
		payload.value = { ...ls.credential_address.value, country: data.claim }
	}
	console.log(payload)

	dispatch({
		type: "update",
		payload,
	});

	let lsData: string = '';

	if (data?.signedCredential?.zkp) {
		let ls = JSON.parse(localStorage.getItem(data.credential) as string);
		const aggregated_credentials = await aggregatesSignature(
			data.signedCredential.zkp.credential_signature as credential_signature,
			ls.keyring as keyring
		);
		const zkp = { ...data.signedCredential.zkp, ...ls, aggregated_credentials };
		lsData = JSON.stringify({ ...data.signedCredential, zkp });
	} else {
		lsData = JSON.stringify({ ...data.signedCredential });
	}


	localStorage.setItem(data.credential, lsData);

	if (!payload.status) {
		const message = `Credential ${data.credential.replace("credential_")} has been declined`;
		toast.error(message)
	} else {
		const message = `Credential ${data.credential.replace("credential_")} has been approved`;
		toast.success(message);
	}
	console.log('emiting changeCredentialRequestRecived event')
	socket.emit("changeCredentialRequestRecived", { _id: data._id });
}

export const getPendingResponses = async (userId: string, socketRef: MutableRefObject<Socket<DefaultEventsMap, DefaultEventsMap>>, dispatch: Function) => {
	console.log('getPendingResponses')

	const response = await apiService.post("/zenroom/check-pending-request", { userId });

	console.log(response.data)

	const promises = await response.data.pendingRequest.map(async (data: any) => {
		console.log('iteration of getPendingResponses forEach loop')
		await updateCredential(data, socketRef, dispatch)
	});

	await Promise.all(promises);
}

export const getPendingRecords = async (userId: string, dispatch: Function) => {
	const response = await apiService.post("/zenroom/check-pending-report", { userId });
	if (!response.data.pendingRequest) {
		return;
	}
	dispatch({
		type: "add-report",
		payload: response.data.pendingRequest,
	});
}
