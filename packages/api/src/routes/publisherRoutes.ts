import express from "express";
import mongoose from "mongoose";
import PublisherModel from "../models/publisher.js";
import PremiumContentModel, {
  PREMIUMCONTENT_STATUS_ACTIVE,
  PREMIUMCONTENT_STATUS_INACTIVE,
  NO_CREDENTIAL,
  VERIFICATION_METHOD_ZKP,
} from "../models/premiumContent.js";

const router = express.Router();

router.put("/premiumContent", async (req, res) => {
  const { url, domain, image, title, amount, conditionType, condition, verification_type } =
    req.body;
  const publisherId = res.locals.userId;
  
  console.table(req.body);

  const exists = await PremiumContentModel.findOne({
    publisherId: publisherId,
    url,
  });
  
  if (exists && exists?.status === PREMIUMCONTENT_STATUS_ACTIVE) {
    return res.status(400).json({ error: "This content is already premium" });
  }

  if(conditionType && conditionType != NO_CREDENTIAL && !condition || condition == NO_CREDENTIAL){
    res.status(400).json({error:"If you select a type of condition to be meeted, you should select the condition "});
  }

  try {
    const premiumContent = await PremiumContentModel.findByIdAndUpdate(
      { _id: exists?._id || new mongoose.Types.ObjectId() },
      {
        publisherId,
        url,
        amount,
        // TODO: Add the currency in the request parameters
        currency: "EUR",
        title,
        image,
        domain,
        age: conditionType == "age" ? condition : NO_CREDENTIAL,
        nationality: conditionType == "nationality" ? condition : NO_CREDENTIAL,
        condition: conditionType && condition? conditionType : NO_CREDENTIAL,
        verification_type:
          verification_type ? verification_type : 
            condition && conditionType && condition != NO_CREDENTIAL && conditionType != NO_CREDENTIAL
            ? 
              VERIFICATION_METHOD_ZKP
            :
              NO_CREDENTIAL,
        status: PREMIUMCONTENT_STATUS_ACTIVE,
      },
      { upsert: true, new: true }
    );
    const response = await PublisherModel.findOneAndUpdate(
      { id: publisherId },
      { $addToSet: { premiumContent: premiumContent._id } },
      { upsert: true, new: true }
    ).populate({
      path: "premiumContent",
      match: {
        status: {
          $in: [PREMIUMCONTENT_STATUS_ACTIVE, PREMIUMCONTENT_STATUS_INACTIVE],
        },
      },
    });

    return res.json(response.premiumContent);
  } catch (err) {
    console.error("Error saving premium content: ", err);
    return res.status(500).json({ error: "Error saving premium content" });
  }
});

export default router;