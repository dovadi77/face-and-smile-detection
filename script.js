var video = document.getElementById("video");

Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  faceapi.nets.faceExpressionNet.loadFromUri("./models"),
  faceapi.nets.ageGenderNet.loadFromUri("./models"),
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
      .detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
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
