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
var count = 0;
var age_arr = [];
var gender_arr = [];
var face = false;
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
      .withFaceDescriptors()
      .withFaceExpressions()
      .withAgeAndGender();
    // console.log("aaaaa");
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    if (detections[0] == null) {
      $("#face_finding").html("Face Not Found");
      $("#result_emotion").html("------");
      $("#result_age").html("------");
      $("#result_gender").html("------");
      face = false;
    } else {
      face = true;
      $("#face_finding").html("Face Detected");
      let happiness = 0;
      happiness = detections[0].expressions.happy;
      if (happiness > 0.85) {
        $("#result_emotion").html("You're Seems Happy :)");
      } else {
        $("#result_emotion").html("You're Seems didn't Happy :(");
      }
      if (count < 6) {
        let age = Math.round(detections[0].age);
        age_arr.push(age);
        gender_arr.push(detections[0].gender);
        count++;
      }
    }
  }, 500);
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

$("#calculate").click(function (e) {
  e.preventDefault();
  console.log(gender_arr);
  console.log(age_arr);
  var male_count = 0;
  var female_count = 0;
  var age = 0;
  for (let index = 0; index < age_arr.length; index++) {
    age += age_arr[index];
    if (gender_arr[index] == "male") {
      male_count++;
    } else if (gender_arr[index] == "female") {
      female_count++;
    }
  }
  if (face == true) {
    if (male_count > female_count) {
      $("#result_gender").html("Male");
    } else {
      $("#result_gender").html("Female");
    }
    age = Math.round(age / 6);
    $("#result_age").html(age);
    gender_arr = [];
    age_arr = [];
    count = 0;
  } else {
    gender_arr = [];
    age_arr = [];
    count = 0;
  }
});
