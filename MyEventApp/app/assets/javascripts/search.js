
var first_seen = false;

function continue_dialog(){
    if(!first_seen){
        $("#event_creation_dialog").animate({left: '350px', right:'-350px'});
    } else {
        $("#event_creation_dialog").animate({left: '350px'});
    }
    $("#event_creation_dialog").hide();
    
    $("#friend_invite_dialog").show();

    if(!first_seen){
        $("#friend_invite_dialog").animate({left: '350px', right:'-350px' });
        first_seen = true;
    } else {
        $("#friend_invite_dialog").animate({left: '350px', right:'-350px' });
    }
}

function back_dialog(){
    $("#friend_invite_dialog").animate({right: '350px', left:'-350px' });
    $("#friend_invite_dialog").hide();
    $("#event_creation_dialog").show();
    $("#event_creation_dialog").animate({right: '350px', left:'-350px' });
}
/*
 * We can use this code to create any searchable list
 */
function searchable_list(list_id, search_id, elem){

    this.list_id   = list_id;
    this.search_id = search_id;
    this.elem      = elem;
    var obj        = this;

    $('#'+this.search_id).on('click','.'+this.elem,function(event){
        obj.item_click(this);
    });

    $('#'+this.search_id).change( function(){
        console.log($(this));
        var value = $("#"+$(this).search_id).value;
        //reset list of items to default
        if(value.length == 0){
            var items = document.getElementsByClassName(this.elem);
            for(var i = 0; i < items.length; ++i){
                item = items[i];
                item.animate({top:"0px", bottom:"0px"});
            }
        } else {
            obj.search_for($("#"+$(this).search_id).value);            
        }
    });
}

searchable_list.prototype.item_click = function(clicked_li){
    console.log(clicked_li);
    if(clicked_li.className == this.elem + ' list-group-item list-group-item-success'){
        clicked_li.className = this.elem + ' list-group-item';
    } else {
        clicked_li.className = this.elem + ' list-group-item list-group-item-success';
    }

}

searchable_list.prototype.search_for = function(value){
    var items  = document.getElementsByClassName(this.elem);
    for(var i = 0; i < items.length; ++i){
        item = items[i];
        if(item.innerHTML.indexOf(value)){
            item.animate({top: "+=50"}, 5000, function() { });
        } else {
            item.animate({bottom: "+=50"}, 5000, function() { });
        }    
    }
}