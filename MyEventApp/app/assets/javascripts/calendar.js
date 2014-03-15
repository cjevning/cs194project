//Global variables
var eventActive = null;
var touchOffsetX = 0;
var touchOffsetY = 0;
var timeSlots = new Array(24);
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


function findEventRecordById(id)
{
	for (var i = 0; i < timeSlots.length; i++) {
		if (timeSlots[i] != null) {
			if (timeSlots[i].id == id) return timeSlots[i];
		}
	}
}


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



function sendEventAcceptance(id) {
	var acceptXhr = new XMLHttpRequest();
	acceptXhr.onreadystatechange = acceptXhrHandler;
	acceptXhr.open("GET", "accept?id=" + id);
	acceptXhr.send(null);

	function acceptXhrHandler() {
		if (acceptXhr.readyState != 4) {
			return;
		}
		if (this.status != 200) {
			return;
		} else {
			console.log(acceptXhr.responseText);
		}
	}
}



function processEvent(event) {
	dateSeconds = event["start_in_seconds"];
	date = new Date(Number(dateSeconds)*1000);
	if (timeSlots[date.getHours()] != null) {
		return;
	}
	var hourContainer = document.getElementById('hour' + date.getUTCHours());

	eventElement = createEventElement(event);
	hourContainer.appendChild(eventElement);
	addCalTouchListeners(eventElement, event["status"]);
	eventRecord = {id: event["id"], element: eventElement, object: event, timeSlot: date.getHours()};
	timeSlots[date.getHours()] = eventRecord;
}



function createEventElement(event) {
	panel = document.createElement("DIV");
	if (event["status"] == "owner" || event["status"] == "invited_accepted") {
		panel.className = "panel panel-primary event_item";
	} else {
		panel.className = "panel panel-info event_item";
	}
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
	
	panelBody = renderPanelBody(event);
	
	panel.appendChild(heading);
	panel.appendChild(panelBody);
	
	//eventRecord = {eventElement: event, top: 0, left: 0};
	return panel;

}



function renderPanelBody(event) {
	panelBody = document.createElement("DIV");
	panelBody.className = "panel-body event_body";
	panelBody.id = "panel_body_" + event["id"];
	panelBody.innerHTML = "<div class='panel_body_text'>" + event["description"] + "</div>";
	
	if (event["status"] != "owner") {
		circleDiv = document.createElement("DIV");
		circleDiv.className = "owner_thumb";
		circleDiv.style.background = "url(" + event["owner_pic"] + ") no-repeat";
		circleDiv.style.backgroundSize = "100% auto";
		panelBody.appendChild(circleDiv);
	}
	
	return panelBody;
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
		acceptEvent(item.id.split("_")[2]);
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
	
	while (item.className.indexOf("event_item") == -1) item = item.parentElement;
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
	
	//requestEventData(item);
	eventID = item.id.split("_")[2];
	eventRecord = findEventRecordById(eventID);
	processEventDetails(eventRecord.element, eventRecord.object);
}



function calTouchStart(e) {
	item = e.target;
	while (item.className.indexOf("event_item") == -1) item = item.parentElement;
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
	while (item.className.indexOf("event_item") == -1) item = item.parentElement;
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
	while (item.className.indexOf("event_item") == -1) item = item.parentElement;

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
		acceptEvent(item.id.split("_")[2]);
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
	while (item.className.indexOf("event_item") == -1) item = item.parentElement;
	//item.style.position = "static";
	eventActive = null;
	item.setAttribute("style", "top: 0px; left: 0px;");

	//e.preventDefault();
	//var orig = e.originalEvent;
	//var x = orig.changedTouches[0].pageX;
	//var y = orig.changedTouches[0].pageY;
}


