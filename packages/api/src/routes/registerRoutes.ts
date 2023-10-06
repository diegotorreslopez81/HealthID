import express from "express";
import { getAuth } from "firebase-admin/auth";
import admin from "../services/firebaseService.js";
import PublisherModel from "../models/publisher.js";

const router = express.Router();
const auth = getAuth(admin);
router.post("/setCustomClaims", async (req, res) => {
  const { token, claim } = req.body;

  if (claim !== "publisher") {
    return res.status(400).send({ error: "Invaid claim" });
  }

  try {
    const user = await auth.verifyIdToken(token);

    if (
      typeof user.email !== "undefined" &&
      user.email &&
      process.env.ADMIN_USERS?.split(",").includes(user.email)
    ) {
      await auth.setCustomUserClaims(user.uid, { admin: true });
    } else {
      if (claim === "publisher") {
        if (await PublisherModel.exists({ id: user.uid })) {
          return res.status(400).send({ error: "User already exists" });
        }
        await PublisherModel.create({
          id: user.uid,
          premiumContent: [],
        });
      }
      await auth.setCustomUserClaims(user.uid, { [claim]: true });
    }

    return res.json({ status: "success" });
  } catch (err: any) {
    console.log("Error setting custom claims: ", err.message);
    return res
      .status(401)
      .json({ error: "You are not authorized to make this request" });
  }
});

router.post("/userExist", async (req, res) => {
  const { uid } = req.body;
  try {
    const exist = await PublisherModel.exists({ id: uid }); 

    return res.json({ exist });
  } catch (err: any) {
    console.log("Error consulting DB: ", err.message);
    return res
      .status(500)
      .json({ error: "Error consulting DB" });
  }
});

export default router;
