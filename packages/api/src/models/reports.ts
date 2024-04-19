import mongoose from "mongoose";

const { Schema } = mongoose;

export const REPORT_STATUS_PENDING = "pending";
export const REPORT_STATUS_APPROVED = "approved";
export const REPORT_STATUS_REJECTED = "rejected";

const ReportSchema = new Schema({
  content: {
    time: {
      type: Number,
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
    blocks: [
      {
        id: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        data: {
          type: Object,
          required: true,
        },
      }
    ],
  },
  issuerId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  issuer_did: {
    type: String,
    required: true,
  },
  credential: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    enum: [
      REPORT_STATUS_PENDING,
      REPORT_STATUS_APPROVED,
      REPORT_STATUS_REJECTED
    ],
    default: REPORT_STATUS_PENDING,
    required: true,
  },
});

export default mongoose.model("Report", ReportSchema);
