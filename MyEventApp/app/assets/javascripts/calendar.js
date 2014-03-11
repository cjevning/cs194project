//Global variables
var eventActive = null;
var touchOffsetX = 0;
var touchOffsetY = 0;
var timeSlots = new Array();
var activeHour = null;
var lastViewed = null;
var eventViewMode = false;

// Some swipe detection code from http://www.javascriptkit.com/javatutors/touchevents2.shtml
var startX,
	startY,
	swipeDir,
	distX,
	distY,
	startTime,
	threshold = 150,
	restraint = 100,
	allowedTime = 300,
	elapsedTime


function loadEvents() {
	
	sendEventRequest();
}


function sendEventRequest() {
	var eventXhr = new XMLHttpRequest();
	eventXhr.onreadystatechange = eventXhrHandler;
	eventXhr.open("GET", "events");
	eventXhr.send(null);

	function eventXhrHandler() {
		if (eventXhr.readyState != 4) {
			return;
		}
		if (this.status != 200) {
			return;
		} else {
			var eventArray = JSON.parse(eventXhr.responseText);
			console.log(eventArray);
			for (var event in eventArray) {
				var eventCopy = eventArray[event];
				processEvent(eventCopy);
			}
		}
	}
}



function processEvent(event) {
	dateSeconds = event["start_in_seconds"];
	date = new Date(Number(dateSeconds)*1000);
	//if (timeSlots[date.getHours()] != null) {
	//	return;
	//}
	var hourContainer = document.getElementById('hour' + date.getUTCHours());

	eventElement = createEventElement(event);
	hourContainer.appendChild(eventElement);
	addCalTouchListeners(eventElement);
	timeSlots[date.getHours()] = eventElement;
}



function createEventElement(event) {
	panel = document.createElement("DIV");
	panel.className = "panel panel-info event_item";
	panel.id = "event_panel_" + event["id"];
	
	heading = document.createElement("DIV");
	heading.className = "panel-heading event_header";
	
	panelTitle = document.createElement("SPAN");
	panelTitle.className = "panel-title event_title";
	panelTitle.innerHTML = event["name"];
	heading.appendChild(panelTitle);
	
	invitesBadge = document.createElement("SPAN");
	invitesBadge.className = "badge pull-right invite_indicator";
	invitesBadge.innerHTML = event["num_invites"];
	heading.appendChild(invitesBadge);
	
	panelBody = document.createElement("DIV");
	panelBody.className = "panel-body event_body";
	panelBody.innerHTML = event["description"];
	
	panel.appendChild(heading);
	panel.appendChild(panelBody);
	
	//eventRecord = {eventElement: event, top: 0, left: 0};
	return panel;

}



function eventClicked(e) {
	alert("Clicked");
}




function eventAccepted(item) {
	item.parentElement.removeChild(item);
	alert("Accepted!");
}



function eventRejected(item) {
	item.parentElement.removeChild(item);
	alert("Rejected!");
}





function getSmoothedValue(fraction) {
	if (fraction >= .83666) return .7;
	else return Math.pow(fraction, 2);
}



function adjustOverlay(x) {
	// Retrieve or create overlay
	var overlay = document.getElementById('overlay');
	if (overlay == null) {
		overlay = document.createElement("DIV");
		overlay.setAttribute("id","overlay");
		overlay.style.top = window.pageYOffset + "px";
		document.body.appendChild(overlay);
	}
	
	// Compute element relative location (fraction moved to either side)
	var xFraction;
	if (x > startX) {
		xFraction = (x - startX) / (document.body.clientWidth - startX);
	} else {
		xFraction = (x - startX) / startX;
	}
	//xFraction = (x - startX) / (document.body.clientWidth - startX);
	
	// Adjust opacity
	if (xFraction > 0) {
		overlay.setAttribute("class", "overlay_neg");
		//overlay.style.backgroundImage = "-webkit-linear-gradient(left,rgba(184,0,0,0),rgba(184,0,0," + getSmoothedValue(Math.abs(xFraction)) + "))";
		overlay.style.opacity = getSmoothedValue( Math.abs(xFraction) );
	}
	if (xFraction < 0) {
		overlay.setAttribute("class", "overlay_pos");
		//overlay.style.backgroundImage = "-webkit-linear-gradient(right,rgba(0,184,0,0),rgba(0,184,0," + getSmoothedValue(Math.abs(xFraction)) + "))";
		overlay.style.opacity = getSmoothedValue( Math.abs(xFraction) );
	}
}



