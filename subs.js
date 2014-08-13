
// LOCAL STORAGE / DATA

function checkForLocalStorage() {
	hasLS = supportsLocalStorage();
	if (hasLS)
		canUseLS = canSaveToLocalStorage();
}

function supportsLocalStorage() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (ex) {
		return false;
	}
}

function canSaveToLocalStorage() {
	try {
		localStorage["test"] = "testing";
		return true;
	}
	catch (ex) {
		return false;
	}
}

function saveToLocalStorage() {
	if (!canUseLS)
		return;

// for multiple lists, use listNumber 
	var itemCount  = itemState.length;
	for (var i=0; i<itemCount ; i++) {
		var itemKey = listNumber + "i" + i;
		var itemVal = itemState[i];
		localStorage[itemKey] = itemVal ;	
	}
	localStorage["ItemCount" + listNumber ] = itemCount ;
}

function loadFromLS() {
	var itemCount = 0;
	var n = localStorage["ItemCount" + listNumber ];
	if (n>0)
		itemCount = parseInt(n, 10);
	else
		itemCount = 32;		// temp
	itemState.length = 0;
	for (var i=0; i<itemCount ; i++) {
		var key = listNumber + "i" + i;
		var item = localStorage[key];
		itemState.push(item); 
	}
}

function loadFromFile() {
	var itemCount = notesArray.length;
	itemState.length = 0;
	for (var i=0; i<itemCount ; i++) {
		itemState.push(stateCodeNot + "~" + notesArray[i]); 
	}
	say("Loaded with default items");
}

function loadData() {
// If LS available & accessible { if LS used then read from LS else save to LS } else bypass 
//	read localStorage (statusCode~detail) if available else from data.js (detail) - to array [0~detail]
	if (hasLS) {
		canUseLS = canSaveToLocalStorage();
		if (canUseLS ) {
			dataInLS = itemsAvailable();
			if (dataInLS ) {
				loadFromLS();
				dataLoaded = true;
			} else {
				loadFromFile();		// from items array to itemState array
				dataLoaded = true;
				saveToLocalStorage();
				say("saved to LS");
			}
		} else { say("LS not accessible");	}
	} else { alert("LS not supported");	}

	if (!dataLoaded)	// for local testing
		loadFromFile();
}

function itemsAvailable() {
	try {		
		var firstKey = listNumber + "i1";
		if (localStorage.getItem(firstKey ) === null)
			return false;
	}
	catch(ex) {
		return false;
	}
	return true;
}

function setDataArraysToBeUsed() {
	if (canUseLS) {
		subjectName = localStorage["subject"];
		dataArrayName = localStorage["array"];
	} else {
		var locationString = location.toString();
		var n1 = locationString.indexOf("?s=");
		var n2 = locationString.indexOf("&a=");
		if (n1 < 1) {
			// for testing stand-alone
			subjectName = "TEST";
			dataArrayName = "da1";
		} else {	
			subjectName = locationString.substring(n1+3, n2);
			dataArrayName = locationString.substring(n2+3);
		}
	}
   	switch(dataArrayName) {
	   case "da1": notesArray = da1; listNumber = 1; break;
	   case "da2": notesArray = da2; listNumber = 2; break;
	   case "da3": notesArray = da3; listNumber = 3; break;
	   case "da4": notesArray = da4; listNumber = 4; break; 
	   case "da5": notesArray = da5; listNumber = 5; break;
	   case "da6": notesArray = da6; listNumber = 6; break;
	   case "da7": notesArray = da7; listNumber = 7; break;
	   case "da8": notesArray = da8; listNumber = 8; break;
	   case "da9": notesArray = da9; listNumber = 9; break;
	   default: alert("unexpected da: " + dataArrayName);
	}
}

// MESSAGES

function clearMsg() 	{ say("&nbsp;"); }

function say(msg) 	{ $("#lblMsg").html(msg); }

function sayMore(msg) { 
	var s = $("#lblMsg").text();
	s += ", " + msg
	$("#lblMsg").text(s); 
}

function notYet() { alert("Not Yet coded"); }

function sayArrayInfo() {
	var itemCount = itemState.length;
	var info = "";
	for (var i=0; i<itemCount ; i++) {
		info +=i +  itemState[i].substr(0,8).replace("~", ".") + "| ";
	}
	say(info);
}
