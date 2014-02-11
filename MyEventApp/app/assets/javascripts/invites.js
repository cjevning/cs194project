function friend_selected(name, id) {	
	console.log(id);
	var invited_list = document.getElementById('invited_list');
	var new_list_item = document.createElement("LI");
	new_list_item.className = "list-group-item list-group-item-warning";
	new_list_item.innerHTML = name;
	invited_list.appendChild(new_list_item);
	
	var event_form = document.getElementById('new_event');
	var new_hidden_field = document.createElement('INPUT');
	new_hidden_field.type = "hidden";
	new_hidden_field.name = "friends[]"
	new_hidden_field.value = id;
	event_form.appendChild(new_hidden_field);
}