function handleswipe(item, dir) {
	if (dir == 'right') {
		eventRejected(item);
		return 1;
	}
	if (dir == 'left') {
		eventAccepted(item);
		return 2;
	}
	if (dir == 'up') {
		alert('up swipe');
		return null;
	}
	if (dir == 'down') {
		alert('down swipe');
		return null;
	}
}



/*
  These event handlers are called when the app is in calendar mode.
 */

function calClick(e) {
	item = e.target;
	
	eventViewMode = true;
	
	while (item.className != "panel panel-info event_item") item = item.parentElement;
	item.setAttribute("style", "z-index: 1031;");
	item.style.left = item.getBoundingClientRect().left + "px";
	item.style.top = (item.getBoundingClientRect().top + window.pageYOffset) + "px";
	
	var $elem = $(item);
	$elem.animate({top:window.pageYOffset + "px", left:"0px", maxWidth:"100%", width:"100%", height:"118%"});
	
	var $header = $(item.firstElementChild);
	$header.animate({fontSize:"24px"});
	
	var $description = $(item.children[1]);
	$description.animate({fontSize:"16px"});
	
	removeCalTouchListeners(item);
	addEventTouchListeners(item);
	
	lastViewed = item;
	
	requestEventData(item);
}



function calTouchStart(e) {
	item = e.target;
	if (item.className != "panel panel-info event_item") item = item.parentElement;
	if (eventActive != null) {
		return;
	}
	var x = e.changedTouches[0].pageX;
	var y = e.changedTouches[0].pageY;
	eventActive = item;

	//Finger offsets from top left corner of element
	touchOffsetX = x - item.getBoundingClientRect().left;
	touchOffsetY = y - item.getBoundingClientRect().top;

	// Swipe detection
	swipeDir = 'none';
	startX = x;
	startY = y;
	dist = 0;
	startTime = new Date().getTime();
	//e.preventDefault();
}



function calTouchMove(e) {
	item = e.target;
	if (item.className != "panel panel-info event_item") item = item.parentElement;
	if (eventActive == null || eventActive != item) {
		return;
	}
	var x = e.changedTouches[0].pageX;
	var y = e.changedTouches[0].pageY;
	adjustedX = x - touchOffsetX;
	adjustedY = y - touchOffsetY + window.pageYOffset; //Add vertical scroll offset

	item.style.top = adjustedY + "px";
	item.style.left = adjustedX + "px";
	//item.setAttribute("style", "top: " + adjustedY + "px; left: " + adjustedX + "px;");

	adjustOverlay(x);
	e.preventDefault();
}



function calTouchEnd(e) {
	item = e.target;
	if (item.className != "panel panel-info event_item") item = item.parentElement;

	//e.preventDefault();
	var x = e.changedTouches[0].pageX;
	var y = e.changedTouches[0].pageY;
	
	distX = x - startX;
	distY = y - startY;
	elapsedTime = new Date().getTime() - startTime;
	if (elapsedTime <= allowedTime) {  // first condition for swipe met
		if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) { // 2nd condition for horizontal swipe met
			swipeDir = (distX < 0)? 'left' : 'right' // if dist traveled is negative, it indicates left swipe
		}
		else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) { // 2nd condition for vertical swipe met
			swipeDir = (distY < 0)? 'up' : 'down' // if dist traveled is negative, it indicates up swipe
		}
	}
	
	eventActive = null;
	document.body.removeChild(document.getElementById("overlay"));
	
	if (handleswipe(item, swipeDir) != null) {
		return;
	}
	
	if (x < 20) {
		eventAccepted(item);
		return;
	}
	
	if (x > document.body.clientWidth - 20) {
		eventRejected(item);
		return;
	}
	
	item.style.top = null;
	item.style.left = null;
}



function calTouchCancel(e) {
	item = e.target;
	if (item.className != "panel panel-info event_item") item = item.parentElement;
	//item.style.position = "static";
	eventActive = null;
	item.setAttribute("style", "top: 0px; left: 0px;");

	//e.preventDefault();
	//var orig = e.originalEvent;
	//var x = orig.changedTouches[0].pageX;
	//var y = orig.changedTouches[0].pageY;
}


