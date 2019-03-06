
var STAGE_WIDTH, STAGE_HEIGHT;

var circleRadius = 150;

function init() {
  STAGE_WIDTH = parseInt(document.getElementById("gameCanvas").getAttribute("width"));
	STAGE_HEIGHT = parseInt(document.getElementById("gameCanvas").getAttribute("height"));

  // Init state object.
	stage = new createjs.Stage("gameCanvas"); // canvas id is gameCanvas
	stage.mouseEventsEnabled = true;
	stage.enableMouseOver(); // Default, checks the mouse 20 times/second for hovering cursor changes

  setupManifest(); // preloadJS
  startPreload();

  stage.update();
}

function initGraphics() {
  drawForceTable();

  var vectors = getThreeRandomVectors();
  for (var vector of vectors) {
    drawVector(vector);
  }
}

function drawForceTable() {

  var forceTable = new createjs.Shape();

  // Draw circle.
  forceTable.graphics.setStrokeStyle(2);
  forceTable.graphics.beginStroke("blue");
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

function drawVector(vector) {

  var arrow = new createjs.Shape();
  arrow.graphics.setStrokeStyle(3);
  arrow.graphics.beginStroke("purple");
  arrow.graphics.moveTo(STAGE_WIDTH/2, STAGE_HEIGHT/2);

  let x = circleRadius * Math.cos(toRadians(vector.direction)) + STAGE_WIDTH/2;
  let y = circleRadius * Math.sin(toRadians(vector.direction)) + STAGE_HEIGHT/2;

  arrow.graphics.lineTo(x, y);
  stage.addChild(arrow);

  // Draw arrow head.
  var arrowHeadClone = Object.create(arrowHead);
  arrowHeadClone.regX = arrowHead.image.width/2;
  arrowHeadClone.regY = arrowHead.image.height/2;
  arrowHeadClone.rotation = vector.direction;
  arrowHeadClone.x = x;
  arrowHeadClone.y = y;
  arrowHeadClone.scaleX = arrowHeadClone.scaleY = 0.1;
  stage.addChild(arrowHeadClone);

  var vectorText = new createjs.Text(vector.magnitude + " N", "16px Arial", "black");
  if (vector.direction < 90 || vector.direction > 270) {
    vectorText.x = x + 10;
  } else {
    vectorText.x = x - vectorText.getMeasuredWidth() - 10;
  }
  if (vector.direction > 0 && vector.direction < 180) {
    vectorText.y = y + 10;
  } else {
    vectorText.y = y - vectorText.getMeasuredHeight();
  }
  stage.addChild(vectorText);


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

function toDegrees (angle) {
  return angle * (180 / Math.PI);
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

//////////////////////// PRELOADJS FUNCTIONS

// bitmap variables
var arrowHead;

function setupManifest() {
 	manifest = [
    {
      src: "images/arrow_head.png",
      id: "arrow_head"
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
