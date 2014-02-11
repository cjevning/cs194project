class UserController < ApplicationController
	before_filter :authenticate_user!
    
    def profile
        @user = FbGraph::User.me(session[:fb_access_token]).fetch
        #puts @user.inspect
    end
end