function addCalTouchListeners(item, status) {
	item.addEventListener('click', calClick);
	if (status != "owner") {
		item.addEventListener('touchstart', calTouchStart);
		item.addEventListener('touchmove', calTouchMove);
		item.addEventListener('touchend', calTouchEnd);
		item.addEventListener('touchcancel', calTouchCancel);
	}
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


function acceptEvent(e) {
	console.log("Accept!");
	console.log(e);
	
	sendEventAcceptance(e);
	
	if (eventViewMode) {
		// Do something flashy
		
		// Accept on server
		
	} else {
		// Overlay flash?
		
		// Accept on server
	}
}


function rejectEvent(e) {
	console.log("Reject!");
	console.log(e);
}


function maybeEvent(e) {
	console.log("Maybe!");
	console.log(e);
}



function getDetailButtonGroup(id) {
	wrapper = document.createElement("DIV");
	wrapper.className = "btn-group";
	
	attend = document.createElement("button");
	attend.className = "btn btn-success";
	attend.type = "button";
	attend.innerHTML = "Attend";
	attend.onclick = function () { acceptEvent(id) };
	wrapper.appendChild(attend);
	
	maybe = document.createElement("button");
	maybe.className = "btn btn-warning";
	maybe.type = "button";
	maybe.innerHTML = "Maybe";
	maybe.onclick = function () { maybeEvent(id) };
	wrapper.appendChild(maybe);
	
	reject = document.createElement("button");
	reject.className = "btn btn-danger";
	reject.type = "button";
	reject.innerHTML = "Reject";
	reject.onclick = function () { rejectEvent(id) };
	wrapper.appendChild(reject);
	
	return wrapper
}



function processEventDetails(eventElement, eventDetails) {
	panelBody = document.getElementById("panel_body_" + eventDetails["id"]);
	panelBodyParent = panelBody.parentNode;
	panelBody.parentNode.removeChild(panelBody);
	
	eventBody = renderEventBody(eventDetails);
	panelBodyParent.appendChild(eventBody);
	
}


function renderEventBody(event) {
	eventBody = document.createElement("DIV");
	eventBody.className = "event_detail_body";
	eventBody.id = "event_body_" + event["id"];
	
	header = document.createElement("DIV");
	header.className = "body_header";
	
	if (event["status"] != "owner") {
		hostWrapper = document.createElement("DIV");
		hostWrapper.className = "well well-sm featured_person_wrapper";
		
		// Add Host label
		hostLabel = document.createElement("DIV");
		hostLabel.id = "host_label";
		hostLabel.innerHTML = event["owner_name"];
		hostWrapper.appendChild(hostLabel);
		
		// Add Host picture
		circleDiv = document.createElement("DIV");
		circleDiv.className = "owner_profile_circle";
		circleDiv.style.background = "url(" + event["owner_pic"] + ") no-repeat";
		circleDiv.style.backgroundSize = "100% auto";
		hostWrapper.appendChild(circleDiv);
		header.appendChild(hostWrapper);
	}
	
	description = document.createElement("DIV");
	description.className = "event_description_text";
	description.innerHTML = "<p>" + event["description"] + "</p>";
	header.appendChild(description);
	
	eventBody.appendChild(header);
	
	// Add action buttons
	detailButtonGroup = getDetailButtonGroup(event["id"]);
	detailButtonGroup.id = "detail_btn_group";
	eventBody.appendChild(detailButtonGroup);
	
	var invitesArray = event["invitations"];
	listWrapper = document.createElement("DIV");
	listWrapper.className = "list-group";
	listWrapper.id = "invites_list";
	
	// Add invitations
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
	eventBody.appendChild(listWrapper);
	
	return eventBody;
}



function eventClick(e) {
	var item = e.target;
	console.log(item);
	
	eventViewMode = false;
	
	while (item.className.indexOf("event_item") == -1) item = item.parentElement;
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
	
	
	eventID = item.id.split("_")[2];
	eventRecord = findEventRecordById(eventID);
	restorePanelBody(eventRecord.element, eventRecord.object);
	
		
	removeEventTouchListeners(item);
	addCalTouchListeners(item);
}



function restorePanelBody(eventElement, eventDetails) {
	eventBody = document.getElementById("event_body_" + eventDetails["id"]);
	var eventBodyParent = null;
	if (eventBody != null) {
		eventBodyParent = eventBody.parentNode;
		eventBodyParent.removeChild(eventBody);
	}
	if (eventBodyParent != null) {
		panelBody = renderPanelBody(eventDetails);
		eventBodyParent.appendChild(panelBody);
	}
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