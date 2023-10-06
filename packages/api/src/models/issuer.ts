import mongoose from "mongoose";

const { Schema } = mongoose;

const IssuerSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  did: {
    type: String,
    required: true,
  },
  ecdh_public_keys:{
    type: String,
  },
  ecdh_private_keys:{
    type: String,
  },
  zkp: {
    required: false,
    credentials: {
      required: false,
      h: {
        type: String
      },
      s: {
        type: String
      },
    },
    keyring: {
      required: false,
      credential:  {
        type: String
      },
    },
    public_key:  {
      type: String
    },
  }
});

export default mongoose.model("Issuer", IssuerSchema);