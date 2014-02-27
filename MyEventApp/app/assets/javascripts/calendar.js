//Global variables
var eventActive = null;
var touchOffsetX = 0;
var touchOffsetY = 0;


function loadEvents() {
	var dragContainer = document.getElementById('drag_container');
	
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
				console.log(eventCopy);
				processEvent(eventCopy);
			}
		}
	}
}



function processEvent(event) {
	var dragContainer = document.getElementById('drag_container');

	eventOne = createEventElement(event);
	dragContainer.appendChild(eventOne);
	addListeners(eventOne);
}



function createEventElement(event) {
	console.log(event);
	panel = document.createElement("DIV");
	panel.className = "panel panel-info event_item";
	heading = document.createElement("DIV");
	heading.className = "panel-heading";
	heading.innerHTML = event["name"];
	panelBody = document.createElement("DIV");
	panelBody.className = "panel-body";
	panelBody.innerHTML = event["description"];
	
	panel.appendChild(heading);
	panel.appendChild(panelBody);
	
	//eventRecord = {eventElement: event, top: 0, left: 0};
	return panel;

}



function addListeners(item) {
	console.log("add listeners");
		
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
		
		item.setAttribute("style", "top: " + adjustedY + "px; left: " + adjustedX + "px;");
	});
	
	
	item.addEventListener("touchend", function(e) {
		eventActive = null;
		//e.preventDefault();
		var orig = e.originalEvent;
		var x = orig.changedTouches[0].pageX;
		var y = orig.changedTouches[0].pageY;
	});
	
	
	item.addEventListener("touchcancel", function(e) {
		eventActive = null;

		//e.preventDefault();
		var orig = e.originalEvent;
		var x = orig.changedTouches[0].pageX;
		var y = orig.changedTouches[0].pageY;
	});
	
	
	
}