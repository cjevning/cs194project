class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  layout :layout
  
  private
  
  def layout
      # only turn it off for login pages:
      is_a?(Devise::SessionsController) ? false : "application"
  end
  
  
  protect_from_forgery with: :exception
  before_filter :authenticate_user!
  def facebook_user
    (session[:fb_access_token] && session[:fb_user_uid]) ? FBGraph::Client.new(:client_id => '248143532030294', 
    		:secret_id => 'de242b28aaf2bb33ae7118bdd8ded590', :token => session[:fb_access_token]).selection.me.info! : nil
  end
end
