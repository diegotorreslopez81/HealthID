import express, { Request, Response } from "express";
import { zencode_exec } from "zenroom";
import { DateTime } from "luxon";
import axios from 'axios';
import didMethod from 'did-method-generic';
import IssuerModel from '../models/issuer.js';
import ReportModel from "../models/reports.js";
import CredentialRequestModel, {
  CREDENTIAL_REQUEST_STATUS_PENDING,
  CREDENTIAL_REQUEST_STATUS_DECLINED,
  CREDENTIAL_REQUEST_STATUS_APPROVED
} from "../models/CredentialRequest.js";
import {
  singVC,
  signZkp,
} from "../services/credentials/contract/contracts.js";
import { getCondition } from "../services/credentials/credentialsData/index.js";

const apiroom = axios.default.create({
  baseURL: process.env.APIROOM_BASE_URL,
});

const svc = [
  {
    "id": "#linkedin",
    "type": "linkedin",
    "serviceEndpoint": "https://www.linkedin.com/company/infinitelabs-co"
  },
  {
    "id": "#gitlab",
    "type": "gitlab",
    "serviceEndpoint": "https://gitlab.com/infinite-labs"
  },
  {
    "id": "#github",
    "type": "github",
    "serviceEndpoint": "https://github.com/8infinitelabs"
  }
]

const didHandler = didMethod.driver({ method: 'moncon', service: svc })

const router = express.Router();

router.get("/pending-credential-request", async (req, res) => {
  const { skip } = req.query;
  try {
    const response = await CredentialRequestModel.find(
      {
        status: CREDENTIAL_REQUEST_STATUS_PENDING
      }
    )
      .skip(skip || 0)
      .limit(20);

    console.log(response)

    res.status(200).json(response);
  } catch (err) {
    console.log('error retrieving pending credential request', err);
    res.status(500).json({ error: "Error retrieving pending credential request" });
  }
});

router.get("/unique-request", async (req, res) => {
  const { id } = req.query;
  try {
    const response = await CredentialRequestModel.findById(id);
    console.log(response)
    res.status(200).json(response);
  } catch (err) {
    console.log('error retrieving unique request', err);
    res.status(500).json({ error: "Error retrieving unique request" });
  }
});

router.post("/approve-credential", async (req, res) => {
  const { _id, signedCredentials } = req.body;
  try {
    const request = await CredentialRequestModel.findById(_id);

    if (request.status !== CREDENTIAL_REQUEST_STATUS_PENDING) {
      return res.status(400).json({ error: "This request already has been validated" });
    }

    request.status = CREDENTIAL_REQUEST_STATUS_APPROVED;
    request.signedCredential = { ...request.signedCredential, ...signedCredentials };
    await request.save();
    console.log(request)
    res.status(200).json({ request });
  } catch (err) {
    console.log('error updating credential request status', err);
    res.status(500).json({ error: "Error updating credential request status" });
  }
});

router.post("/decline-credential", async (req, res) => {
  const { _id } = req.body;
  try {
    const request = await CredentialRequestModel.findById(_id);

    if (request.status !== CREDENTIAL_REQUEST_STATUS_PENDING) {
      return res.status(400).json({ error: "This request already has been validated" });
    }

    request.status = CREDENTIAL_REQUEST_STATUS_DECLINED;
    request.signedCredential = {};
    await request.save();
    console.log(request)
    res.status(200).json({ request });
  } catch (err) {
    console.log('error updating credential request status', err);
    res.status(500).json({ error: "Error updating credential request status" });
  }
});

