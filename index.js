var hasLS 		= false;
var canUseLS 	= false;

var indexAreasL   	= [ [ "indexHeader", 0,0,550,50 ], [ "indexContent", 0,50,550,270 ] ]
var indexAreasP   	= [ [ "indexHeader", 0,0,320,50 ], [ "indexContent", 0,50,320,430 ] ]
var indexFontSizes	= [ [ "h1", 30 ], [ "td", 18 ], [ "input", 16 ] ];
var indexHeights  	= [ [ "img", 40 ], [ "input", 25 ] ];

var oddRowColour	= "#EEE8AA";
var evenRowColour	= "#FAFAD2";

$(document).ready(function() { setupDisplay(); }) 

$(window).resize(function() { resizePage(); });

function setupDisplay() {
	noteLocalStorageUsability();
	displaySubjectRows();
	colourAlternateSubjectRows();
	resizePage();
}

function noteLocalStorageUsability() {
	hasLS = supportsLocalStorage();
	if (hasLS)
		canUseLS = canSaveToLocalStorage();
}

function displaySubjectRows() {  // append to existing dummy row
	//var subjectCount = subjectInfo.length;
	//var rowHtml = "";
	for (var i=0; i<subjectInfo.length; i++)
		$("#indexTable tr:last").after(makeSubjectRow(i));
}

function colourAlternateSubjectRows() {
	$("#indexTable tr:odd").css("background-color", oddRowColour);
	$("#indexTable tr:even").css("background-color", evenRowColour);
}

function resizePage() { 
	sizeUI("indexPage", indexAreasL, indexAreasP, indexFontSizes, indexHeights); 
}

function makeSubjectRow(i) {
	return "<tr onclick='startSubject(\"" + subjectInfo[i][0].toString() + "\",\"" + subjectInfo[i][5].toString() + "\" )'>"
	+ "<td>" + subjectInfo[i][6].toString() + "</td>"
	+ "<td><img src='" + subjectInfo[i][7].toString() + ".jpg' /></td>"
	+ "</tr>";
}

function startSubject(subjectName, arrayName) {
	if (canUseLS )
		startSubjectViaLS(subjectName, arrayName);
	else
		startSubjectViaQS(subjectName, arrayName);
}

function startSubjectViaLS(subjectName, arrayName) {
	localStorage["subject"] = subjectName;
	localStorage["array"] = arrayName;
	location.href = "t2dmain.html";
}

function startSubjectViaQS(subjectName, arrayName) {
	// for local non-LS testing
	location.href = "t2dmain.html?s=" + subjectName + "&a=" + arrayName;
}

 