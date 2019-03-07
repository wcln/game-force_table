
var STAGE_WIDTH, STAGE_HEIGHT;

var circleRadius = 150;

var measurementTool;
var measurementToolText;

var stageVectors = [];

function init() {
  STAGE_WIDTH = parseInt(document.getElementById("gameCanvas").getAttribute("width"));
	STAGE_HEIGHT = parseInt(document.getElementById("gameCanvas").getAttribute("height"));

  // Init state object.
	stage = new createjs.Stage("gameCanvas"); // canvas id is gameCanvas
	stage.mouseEventsEnabled = true;
	stage.enableMouseOver(); // Default, checks the mouse 20 times/second for hovering cursor changes
  createjs.Touch.enable(stage);

  setupManifest(); // preloadJS
  startPreload();

  initModal();
  initEventListeners();

  stage.update();
}

function initEventListeners() {
  $("#magnitude, #direction").on("input", function() {
    $("#direction, #magnitude, #feedback").removeClass("incorrect");
    $("#feedback").html("Hover your mouse over the force table to determine the directions of the shown forces.");
  });
}

function initModal() {
  // Get the modal
  var modal = document.getElementById('instructionsModal');

  // Get the button that opens the modal
  var btn = document.getElementById("instructions");

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];

  // When the user clicks the button, open the modal
  btn.onclick = function() {
    modal.style.display = "block";
  }

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }

  // Open Modal on page load.
  modal.style.display = "block";
}

function initGraphics() {
  drawForceTable();

  var vectors = getThreeRandomVectors();
  for (var vector of vectors) {
    drawVector(vector);
  }

  initAngleMeasurementTool();
  stage.update();
}

function initAngleMeasurementTool() {
  stage.on("stagemousemove", function(event) {
    stage.removeChild(measurementTool);
    stage.update();
    measurementTool = new createjs.Shape();
    measurementTool.graphics.setStrokeStyle(2);
    measurementTool.graphics.beginStroke("black");
    measurementTool.graphics.moveTo(STAGE_WIDTH/2, STAGE_HEIGHT/2);
    let angle = Math.atan((event.stageY - STAGE_HEIGHT/2)/(event.stageX - STAGE_WIDTH/2))
    angle = toDegrees(angle);
    if (event.stageX < STAGE_WIDTH/2) angle += 180;
    let x = (circleRadius + 30) * Math.cos(toRadians(angle)) + STAGE_WIDTH/2;
    let y = (circleRadius + 30) * Math.sin(toRadians(angle)) + STAGE_HEIGHT/2;
    measurementTool.graphics.lineTo(x, y);
    measurementTool.graphics.beginFill("red");
    measurementTool.graphics.drawCircle(x, y, 5);
    stage.addChild(measurementTool);

    stage.removeChild(measurementToolText);
    angle = -angle;
    if (angle < 0) angle += 360;
    // measurementToolText = new createjs.Text(angle.toFixed(0) + "°", "bold 16px Century Gothic", "black");
    // measurementToolText.x = x;
    // measurementToolText.y = y;
    $("#measured").html(angle.toFixed(0) + "°");

    stage.addChild(measurementToolText);
    stage.update();
  });
}

function checkAnswer() {

  if ($("#magnitude").val() == "" || $("#direction").val() == "") {
    $("#feedback").addClass("incorrect");
    $("#magnitude").removeClass("incorrect");
    $("#direction").removeClass("incorrect");
    $("#feedback").html("Magnitude and direction can not be empty!");
    return;
  }

  let x = 0;
  let y = 0;
  for (var stageVector of stageVectors) {
    let vector = stageVector.vector;
    x += vector.magnitude * Math.cos(toRadians(vector.direction));
    y += (vector.magnitude * Math.sin(toRadians(vector.direction)));
  }

  let answerMagnitude = parseFloat(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)).toFixed(1));
  let combinedAngle = toDegrees(Math.atan(y/x));
  if (x < 0) combinedAngle += 180;
  if (combinedAngle < 0) combinedAngle += 360;
  let answerAngle = parseInt(combinedAngle + 180) % 360;

  console.log("Answer Angle: " + answerAngle);
  console.log("Answer Magnitude: " + answerMagnitude);

  var correct = true;

  var providedMagnitude = parseInt($("#magnitude").val());
  var providedDirection = parseInt($("#direction").val());

  if (Math.abs(providedMagnitude - answerMagnitude) > 5) {
    correct = false;
    $('#magnitude').addClass('incorrect');
  } else {
    $('#magnitude').addClass('correct');
  }

  if (Math.abs(providedDirection - answerAngle) > 5) {
    correct = false;
    $('#direction').addClass('incorrect');
  } else {
    $('#direction').addClass('correct');
  }

  // If correct, show the answer vector.
  if (correct) {
    drawVector({magnitude: answerMagnitude, direction: answerAngle}, "#41f459");
    $("#feedback").html("Correct! The missing force is shown on the table. Click 'New Vectors' to try another problem.");
    $("#feedback").addClass("correct");
    $("#submit").attr("disabled", true);
    $("#magnitude").attr("disabled", true);
    $("#direction").attr("disabled", true);
  } else {
    $("#feedback").html("Incorrect. Try again!");
    $("#feedback").addClass("incorrect");
  }
}

