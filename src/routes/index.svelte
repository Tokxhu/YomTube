<style>

</style>

<script>
	import { onMount } from "svelte";
	import Videobox from "../components/Videobox.svelte";

	let videos;

	onMount(async () => {
		try {
			const response = await fetch(`/api/videos/`);
			videos = await response.json();
			if (videos.length == 0) throw new Error("No videos found");
		} catch (error) {
			console.error(error);
		}
	});
</script>

<svelte:head>
	<title>Yomtube</title>
</svelte:head>

<Videobox title="Latest videos" {videos} />
