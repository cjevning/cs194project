function search_for_friends(id, form_field, query_url) {	
	this.element = document.getElementById(id);
    
    this.field = document.getElementById(form_field);
    this.target = query_url;
	
    this.xhr = null;
    
    var obj = this;
    this.field.onkeyup = function(event) {
        obj.textEntered(event, id);
    }
}


search_for_friends.prototype.textEntered = function(event, id) {
    var obj = this;
    if (this.xhr != null && this.xhr.readyState != 4) {
        this.xhr.abort();
    }
    this.xhr = new XMLHttpRequest();
    this.xhr.open("GET", this.target + "?query=" + this.field.value, true);
    this.xhr.onreadystatechange = xhrHandler;
    this.xhr.send(null);
    
    function xhrHandler() {
        if (obj.xhr.readyState != 4) {
            return;
        }
        if (this.status != 200) {
            return;
        } else {
            document.getElementById(id).innerHTML = obj.xhr.responseText;
        }
    }
}