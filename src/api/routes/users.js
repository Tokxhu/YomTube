import express from "express";

import auth from "../middleware/auth";

import User from "../../models/user";
import multer from "multer";
import { promises as fs } from 'fs';
import Jimp from 'jimp';

const GET_PATH = "/tmp";

const upload = multer({
	dest: GET_PATH,
	fileFilter: (req, file, cb) => {
		if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/gif') {
			req.fileValidationError = 'Wrong filetype';
			return cb(null, false, new Error('Wrong filetype'))
		}
		cb(null, true);
	}
});

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
	try {
		let user = new User(req.body);
		console.log("Created user")
		await user.save();
		const token = await user.genJWTToken();
		res.status(201).send({ token });
	} catch (err) {
		res.status(400).send({ error: err.message });
	}
});

// Login
router.post("/login", async (req, res) => {
	try {
		const { identifier, password } = req.body;
		const user = await User.findUser(identifier, password);
		if (!user) return res.status(401).send("Login failed.");
		const token = await user.genJWTToken();
		res.send({ token });
	} catch (err) {
		res.status(400).send({ error: err.message });
	}
});

// Get current user
router.get("/me", auth, async (req, res) => {
	let { user } = req
	res.send({ user });
});

// Get other user
router.get('/:userID', (req, res) => {
	let user = req.params.userID;
	res.send({ user })
})

// TODO global put request for change, like /me/:part

// Set profile picture
router.put('/me/picture', auth, upload.single('file'), async (req, res) => {
	if (req.fileValidationError) return res.send(req.fileValidationError);
	try {
		let user = await User.findById(req.user.id);
		let image = await Jimp.read(req.file.path)
		let newPicture = await image.cover(1024, 1024).resize(1024, 1024);
		await newPicture.write(`${req.file.path}0`)

		user.profilePicture = {
			data: Buffer.from(await fs.readFile(`${req.file.path}0`)).toString('base64'),
			contentType: req.file.mimetype
		}

		await user.save();
		res.send("Changed profile picture")
	} catch (err) {
		res.status(400).send(err.message)
	}
})


// Logout of current session
router.get("/me/logout", auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter(
			obj => obj.token != req.token
		);
		await req.user.save();
		res.send();
	} catch (error) {
		res.status(500).send(error);
	}
});

// Logout of all sessions
router.get("/me/logout/all", auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.send();
	} catch (error) {
		res.status(500).send(error);
	}
});

export default router;
