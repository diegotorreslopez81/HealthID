import apiService from "./apiService";
import { CREDENTIAL_SUPPORT_ZKP } from "../Const";
import { createZkpRequest, credential_request } from "./zkpService";

export const createRequestToIssuer = async (credential: string, userId: string, data: any, claim: string) => {
  const credential_request: credential_request = {
    commit: '',
    pi_s: {
      commit: '',
      rk: '',
      rm: '',
      rr: '',
    },
    public: '',
    sign: {
      a: '',
      b: '',
    },
  };
  let sendData = {credential, userId, data, claim, credential_request };
  if (CREDENTIAL_SUPPORT_ZKP.includes(credential)) {
    const response = await createZkpRequest();
    sendData.credential_request = response.credential_request;
    localStorage.setItem(credential,JSON.stringify(response));
  }
  return await apiService.post("/zenroom/create-credential-request", sendData);
};