<style>
	* {
		box-sizing: border-box;
	}
	a {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		border-radius: 0.4em 0.4em 0 0;
		display: flex;
		align-items: flex-end;
		background: var(--thumbnail) black;
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center;
		text-decoration: none;
	}

	div {
		display: flex;
		flex-wrap: wrap;
		border-bottom-left-radius: 0.4em;
		border-bottom-right-radius: 0.4em;
		padding: 1em;
		width: 100%;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		font-size: 80%;
		color: var(--fg);
		background-color: var(--bg);
	}

	span {
		width: calc(20% - 2em);
		margin: 1em;
		border-radius: 0.4em;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12),
			0 1px 2px rgba(0, 0, 0, 0.24);
		cursor: pointer;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	h1 {
		width: 100%;
		font-size: 1.3em;
	}

	span:hover {
		box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3),
			0 15px 12px rgba(80, 67, 67, 0.22);
	}

	.img-wrapper {
		position: relative;
		padding-bottom: 56.2%;
		border-radius: 0.4em 0.4em 0 0;
		background-color: transparent;
	}

	.vertical {
		width: 95%;
		margin: 0.5em 0;
		height: 115px;
		white-space: normal;
		overflow: visible;
	}

	.vertical .img-wrapper {
		width: 45%;
	}

	.vertical div {
		width: 55%;
		padding: 1em;
		font-size: 0.8;
		border-radius: 0 0.4em 0.4em 0;
		align-content: flex-start;
	}

	.vertical .img-wrapper a {
		border-radius: 0.4em 0 0 0.4em;
	}

	.vertical div h1 {
		font-size: 1.2em;
	}

	.vertical .profilepicture {
		display: none;
		margin: 0;
		margin-right: 0.5em;
	}

	.profilepicture {
		border-radius: 100%;
		height: 3em;
		width: 3em;
		margin: 0.5em;
	}

	@media only screen and (max-width: 1920px) {
		span {
			width: calc(25% - 2em);
		}
	}

	@media only screen and (max-width: 1366px) {
		span {
			width: calc(33% - 2em);
		}
	}

	@media only screen and (max-width: 768px) {
		span {
			width: 95%;
			margin: 0.5em 1em;
		}
	}
</style>

<script>
	export let video;
	export let thumbnail = `url(/api/videos/${video._id}/thumbnail)`;
	export let orientation;
</script>

<span
	onclick="document.location.href='/videos/{video._id}'"
	class="{orientation}">
	<div class="img-wrapper">
		<a style="--thumbnail: {thumbnail};"></a>
	</div>
	<div>
		<h1>{video.title}</h1>
		<img
			class="profilepicture"
			src="data:{video.uploaded_by.profilePicture.type};base64, {video.uploaded_by.profilePicture.data}"
			alt="" />
		<p>
			{video.uploaded_by.username} • {video.uploaded_at.substring(0, 10)}
		</p>
	</div>
</span>
