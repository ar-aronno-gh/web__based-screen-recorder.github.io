
let stream = null,
	audio = null,
	mixedStream = null,
	chunks = [], 
	recorder = null
	startButton = null,
	stopButton = null,
	downloadButton = null,
	recordedVideo = null;

async function setupStream () {
	try {
		stream = await navigator.mediaDevices.getDisplayMedia({
			video: true
		});

		audio = await navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: true,
				noiseSuppression: true,
				sampleRate: 44100,
			},
		});

		setupVideoFeedback();
	} catch (err) {
		console.error(err)
	}
}

function setupVideoFeedback() {
	if (stream) {
		const video = document.querySelector('.video__feedback');
		video.srcObject = stream;
		video.play();
	} else {
		console.warn('No stream available');
	}
}

async function startRecording () {
	await setupStream();

	if (stream && audio) {
		mixedStream = new MediaStream([...stream.getTracks(), ...audio.getTracks()]);
		recorder = new MediaRecorder(mixedStream);
		recorder.ondataavailable = handleDataAvailable;
		recorder.onstop = handleStop;
		recorder.start(1000);
	
		startButton.disabled = true;
		startButton. style. opacity=".5";
		stopButton.disabled = false;
		downloadButton. style. opacity=".5";
	
		console.log('Recording started');
	} else {
		console.warn('No stream available.');
	}
}

function stopRecording () {
	recorder.stop();

	startButton.disabled = false;
	startButton. style. opacity="1";
	stopButton.disabled = true;
	downloadButton. style. opacity="1";
}

function handleDataAvailable (e) {
	chunks.push(e.data);
}

function handleStop (e) {
	const blob = new Blob(chunks, { 'type' : 'video/mp4' });
	chunks = [];

	downloadButton.href = URL.createObjectURL(blob);
	downloadButton.download = 'video.mp4';
	downloadButton.disabled = false;
	

	recordedVideo.src = URL.createObjectURL(blob);
	recordedVideo.load();
	recordedVideo.onloadeddata = function() {
		const rc = document.querySelector(".recorded-video-wrap");
		rc.classList.remove("hidden");
		rc.scrollIntoView({ behavior: "smooth", block: "start" });

		recordedVideo.play();
	}

	stream.getTracks().forEach((track) => track.stop());
	audio.getTracks().forEach((track) => track.stop());

	console.log('Recording stopped');
}


window.addEventListener('load', () => {
	startButton = document.querySelector('.start__recording');
	stopButton = document.querySelector('.stop__recording');
	downloadButton = document.querySelector('.download__video');
	recordedVideo = document.querySelector('.recorded__video');

	startButton.addEventListener('click', startRecording);
	stopButton.addEventListener('click', stopRecording);
})