function addCalTouchListeners(item) {
	item.addEventListener('click', calClick);
	item.addEventListener('touchstart', calTouchStart);
	item.addEventListener('touchmove', calTouchMove);
	item.addEventListener('touchend', calTouchEnd);
	item.addEventListener('touchcancel', calTouchCancel);
}


function removeCalTouchListeners(item) {
	item.removeEventListener('click', calClick);
	item.removeEventListener('touchstart', calTouchStart);
	item.removeEventListener('touchmove', calTouchMove);
	item.removeEventListener('touchend', calTouchEnd);
	item.removeEventListener('touchcancel', calTouchCancel);
}



function restoreLastViewed() {
	lastViewed.setAttribute("style", "z-index: 11;");
}




function requestEventData(eventElement) {
	var eventID = eventElement.id.split("_")[2];
	var eventDetailsXhr = new XMLHttpRequest();
	eventDetailsXhr.onreadystatechange = eventDetailsXhrHandler;
	eventDetailsXhr.open("GET", "event_details?id=" + eventID);
	eventDetailsXhr.send(null);
	
	function eventDetailsXhrHandler() {
		if (eventDetailsXhr.readyState != 4) {
			return;
		}
		if (this.status != 200) {
			return;
		} else {
			if (eventViewMode == false) return;
			var eventDetails = JSON.parse(eventDetailsXhr.responseText);
			processEventDetails(eventDetails);
		}
	}
}



function processEventDetails(eventDetails) {
	console.log(eventDetails);
	var invitesArray = eventDetails["invitations"];
	listWrapper = document.createElement("DIV");
	listWrapper.className = "list-group";
	for (var invite in invitesArray) {
		var inviteCopy = invitesArray[invite];
		
		wrapper = document.createElement("DIV");
		if (inviteCopy["accepted"] == true) {
			wrapper.className = "list-group-item list-group-item-success";
		} else if (inviteCopy["seen"] == true) {
			wrapper.className = "list-group-item list-group-item-danger";
		} else {
			wrapper.className = "list-group-item list-group-item-warning";
		}
		
		circleDiv = document.createElement("DIV");
		circleDiv.className = "profile_circle";
		circleDiv.style.background = "url(" + inviteCopy["picture_url"] + ") no-repeat";
		wrapper.appendChild(circleDiv);
		
		nameLabel = document.createElement("P");
		nameLabel.className = "profile_circle_label";
		nameLabel.innerHTML = inviteCopy["name"];
		wrapper.appendChild(nameLabel);
		
		listWrapper.appendChild(wrapper);
	}
	lastViewed.children[1].appendChild(listWrapper);
}




function eventClick(e) {
	var item = e.target;
	
	eventViewMode = false;
	
	while (item.className != "panel panel-info event_item") item = item.parentElement;
	//item.style.left = item.getBoundingClientRect().left + "px";
	//item.style.top = (item.getBoundingClientRect().top + window.pageYOffset) + "px";
	
	var $elem = $(item);
	$elem.animate({top:(item.parentElement.getBoundingClientRect().top + window.pageYOffset) + "px",
			left:item.parentElement.getBoundingClientRect().left + "px",
			maxWidth:"82%",
			height:"70px"}, "fast", "linear");
	
	var $header = $(item.firstElementChild);
	$header.animate({fontSize:"14px"}, "fast", "linear");
	
	var $description = $(item.children[1]);
	$description.animate({fontSize:"14px"}, "fast", "linear", restoreLastViewed);
	
	while (item.children[1].childNodes.length > 1) {
		item.children[1].removeChild(item.children[1].lastChild);
	}
		
	removeEventTouchListeners(item);
	addCalTouchListeners(item);
}




/*
  These event handlers are called when an event is being viewed in detail.
 */

function eventTouchStart(e) {
	//e.preventDefault();
}


function eventTouchMove(e) {
	e.preventDefault();
}


function addEventTouchListeners(item) {
	item.addEventListener('click', eventClick);
	item.addEventListener('touchstart', eventTouchStart);
	item.addEventListener('touchmove', eventTouchMove);
	//item.addEventListener('touchend', eventTouchEnd);
	//item.addEventListener('touchcancel', eventTouchCancel);
}


function removeEventTouchListeners(item) {
	item.removeEventListener('click', eventClick);
	item.removeEventListener('touchstart', eventTouchStart);
	item.removeEventListener('touchmove', eventTouchMove);
	//item.removeEventListener('touchend', eventTouchEnd);
	//item.removeEventListener('touchcancel', eventTouchCancel);
}