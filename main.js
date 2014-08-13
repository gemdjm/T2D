var itemState = [];
var notesArray = [];

// next 2 arrays are only used while divShow Panel is active
var excludedItems = [];
var excludedItemsIndexes = [];

var subjectName = "";
var dataArrayName = "";
var listNumber = 0;
var showLimit = 10;

var hasLS = false;
var canUseLS = false;
var dataInLS = false;
var dataLoaded = false;

var showMode = false;
var hideMode = false;
var editMode = false;
var editElement = null;
var newItem = false;

var stateCodeGet 		= "G";
var stateCodeOK 		= "K";
var stateCodeNot 		= "N";
var stateCodeXcluded	= "X";

var yellowColourGet 	= "#ff0";
var greenColourOK 	= "#0f7";
var whiteColourNot 	= "#fff";

$(document).ready( function() { setupDisplay(); } )

function setupDisplay() {
   	checkForLocalStorage();
	setDataArraysToBeUsed();
	showMainDisplay();
	loadData(); 		// involving localStorage if accessible
	sortItems();		// within items array and display
}

// PANELS

function showMainDisplay() {
	hidePanels();
	$("#divTop").css("display", "block");
	$("#divMain").css("display", "block");
}

function hidePanels() { 
	$("#divTop").css("display", "none");
	$("#divMain").css("display", "none");
	$("#divEdit").css("display", "none");
	$("#divHelper").css("display", "none");
	$("#divShow").css("display", "none");
}

function showHelp() { 
	if (editMode || hideMode || showMode)
		return;
	hidePanels();
	$("#divHelper").css("display", "block");
}

// MODES

function setHideMode() {
	// user can toggle hide mode
	clearMsg();
	hideMode = !hideMode;
	if (hideMode)
		startHideMode();
	else
		endHideMode();
}

function startHideMode() {
	$("#imgHide").addClass("active");
	if (canUseLS)
		say("Hide mode - now tap item to be hidden");
	else
		say("Hide mode - no save (no Local Storage)");
}

function endHideMode() {
	$("#imgHide").removeClass("active");
	say ("not hiding"); 
}

function setNewMode() {
	// user can toggle
	clearMsg();
	newItem = !newItem;
	if (newItem)
		startNewMode();
	else
		say ("not adding");
	editMode = true;
}

function startNewMode() {
	editMode = true;
	$("#txtEdit").val("");
	startEdit(null);
}

function setEditMode() {
	if (hideMode || showMode)
		return;
	// user can toggle
	clearMsg();
	editMode = !editMode;
	if (editMode)
		startEditMode();
	else
		say ("not editing");
}

function startEditMode() {
	if (canUseLS)
		say("Edit mode - now tap item to be edited");
	else
		say("Edit mode - no save (no Local Storage)");
}

function setShowMode() {
// to show excluded items that match user input
	gatherExcludedItems();
	if (excludedItemsIndexes.length == 0) {
		say("no excluded items");
		return;
	}

	hideMode = false;
	showMode = true;
	hidePanels();
	setupPanelToShowHiddenItems();
}

function setupPanelToShowHiddenItems() {
	$("#divShow").css("display", "block");
	initialiseShowContents();
}

function initialiseShowContents() {
	$("#txtShow").val("");
	$("#txtShow").focus();
	$("#divShowItems").html("");
}

function gatherExcludedItems() {
	clearExcludedItemArrays();
	fillExcludedItemArrays();
	if (excludedItems.length < showLimit)
		findMatchingItems();	
}

function clearExcludedItemArrays() {
	excludedItems.length = 0;
	excludedItemsIndexes.length = 0;
}

function fillExcludedItemArrays() {
	for (var i=0; i<itemState.length; i++) {
		if ( itemState[i].substr(0,1) == stateCodeXcluded) {
			excludedItems.push(itemState[i].substr(2));
			excludedItemsIndexes.push(i);
		}
	}
}

function cancelShow() {
	hideMode = false;
	showMode = false;
	clearExcludedItemArrays();
	showMainDisplay();
	sortItems();
}

// SHOW HIDDEN ITEMS

function findMatchingItems() {
	// runs each time the user input changes

// trim fails ("not supported") at 123 but OK locally
	//var reqt = $("#txtShow").val().trim().toLowerCase();
	var reqt = $("#txtShow").val().toLowerCase();

	var matchCount = 0, matchList = "";
	for (var i=0; i<excludedItems.length; i++) {
		if (excludedItems[i].toLowerCase().indexOf(reqt) > -1) {
			matchCount++;
			matchList += "<span onclick='unhideItem(" + i + ")' >" + excludedItems[i] + "</span><br />";
		}		
	}
	showMatchResults(matchCount, matchList);
}

function showMatchResults(matchCount, matchList) {
	if (matchCount <= showLimit)
		$("#divShowItems").html(matchList);
	else	// just show the count
		$("#divShowItems").text(matchCount);
}

function unhideItem(i) {
	var itemIndex = excludedItemsIndexes[i];	
	var detail = itemState[itemIndex].substr(2);
	itemState[itemIndex] = stateCodeGet + "~" + detail ;
	saveToLocalStorage();
	initialiseShowContents();
	gatherExcludedItems();
}

// DISPLAY

function sortItems() {
	if (editMode || hideMode || showMode)
		return;
	clearMsg();
	sortItemsInArray();
//	display items, with colours according to statusCode
	showItems();
	saveToLocalStorage();
}

