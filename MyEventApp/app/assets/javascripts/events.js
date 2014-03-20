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

window.onload = function(){ 
	document.getElementById('event_description').onkeyup = function() { check_tag($("#event_description").val()); };
	document.getElementById('tags').onkeyup = function() { check_tag($("#tags").val()); };

	$("#selector button").click(function(){
		$("#selector button").addClass('active').not(this).removeClass('active');
		$("#form_privacy").val(this.value);
	});
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
			url:  'get_tag',
			data: {words:new_words} ,
			type: 'POST',
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