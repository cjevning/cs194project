class UserController < ApplicationController
	before_filter :authenticate_user!
    
    def profile
        @user = FbGraph::User.me(session[:fb_access_token]).fetch
        #puts @user.inspect
    end
    
    
    def search
        user = FbGraph::User.me(session[:fb_access_token]).fetch
        @matching_friends = Array.new
        if !params[:query].empty? then
            @query = params[:query].to_s.downcase
            @matching_friends = user.friends.select { |friend| friend.name.downcase.include? @query}
            #user.friends.each do |friend|
            #    if friend.name.downcase.include? @query then
            #        if !@matching_friends.include? friend then
            #            @matching_friends.push(friend)
            #        end
            #    end
            #end
        end
        
        render :partial => "search_thumbnails", :layout => false
    end
    
end
