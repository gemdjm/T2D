// consts, for app with nominal size 320 x 550px
var appPortraitW2H = 320/550;
var appLandscapeW2H = 550/320;
var minFactor = 0.5;
var maxFactor = 2;
var fullness = 0.99;

// vars
var initialPortraitWidth = 320;
var initialLandscapeWidth = 550;
var windowWidthToHeight = 1;
var isLandscape = false;
var path = "";
var scalingFactor = 1;
var windowWidth = 0;
var windowHeight = 0;
var appWidth = 0, appHeight = 0;
//var pixelRatio = 1;

function sizeUI(pageName, landscapeArray, portraitArray, fontSizeArray, heightArray) { 
	getWindowDimensions();
	adjustAppDimensions(pageName);

	if (isLandscape) {
		scalingFactor = setScalingFactor(appWidth, initialLandscapeWidth)
		sizeItems(landscapeArray);
	} else {
		scalingFactor = setScalingFactor(appWidth, initialPortraitWidth);
		sizeItems(portraitArray);
	}

	sizeItemFonts(fontSizeArray);
	sizeItemHeights(heightArray);
	var appArea = $("#" + pageName);
	centrePage(appArea, windowWidth, appWidth);
}

function getWindowDimensions() {
	windowWidthToHeight = 1;		// to be approx 320/550 or vice versa
	windowWidth = $(window).width();
	windowHeight = $(window).height();
	windowWidthToHeight = windowWidth / windowHeight;
	isLandscape = (windowWidthToHeight > 1);
}

function adjustAppDimensions(pageName) {
	if (isLandscape)
		calculateLandscapeDimensions();
	else	
		calculatePortraitDimensions();
	var appArea = $("#" + pageName);
	$(appArea).css("width", appWidth);
	$(appArea).css("height", appHeight);
}

function calculateLandscapeDimensions() {
	// check if actual window ratio exceeds app ratio
	if (windowWidthToHeight > appLandscapeW2H )
		adjustAppByHeight("LH", appLandscapeW2H);
	else
		adjustAppByWidth("LW", appLandscapeW2H);
}

function calculatePortraitDimensions() {
	if (windowWidthToHeight > appPortraitW2H )
		adjustAppByHeight("PH", appPortraitW2H);
	else
		adjustAppByWidth("PW", appPortraitW2H);
}

function adjustAppByHeight(pathCode, w2h) {
	path = pathCode;
	appHeight = windowHeight * fullness;
	appWidth = appHeight * w2h;
}

function adjustAppByWidth(pathCode, w2h) {
	path = pathCode;
	appWidth = windowWidth * fullness;
	appHeight = appWidth / w2h;
}

function centrePage(appArea, windowWidth, appWidth) {
	if (windowWidth <= appWidth) return;
	var margin = ( windowWidth - appWidth ) / 2;
	var newLeft = margin;
	$(appArea).css("left", margin);
}

function setScalingFactor( width, originalWidth) {
	var factor = width / originalWidth;
	if (factor < minFactor) factor = minFactor;
	if (factor > maxFactor) factor = maxFactor;
	return factor;
}

function sizeItems(itemsArray) {
	for (var i=0; i < itemsArray.length; i++) {
		var el = document.getElementById(itemsArray[i][0]);
		if (el != null) {
			adjustItemDimensions(el, itemsArray[i]);
      		}
	}
}

function adjustItemDimensions(el, item) {
	var L=scalingFactor * item[1];
	var T=scalingFactor * item[2];
	var W=scalingFactor * item[3];
	var H=scalingFactor * item[4];

	if (L >=0)	el.style.left 	= L + "px";
	if (T >=0)	el.style.top 	= T + "px";
	if (W >=0)	el.style.width 	= W + "px";
	if (H >=0)	el.style.height = H + "px";
}

function sizeItemFonts(itemsArray) {
	for (var i=0; i < itemsArray.length; i++) {
		$(itemsArray[i][0]).css("font-size", (scalingFactor * itemsArray[i][1] ) + "px");
	}
}

function sizeItemHeights(itemsArray) {
	for (var i=0; i < itemsArray.length; i++) {
		$(itemsArray[i][0]).css("height", (scalingFactor * itemsArray[i][1] ) + "px");
	}
}