function drawForceTable() {

  var forceTable = new createjs.Shape();

  // Draw circle.
  forceTable.graphics.setStrokeStyle(3);
  forceTable.graphics.beginStroke("#42bcf4");
  forceTable.graphics.drawCircle(STAGE_WIDTH/2, STAGE_HEIGHT/2, circleRadius);

  // Draw dashed lines.
  forceTable.graphics.setStrokeDash([10, 10], 5);
  forceTable.graphics.beginStroke("grey");
  forceTable.graphics.moveTo(STAGE_WIDTH/2, STAGE_HEIGHT/2 - circleRadius);
  forceTable.graphics.lineTo(STAGE_WIDTH/2, STAGE_HEIGHT/2 + circleRadius);
  forceTable.graphics.moveTo(STAGE_WIDTH/2 - circleRadius, STAGE_HEIGHT/2);
  forceTable.graphics.lineTo(STAGE_WIDTH/2 + circleRadius, STAGE_HEIGHT/2);

  stage.addChild(forceTable);

  stage.update();
}

function drawVector(vector, color="#8f42f4") {

  var arrow = new createjs.Shape();
  arrow.graphics.setStrokeStyle(3);
  arrow.graphics.beginStroke(color);
  arrow.graphics.moveTo(STAGE_WIDTH/2, STAGE_HEIGHT/2);

  let x = circleRadius * Math.cos(toRadians(-vector.direction)) + STAGE_WIDTH/2;
  let y = circleRadius * Math.sin(toRadians(-vector.direction)) + STAGE_HEIGHT/2;

  arrow.graphics.lineTo(x, y);
  stage.addChild(arrow);

  // Draw arrow head.
  var arrowHeadClone = null;
  if (color == "#41f459") {
    arrowHeadClone = Object.create(arrowHeadCorrect);
  } else {
    arrowHeadClone = Object.create(arrowHead);
  }

  arrowHeadClone.regX = arrowHead.image.width/2;
  arrowHeadClone.regY = arrowHead.image.height/2;
  arrowHeadClone.rotation = -vector.direction;
  arrowHeadClone.x = x;
  arrowHeadClone.y = y;
  arrowHeadClone.scaleX = arrowHeadClone.scaleY = 0.1;
  stage.addChild(arrowHeadClone);

  var vectorText = new createjs.Text(vector.magnitude + " N", "16px Century Gothic", "black");
  vectorText.x = x;
  vectorText.y = y;
  if (vector.direction > 90 && vector.direction < 270) {
    vectorText.x -= vectorText.getMeasuredWidth() + 10;
  } else {
    vectorText.x += 10;
  }
  if (vector.direction > 0 && vector.direction < 180) {
    vectorText.y -= 10;
  }
  stage.addChild(vectorText);

  // Store all vector objects so they can be removed later.
  stageVectors.push({shape: arrow, arrowHead: arrowHeadClone, text: vectorText, vector: vector});
  stage.update();
}

function getThreeRandomVectors() {
  var vectors = [];
  for (var i = 0; i < 3; i++) {

    // Get a magnitude between 20 and 500 to one decimal point.
    var magnitude = parseFloat((Math.random() * 500 + 20).toFixed(1));

    // Get a random direction which isn't within 30 degrees of another angle.
    do {
      var direction = Math.floor(Math.random() * 359);
    } while (typeof vectors.find(v => Math.abs(v.direction - direction) < 30) !== 'undefined');

    // Add the new vector to the array.
    vectors.push({
      magnitude: magnitude,
      direction: direction
    });
  }
  return vectors;
}

function reset() {

  // Clear answer text inputs.
  $("#magnitude, #direction").val("");
  $("#magnitude, #direction, #feedback").removeClass("correct incorrect");
  $("#feedback").html("Hover your mouse over the force table to determine the directions of the shown forces.");
  $("#magnitude, #direction, #submit").attr("disabled", false);

  // Remove existing vectors.
  for (var v of stageVectors) {
    stage.removeChild(v.shape);
    stage.removeChild(v.arrowHead);
    stage.removeChild(v.text);
  }

  // Clear array.
  stageVectors = [];

  // Add 3 new random vectors.
  var vectors = getThreeRandomVectors();
  for (var vector of vectors) {
    drawVector(vector);
  }
}

function toDegrees (angle) {
  return angle * (180 / Math.PI);
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

//////////////////////// PRELOADJS FUNCTIONS

// bitmap variables
var arrowHead, arrowHeadCorrect;

function setupManifest() {
 	manifest = [
    {
      src: "images/arrow_head.png",
      id: "arrow_head"
    },
    {
      src: "images/arrow_head_correct.png",
      id: "arrow_head_correct"
    }
 	];
}


function startPreload() {
	preload = new createjs.LoadQueue(true);
    preload.installPlugin(createjs.Sound);
    preload.on("fileload", handleFileLoad);
    preload.on("progress", handleFileProgress);
    preload.on("complete", loadComplete);
    preload.on("error", loadError);
    preload.loadManifest(manifest);
}

function handleFileLoad(event) {
	console.log("A file has loaded of type: " + event.item.type);
  // create bitmaps of images
  if (event.item.id == "arrow_head") {
    arrowHead = new createjs.Bitmap(event.result);
  } else if (event.item.id == "arrow_head_correct") {
    arrowHeadCorrect = new createjs.Bitmap(event.result);
  }
}

function loadError(evt) {
    console.log("Error!",evt.text);
}

// not currently used as load time is short
function handleFileProgress(event) {

}

/*
 * Displays the start screen.
 */
function loadComplete(event) {
  console.log("Finished Loading Assets");

  initGraphics();
}

///////////////////////////////////// END PRELOADJS FUNCTIONS
