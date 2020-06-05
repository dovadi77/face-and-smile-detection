var video = document.getElementById("video");
var flipBtn = document.getElementById("flip");
// default user media options
let defaultsOpts = { audio: false, video: true };
let shouldFaceUser = true;

let supports = navigator.mediaDevices.getSupportedConstraints();
if (supports["facingMode"] === true) {
  flipBtn.disabled = false;
}

let stream = null;

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  faceapi.nets.faceExpressionNet.loadFromUri("./models"),
  faceapi.nets.ageGenderNet.loadFromUri("./models"),
]).then(startVideo);

function startVideo() {
  defaultsOpts.video = { facingMode: shouldFaceUser ? "user" : "environment" };
  navigator.mediaDevices
    .getUserMedia(defaultsOpts)
    .then(function (_stream) {
      stream = _stream;
      video.srcObject = stream;
    })
    .catch(function (err) {
      console.log(err);
    });
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
      .withFaceExpressions()
      .withAgeAndGender();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    console.log(detections);
    if (detections[0] == null) {
      $("#face_finding").html("Face Not Found");
      $("#result_emotion").html("------");
      $("#result_age").html("------");
      $("#result_gender").html("------");
    } else {
      $("#face_finding").html("Face Detected");
      let happiness = 0;
      happiness = detections[0].expressions.happy;
      if (happiness > 0.85) {
        $("#result_emotion").html("You're Seeing Happy :)");
      } else {
        $("#result_emotion").html("You're Seeing didn't Happy :(");
      }
      let age = Math.round(detections[0].age);
      $("#result_age").html(age);
      $("#result_gender").html(detections[0].gender);
    }
  }, 1000);
});

flipBtn.addEventListener("click", function () {
  if (stream == null) return;
  // we need to flip, stop everything
  stream.getTracks().forEach((t) => {
    t.stop();
  });
  // toggle / flip
  shouldFaceUser = !shouldFaceUser;
  $("canvas").remove();
  startVideo();
});
