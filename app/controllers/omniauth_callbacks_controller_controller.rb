class User::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def facebook
    # You need to implement the method below in your model (e.g. app/models/user.rb)
    auth = request.env["omniauth.auth"]
    @user = User.find_for_facebook_oauth(auth)
    
    if @user.persisted?
      token = auth['credentials']['token']
      session[:fb_access_token] = token
      session[:fbgraph_uid] = auth['uid']
      sign_in_and_redirect @user, :event => :authentication #this will throw if @user is not activated
      set_flash_message(:notice, :success, :kind => "Facebook") if is_navigational_format?
    else
      session["devise.facebook_data"] = request.env["omniauth.auth"]
      redirect_to sign_in
    end
  end
end