function sortItemsInArray() {
//	sort array by statusCode, then detail
	for (var i=0; i<itemState.length-1; i++) {
		for (var j = i+1; j<itemState.length; j++) {
			if (itemState[i] > itemState[j])
				swapItemPair(i,j);
		}
	}
}

function swapItemPair(i, j) {
	var holdItem = itemState[i];
	itemState[i] = itemState[j];
	itemState[j] = holdItem;
}

function showItems() {
// generate item DIVs, with IDs matching array index, i.e. starting with "item0" (unless 1st is hidden)
	var list = "";
	for (var i=0; i< itemState.length; i++) {		
		var state = itemState[i].substr(0,1);
		var detail = itemState[i].substr(2);
		// exclude any hidden items
		if (state != stateCodeXcluded) {
			list += '<div id="item' + (i) + '" onclick="cc()" >' + detail + '</div>';	// BASE 0
		}
	}
	$("#divMain").html(list);
	showColours();
}

function showColours() {
	for (var i=0; i<itemState.length; i++) {		
		var stateCode = itemState[i].substr(0,1);
		if (stateCode != stateCodeXcluded) {
			var newColour = (stateCode == stateCodeNot) ? whiteColourNot 
				: ((stateCode == stateCodeGet) ? yellowColourGet : greenColourOK);
			if  (stateCode != stateCodeNot) {
				var el = document.getElementById("item" + i);
				if (el != null && el != undefined)
					el.style.backgroundColor = newColour;
				else // for debug
					alert("showColours lost style for itemState " + i + ": " + itemState[i]);
			}
		}
	}
}

function clearColours() {
	if (editMode || hideMode || showMode)
		return;
	for (var i=0; i<itemState.length; i++) {
		var stateCode = itemState[i].substr(0,1);
		if  (stateCode != stateCodeNot && stateCode != stateCodeXcluded)
			setItemToNewState(i, stateCodeNot)
	}	
	sortItems();
}

function setAllItemsYellow() {
	if (editMode || hideMode || showMode)
		return;
	for (var i=0; i<itemState.length; i++) {
		var stateCode = itemState[i].substr(0,1);
		if (stateCode != stateCodeXcluded)
			setItemToNewState(i, stateCodeGet);
	}	
	sortItems();
}

function setItemToNewState(i, stateCode) {
	var detail = itemState[i].substr(2);
	var el = $("#divMain").children()[i];
	el.style.backgroundColor = (stateCode == stateCodeOK ) ? greenColourOK
		: ((stateCode == stateCodeGet) ? yellowColourGet : whiteColourNot );
	itemState[i] = stateCode+ "~" + detail;
}

// EDIT 

function startEdit(el) { 
	hidePanels();
	$("#divEdit").css("display", "block");
	if (el != null)
		setupItemToEdit(el);
}

function setupItemToEdit(el) {
	//var caption = el.innerText;
	$("#txtEdit").val(el.innerText);
	editElement = el;
	$("#txtEdit").focus();
}

function endEdit() { 
	clearMsg();
	hidePanels();
	showMainDisplay();
	if (newItem)
		sortItems();
	editMode = false; 
	newItem = false;
}

function saveEditedItem() {
	//var newCaption = $("#txtEdit").val().trim();
	var newCaption = $("#txtEdit").val();
	if (newItem)
		itemState.push(stateCodeGet + "~" + newCaption);
	else
		useNewCaptionForItem(newCaption);
	endEdit(); 
	sortItems();
}

function useNewCaptionForItem(newCaption) {
	editElement.value = newCaption;
	var itemIndex = editElement.id.substr(4);
	var stateCode = itemState[itemIndex].substr(0,1);
	itemState[itemIndex] = stateCode + "~" + newCaption;
}

function cancelEdit() { 
	endEdit(); 
}


//  USER ACTIONS

function cc() {	
// change colour, or handle a special-mode item-request
	clearMsg();
	var el = event.srcElement;

	if (hideMode) {
		hideItem(el);
		return;
	}
	if (showMode) {
		return;
	}
	if (editMode) {
		startEdit(el);
		return;
	} 

// normal change-colour action
// update statusCode in single array item and in single LS entry
	var itemNumber = el.id.substr(4);
	setItemColour(el, itemNumber );
}

function setItemColour(el, itemIndex) {
	var stateCode = itemState[itemIndex].substr(0,1);	// was 0,1,2; then N, G, A; now X, N, G, A
	stateCode = advanceItemState(itemIndex, stateCode);
	// advance the colour
	setItemColourForNewState(el, stateCode);
}

function advanceItemState(itemIndex, stateCode) {
	var detail = itemState[itemIndex].substr(2);
	var newStateCode = (stateCode == stateCodeNot) ? stateCodeGet 
		: (( stateCode == stateCodeGet) ? stateCodeOK : stateCodeNot);
	itemState[itemIndex] = newStateCode + "~" + detail;
	return newStateCode;
}

function setItemColourForNewState(el, stateCode) {
	var newColour = (stateCode == stateCodeNot) ? whiteColourNot 
		: ((stateCode == stateCodeGet) ? yellowColourGet : greenColourOK);
	el.style.backgroundColor = newColour;
}

function hideItem(el) {
	if (el == null)
		return;
	var itemIndex = el.id.substr(4);
	var detail = itemState[itemIndex].substr(2);
	itemState[itemIndex] = stateCodeXcluded + "~" + detail ;
	showItems();
	saveToLocalStorage();
}
