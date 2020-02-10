import ffmpeg from "fluent-ffmpeg";
import { promises as fs } from "fs";

const SAVE_PATH = process.env.ROOT_DIR + "videos";

function getRes(path) {
	return new Promise((res, rej) => {
		console.log("Getting res");
		ffmpeg.ffprobe(path, function (err, metadata) {
			if (err) {
				console.error(err);
				rej(err);
			} else {
				let obj = {
					width: metadata.streams[0].width,
					height: metadata.streams[0].height
				};
				console.log("Got res", obj);
				res(obj);
			}
		});
	});
}

function transcodeToRes(path, shortSide, bitrate, videoID, portrait) {
	return new Promise((res, rej) => {
		let localSavePath =
			SAVE_PATH + "/" + videoID + "/" + shortSide + ".mp4";
		let resolution = portrait ? shortSide + ":-1" : "-1:" + shortSide;
		let scaleFilter = "scale_npp=" + resolution;
		ffmpeg()
			.input(path)
			.inputOption([
				"-vsync 0",
				"-hwaccel cuvid",
				"-hwaccel_device 0",
				"-c:v h264_cuvid"
			])
			.videoCodec("h264_nvenc")
			.videoFilter("scale_npp=" + resolution)
			.audioCodec("aac")
			.audioBitrate(128)
			.audioChannels(2)
			.videoBitrate(bitrate)
			.save(localSavePath)
			.on('start', command => console.log("starting", command))
			.on("error", err => {
				console.log("Using CPU instead");
				ffmpeg()
					.input(path)
					.videoCodec("h264_nvenc")
					.videoFilter(["hwupload_cuda", scaleFilter])
					.audioCodec("aac")
					.audioBitrate(128)
					.audioChannels(2)
					.videoBitrate(bitrate)
					.save(localSavePath)
					.on("error", err => {
						rej(err);
					})
					.on("end", () => {
						res();
					});
			})
			.on("end", () => {
				res();
			});

	});
}

let generateThumbnail = (path, videoID) => {
	return new Promise((res, rej) => {
		let folder = SAVE_PATH + "/" + videoID;
		console.log(folder)
		ffmpeg()
			.input(path)
			.screenshots({
				timestamps: ["50%"],
				filename: "thumbnail.png",
				folder: folder,
				size: "1600x900"
			})
			.on("error", err => {
				rej(err);
			})
			.on("end", () => {
				res();
			});
	});
};

let processVideo = async (path, video) => {
	console.log("Processing");
	let videoID = video._id;
	let obj = await getRes(path).catch(err =>
		console.error("GetResError", err)
	);

	let qualities = [
		{
			res: 2160,
			bitrate: 45000
		},
		{
			res: 1440,
			bitrate: 16000
		},
		{
			res: 1080,
			bitrate: 8000
		},
		{
			res: 720,
			bitrate: 5000
		},
		{
			res: 480,
			bitrate: 2500
		},
		{
			res: 360,
			bitrate: 1000
		},
		{
			res: 240,
			bitrate: 500
		}
	];

	if (obj) {
		let portrait = obj.width <= obj.height;
		let minest = Math.min(obj.width, obj.height);
		qualities = qualities.filter(quality => minest >= quality.res);
		await generateThumbnail(path, videoID)
		await video.save();
		for await (let quality of qualities) {
			try {
				console.log("Started transcode for", quality.res);
				const { res, bitrate } = quality;
				let startTime = Date.now();
				await transcodeToRes(
					path,
					res,
					bitrate,
					videoID,
					portrait
				);
				console.log("Finished transcoding %i in %d ms", res, Date.now() - startTime)
				video.available_qualities.push(res)
				await video.save();
			} catch (err) {
				console.error(err);
				throw err;
			}
			console.log("Finished all transcodes for", video.title)
		}
		await fs.unlink(path);
	} else {
		console.log("object not found");
	}
};

export default processVideo;
