import express from "express";
import jwt from "jsonwebtoken";
import { 
  getSafetyQuestions,
  createPBKDF,
  sanitizeAnswers,
  recoveryKeypair
} from "keypair-lib-fork";
import BackupModel from '../models/backup.js';

const router = express.Router();

const tokenLife = "4h";

router.post("/token", async (req, res) => {
  const { userId } = req.body;
  console.table({ userId });
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
      expiresIn: tokenLife,
    });

    res.status(200).json({ token });
  } catch (err: any) {
    console.error("Error creating token: ", err.message);
    return res.status(500).json({ error: "Error creating token" });
  }
});

router.get('/backup-questions', async (req, res) => {
  try {
    const questions =  getSafetyQuestions('en_GB');
    return res.status(200).json(questions);
  } catch (err){
    console.log("Error returning backup questions", err);
    return res.status(500).json({error:"Error returning backup questions"});
  }
});

router.post('/pbkdf', async (req, res) => {
  const { userData } = req.body;
  try {
    const pbkdf = await createPBKDF(userData)
    console.log(pbkdf);
    return res.status(200).json({pbkdf});
  } catch (err){
    console.log("Error creating pbkdf", err);
    return res.status(500).json({error:"Error creating pbkdf"});
  }
});

router.post('/keypair', async (req, res) => {
  const { pbkdf, answers } = req.body;
  console.log(req.body)
  try {
    const sanitizedAnswers = sanitizeAnswers(answers);
    const keypair = await recoveryKeypair(sanitizedAnswers,pbkdf,"user");
    return res.status(200).json(keypair["user"]);
  } catch (err){
    console.log("Error creating keypair", err);
    return res.status(500).json({error:"Error creating keypair"});
  }
});

router.post('/update-backup', async (req, res) => {
  const { public_key, backup } = req.body;

  const result = await BackupModel.findOneAndUpdate(
    {publicKey: public_key},
    {
      backup,
      lastUpdated: Date.now()
    },
    { upsert: true, new: true }
  );

  res.status(200).json({result});
});

router.post('/get-backup', async (req, res) => {
  const { public_key } = req.body;

  const result = await BackupModel.findOne({publicKey:public_key});


  res.status(200).json({result});
});

export default router;