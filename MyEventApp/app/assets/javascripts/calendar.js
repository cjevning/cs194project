//Global variables
var eventActive = null;
var touchOffsetX = 0;
var touchOffsetY = 0;
var timeSlots = new Array();


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
	if (timeSlots[date.getHours()] != null) {
		return;
	}
	var hourContainer = document.getElementById('hour' + date.getHours());

	eventElement = createEventElement(event);
	hourContainer.appendChild(eventElement);
	addListeners(eventElement);
	timeSlots[date.getHours()] = eventElement;
}



function createEventElement(event) {
	panel = document.createElement("DIV");
	panel.className = "panel panel-info event_item";
	panel.id 
	heading = document.createElement("DIV");
	heading.className = "panel-heading event_header";
	heading.innerHTML = event["name"];
	panelBody = document.createElement("DIV");
	panelBody.className = "panel-body event_body";
	panelBody.innerHTML = event["description"];
	
	panel.appendChild(heading);
	panel.appendChild(panelBody);
	
	//eventRecord = {eventElement: event, top: 0, left: 0};
	return panel;

}



function addListeners(item) {
		
	item.addEventListener("touchstart", function(e) {
		if (eventActive != null) {
			return;
		}
		e.preventDefault();
		var x = e.changedTouches[0].pageX;
		var y = e.changedTouches[0].pageY;
		eventActive = item;
		
		//Finger offsets from top left corner of element
		touchOffsetX = x - item.getBoundingClientRect().left;
		touchOffsetY = y - item.getBoundingClientRect().top;
		
	});
	
	item.addEventListener("touchmove", function(e) {
		if (eventActive == null || eventActive != item) {
			return;
		}
		//e.preventDefault();
		var x = e.changedTouches[0].pageX;
		var y = e.changedTouches[0].pageY;
		adjustedX = x - touchOffsetX;
		adjustedY = y - touchOffsetY + window.pageYOffset; //Add vertical scroll offset
		
		item.style.top = adjustedY + "px";
		item.style.left = adjustedX + "px";
		//item.setAttribute("style", "top: " + adjustedY + "px; left: " + adjustedX + "px;");
	});
	
	
	item.addEventListener("touchend", function(e) {
		item.style.top = null;
		item.style.left = null;
		//item.style.position = "static";
		eventActive = null;
		
		//e.preventDefault();
		//var orig = e.originalEvent;
		//var x = orig.changedTouches[0].pageX;
		//var y = orig.changedTouches[0].pageY;		

	});
	
	
	item.addEventListener("touchcancel", function(e) {
		item.style.position = "static";
		eventActive = null;
		item.setAttribute("style", "top: 0px; left: 0px;");

		//e.preventDefault();
		//var orig = e.originalEvent;
		//var x = orig.changedTouches[0].pageX;
		//var y = orig.changedTouches[0].pageY;
				
	});
	
}