import Router from "express";
import { Video } from "../../models/index.js";
import multer from "multer";
import auth from "../middleware/auth";
import processVideo from "../utils/transcoder";
import { promises as fs } from "fs";

const router = Router();

const GET_PATH = "/tmp";
const SAVE_PATH = process.env.ROOT_DIR + "videos";

const upload = multer({ dest: GET_PATH });
// Get all videos
router.get("/", async (req, res) => {
	try {
		const videos = await Video.find({});
		res.json(videos);
	} catch (err) {
		res.status(400).send({ error: err.message });
	}
});

// Get specific video
router.get("/:id", async (req, res) => {
	let id = req.params.id;
	try {
		const video = await Video.findOne({ _id: id });
		res.send({ video });
	} catch (err) {
		res.status(400).send({ error: err.message });
	}
});

router.get("/:id/video", async (req, res) => {
	let id = req.params.id;
	try {
		const video = await Video.findOne({ _id: id }, "filePath");
		res.sendFile(video.filePath, { root: "/" });
	} catch (err) {
		res.status(400).send({ error: err.message });
	}
});

// Upload video
router.post("/", auth, upload.single("video"), async (req, res) => {
	try {
		if (!req.file) throw new Error("No file was provided");
		const { title, desc } = req.body;
		const { filename, path } = req.file;
		const video = new Video({
			title: title,
			description: desc,
			filePath: path,
			user: req.user
		});
		await video.save();

		let outputPath = `${SAVE_PATH}/${video._id}`;
		console.log(outputPath);
		await fs.mkdir(outputPath);
		video.filePath = outputPath;

		processVideo(`${GET_PATH}/${filename}`, video);
		res.status(201).send({ video });
	} catch (err) {
		console.error(err);
		res.status(400).send({ error: err.message });
	}
});
export default router;
