import express from "express";
import didMethod from 'did-method-generic';
import { getAuth } from "firebase-admin/auth";
import admin from "../services/firebaseService.js";
import IssuerModel from '../models/issuer.js';
import { data } from "../services/credentials/credentialsData/index.js";
import {
  CreateW3cKeyPair,
  CreateZkpPrivateKey,
  CreateZkpPublicKey
} from "../services/credentials/contract/initializeIssuer.js";
import { ecdh_key, ecdh_public_key, issuer_keys, issuer_public_key } from "../services/credentials/contract/contracts.js";

const router = express.Router();

const auth = getAuth(admin);
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
  }
]

const didHandler = didMethod.driver({ method: 'moncon', service: svc })

router.get("/users", async (req, res) => {
  const response = await auth.listUsers();
  res.status(200).json(response.users);
});

router.post("/create-issuer", async (req, res) => {
  const { password, email } = req.body;

  try {
    //create account on firebase
    const user = await auth.createUser({
      email,
      password,
    });

    //set custom role
    const id = user.uid;
    const did = (await didHandler.generate()).id;
    await auth.setCustomUserClaims(user.uid, { issuer: true });

    //initialize objects
    let wc3Keypair: {
      ecdh_public_key: ecdh_public_key;
      keyring: {
        ecdh: ecdh_key;
      };
    };

    let zkpPrivateKeypair: {
      [conditionCategory: string]: {
        [condition: string]: issuer_keys;
      }
    } = {};
    let zkpPublicKeypair: {
      [conditionCategory: string]: {
        [condition: string]: issuer_public_key;
      }
    } = {};

    //create w3c keypair
    try {
      wc3Keypair = await CreateW3cKeyPair(did);
      console.log(wc3Keypair, 'wc3Keypair');
      if (!wc3Keypair) {
        return res.status(400).json({ error: 'Error generating the wc3Keypair' });
      }
    } catch (err) {
      console.log(err);
      return res.status(400).json({ error: 'Error generating the wc3Keypair' });
    }

    //create zkp keys

    const conditionTypes = Object.keys(data);

    const promises = await conditionTypes.map(async (conditionCategory: string) => {
      zkpPrivateKeypair[conditionCategory] = {};
      zkpPublicKeypair[conditionCategory] = {};
      const localPomises = await data[conditionCategory].map(async (condition: string) => {
        let key: issuer_keys;
        //creating zkp private key
        try {
          key = await CreateZkpPrivateKey(did);
          zkpPrivateKeypair[conditionCategory][condition] = key;
        } catch (err) {
          console.log(err);
          console.log('Error generating the Zkp private key');
          throw err;
        }
        //creating zkp public key
        try {
          zkpPublicKeypair[conditionCategory][condition] = await CreateZkpPublicKey(did, key);
        } catch (err) {
          console.log(err);
          throw err;
        }
        return condition;
      })
      await Promise.all(localPomises);
      return localPomises
    });

    const keys = await Promise.all(promises);

    await IssuerModel.create({
      id,
      did,
      ecdh_public_keys: wc3Keypair.ecdh_public_key,
      ecdh_private_keys: wc3Keypair.keyring.ecdh,
      zkp: keys,
    });

    return res.status(200).json({ success: 'new issuer created' });
  } catch (err) {
    console.log('Error creating t he issue r', err)
    return res.status(500).json({ error: 'error creating the issuer' })
  }
});

export default router;
