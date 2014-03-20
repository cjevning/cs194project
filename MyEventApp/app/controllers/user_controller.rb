class UserController < ApplicationController
	before_filter :authenticate_user!
    
    def profile
        @user = current_user
        #puts @user.inspect
    end

    def update_score
        invitations1 = Invitations.where(user: current_user, accepted: true, attended: true)
        count1 = invitations1.count
        invitations2 = Invitations.where(user: current_user, accepted: true)
        count2 = invitations2.count
        score = (count1 / count2) * 100
        user.score = score 
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