router.post("/zkp-sign", async (req, res) => {
  console.log("/zkp-sign in zenroomRouter");
  const id = res.locals.userId;
  const { requestId } = req.body;

  const issuer = await IssuerModel.findOne({ id })
  const did: string = issuer.did;

  const request = await CredentialRequestModel.findById(requestId);
  const { userId, credential, claim, signedCredential } = request;

  let data = JSON.stringify({ userId });
  let result: any = {};
  let userData = { ...signedCredential };

  //Check in which condition the claim fullfils
  console.log("Check in which condition the claim fullfils")
  let data_keys: any = {}

  const conditions = getCondition(credential, claim);

  data_keys[did] = JSON.parse(issuer.issuer_private_keys).zkp[conditions.conditionCategory][conditions.condition]
  data_keys.issuer_public_key = JSON.parse(issuer.issuer_public_keys).zkp[conditions.conditionCategory][conditions.condition].issuer_public_key


  //sign credential request
  console.log("sign credential request");
  try {
    result = await zencode_exec(signZkp, {
      data: JSON.stringify({
        credential_request: userData.credential_request,
        did
      }),
      keys: JSON.stringify(data_keys),
      conf: `debug=0`,
    });

    if (!(result.result.length > 0)) {
      console.log(result)
      return res.status(500).json({ error: 'Error generating credential_signature' })
    }

    result = JSON.parse(result.result);
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Error generating credential_signature' })
  }

  const { keys, verifier, ...response_data } = result;

  userData = { ...userData, ...response_data };

  data = JSON.stringify({
    userId,
    credential_signature: userData.credential_signature,
  })

  data_keys = {
    [userId]: {
      keys: { ...userData.keys }
    }
  }
  data_keys = JSON.stringify(data_keys)

  userData.issuer_did = did;

  //upload to sawrooth

  console.log("upload to sawrooth");

  const sawtoothCredential = await apiroom.post('/save-object-on-sawtooth', { data: { credential: userData.credential_signature } });

  const { myTag } = sawtoothCredential.data;

  console.log({ myTag })

  userData.myTag = myTag;

  return res.status(200).json({ userData })

});

router.post("/w3c-sign", async (req, res) => {
  try {
    const id = res.locals.userId;
    const { requestId } = req.body;

    const issuer = await IssuerModel.findOne({ id })
    const did = issuer.did;

    const request = await CredentialRequestModel.findById(requestId);
    const { credential } = request;

    const credential_did = (await didHandler.generate()).id;

    const credentialSubject = {
      id: request.userId,
      credential: {
        id: credential_did,
        [credential.replace('credential_', '')]: request.claim
      }
    }

    console.log(credentialSubject, "credentialSubject");
    const zenData = {
      "my-vc": {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://www.w3.org/2018/credentials/examples/v1",
        ],
        id: `${process.env.API_URL_CREDENTIAL}/credentials/1`,
        type: ["VerifiableCredential"],
        issuer: "https://moncon.co/",
        issuanceDate: DateTime.now().toString(),
        credentialSubject,
      },
    };

    const w3cKeyPair = JSON.parse(issuer.issuer_private_keys).w3c

    const result = await zencode_exec(singVC, {
      data: JSON.stringify(zenData),
      keys: JSON.stringify({
        Issuer: {
          ...w3cKeyPair,
          PublicKeyUrl: `${process.env.API_URL_CREDENTIAL}/public_key?did=${did}`
        }
      }),
      conf: `debug=0`,
    });

    const sawtoothCredential = await apiroom.post('/save-object-on-sawtooth', { data: { credential: JSON.parse(result.result) } })

    const { myTag } = sawtoothCredential.data;

    const response = {
      ...JSON.parse(result.result),
      myTag,
      issuer_did: did
    }

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json({ ready: false, error });
  }
});

router.post("/report", async (req: Request, res: Response) => {
  const {
    userId,
    content,
  } = req.body;
  try {
    const id = res.locals.userId;

    const issuer = await IssuerModel.findOne({ id })
    const did = issuer.did;

    const credential_did = (await didHandler.generate()).id;

    const credentialSubject = {
      id: userId,
      credential: {
        id: credential_did,
        'medical_report': JSON.stringify(content)
      }
    }

    console.log(credentialSubject, "credentialSubject medical");
    const zenData = {
      "my-vc": {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://www.w3.org/2018/credentials/examples/v1",
        ],
        id: `${process.env.API_URL_CREDENTIAL}/credentials/1`,
        type: ["VerifiableCredential"],
        issuer: "https://moncon.co/",
        issuanceDate: DateTime.now().toString(),
        credentialSubject,
      },
      PublicKeyUrl: `${process.env.API_URL_CREDENTIAL}/public_key?did=${did}`
    };

    const w3cKeyPair = {
      keyring: {
        ecdh: issuer.ecdh_private_keys,
      },
    };

    const result = await zencode_exec(singVC, {
      data: JSON.stringify(zenData),
      keys: JSON.stringify({
        Issuer: {
          ...w3cKeyPair,
        }
      }),
      conf: `debug=0`,
    });

    const report = await ReportModel.create({
      issuerId: id,
      userId,
      content,
      issuer_did: did,
      credential: JSON.parse(result.result)['my-vc']
    });

    res.status(200).json(report);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
