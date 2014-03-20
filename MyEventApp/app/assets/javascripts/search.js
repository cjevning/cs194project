choosen_friends = [];

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
    var index = choosen_friends.indexOf(clicked_li.value);

    //the user is removing the item from the list
    if( index >= 0 ){
        clicked_li.className = this.elem + ' list-group-item';
        choosen_friends.splice(index,1);       
    //The user is adding the item to the list
    } else {
        clicked_li.className = this.elem + ' list-group-item list-group-item-success';
        choosen_friends.append[clicked_li.value];
    }
    $("#friends").value = JSON.stringify(choosen_friends);
    console.log(choosen_friends);
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