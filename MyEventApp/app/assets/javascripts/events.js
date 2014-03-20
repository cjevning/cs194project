var friends=[];


function continue_dialog(){
    $("#friend_invite_dialog").stop().show();
    $("#event_creation_dialog").stop().animate({width:'0%'}, 1000);
    $("#friend_invite_dialog").stop().animate({width: '100%'}, 1000);
    $("#event_creation_dialog").hide();

}

function back_dialog(){
    $("#event_creation_dialog").stop().show();
    $("#friend_invite_dialog").stop().animate({width:'0%'}, 1000);
    $("#event_creation_dialog").stop().animate({width:'100%'},1000);
    $("#friend_invite_dialog").hide();
}


var chosen_friends = [];
function delete_friend(elem){
	$(elem).parent().remove();
	chosen_friends.remove(chosen_friends.indexOf(elem.value));
	$("#friendIDs").val(JSON.stringify(chosen_friends));
}
function add_friend(friend){
    if (chosen_friends.indexOf(friend.identifier) >= 0) return;
	chosen_friends.push(friend.identifier);
	$("#friendIDs").val(JSON.stringify(chosen_friends));
}

function loadFriends(json_friends) {
	friends = json_friends;
	
	$("#selector button").click(function(){
		$("#selector button").addClass('active').not(this).removeClass('active');
		if(this.value.localeCompare("public")){
			$("#form_privacy").val("1");
		} else {
			$("#form_privacy").val("0");
		}
	});

	var friend_names = [];
	
	for(var i = 0; i < friends.length; ++i){
		friend_names.push(friends[i].name);
	}

	function find_friend(name){
		return friends[friend_names.indexOf(name)];
	}

	$("#friend_searcher").autocomplete({ 
		source : friend_names,
	    focus: function( event, ui ) {
	        return false;
	    },
      	select: function( event, ui ) {
      		var friend = find_friend(ui.item.label);
      		add_friend(friend);
        	$("#friend_searcher" ).val("");
			$("#friend_list").append($("<li class='pull-left list-group-item'>")
				.append(friend.name + "<button value='" + friend.identifier + "' onclick='delete_friend(this);return false'> "+
						"<span class='glyphicon glyphicon-remove pull-right'></span></button>")
				.appendTo($("#friend_list"))); 
        	return false;
      	} 
	}).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
		var friend = find_friend(item.label);
	    return $( "<li class='list-group-item'>" )
        	.append( "<a>" + friend.name + "<br></a>" )
        	.appendTo( ul );
    };

    $('.ui-helper-hidden-accessible').remove();

    document.getElementById("event_description").onkeydown = function(){check_tag($("#event_description").val())};

}

//Removes modifiers to root words
function scrub_word(word){
	word = word.replace(/[^\w]+$/,"");
	word = word.replace(/^[^\w]+/,"");
	word = word.replace(/'s$/,"");
	word = word.replace(/ing$/,"");
	return word;
}
function check_tag(value){
	if(value == null || value.length == 0){
		$("#tags").empty();
		return;
	}

	 if(value[value.length-1] == " ")
		return;

	var words = value.split(" ");
	if(words.length > 0){	
		var new_words = [];
		while(words.length > 0){
			var word = words.pop();
			if(word.length != 0)
				new_words.push(scrub_word(word));
		}
		$.ajax({
			url:  '/events/get_tag',
			data: {words:new_words} ,
			type: 'GET',
			success:function(result){
				if(result != ""){
					$("#tags").empty();
					add_tags(result);
				}
			}
		});
	}
}

var choosen_tags  = [];
var removed_elems = []
function untag(tag){
	removed_elems.push(tag);
	$("#"+tag).remove();
	choosen_tags.splice(choosen_tags.indexOf(tag),1);
	$("#form_tags").val(JSON.stringify(choosen_tags));
}

function add_tags(tags){
	choosen_tags = tags;
	$("#form_tags").val(JSON.stringify(choosen_tags));
	for(var i = 0; i < tags.length; ++i){
		var tag = tags[i];
		if(removed_elems.indexOf(tag) >= 0)
			continue;
		var button       = document.createElement('button');
		button.onclick   = function(event) { event.preventDefault(); }
		button.className = "btn btn-default";
		button.id        = tag;
		button.innerHTML = tag + "<button class='btn btn-default glyphicon glyphicon-remove'"+
								 " onclick='untag(\"" + tag + "\");'></span>"; 
		$("#tags").append(button);	
	}
}