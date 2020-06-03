var video = document.getElementById("video");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  faceapi.nets.faceExpressionNet.loadFromUri("./models"),
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );
}

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  $("#contain").append(canvas);
  var height = $("#video").height();
  var width = $("#video").width();
  const displaySize = { width: width, height: height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    if (detections[0] == null) {
      $("#result").html("Face Not Found");
    } else {
      let happiness = 0;
      happiness = detections[0].expressions.happy;
      if (happiness > 0.85) {
        $("#result").html("You're Seeing Happy :)");
      } else {
        $("#result").html("You're Seeing didn't Happy :(");
      }
    }
  }, 2000);
});
