class EventsController < ApplicationController
  def index
  	@events = Event.where( user_id: current_user.id )
  end

  def new
    @event = Event.new
    user = FbGraph::User.me(session[:fb_access_token]).fetch
    @friends = user.friends
  end

  def show
    if !Event.exists?(params[:id])
       redirect_to action: 'new' 
    end
    @event = Event.find(params[:id])
    @invites = Invitations.where(event_id:@event.id)
  end

  def delete
      Invitations.where(event_id:params[:id]).destroy_all
      Event.destroy(params[:id])
      redirect_to controller: 'home', action: 'index'
  end

  def edit
    @event = Event.find(params[:id])
  end

  def update
    @event = Event.find(event_params[:id])
    @event.update_attributes(event_params)
  end

  def create
  	@event = Event.new(event_params)
    @event.user = current_user
    @friends = params[:friends]
    token = session[:fb_access_token]
    if @event.save
      flash[:success] = "Event Created!"
        if !@friends.nil? then
          @friends.each do |friend|
            invite = Invitations.new
            invite.user_id = friend
            invite.event = @event
            invite.accepted = false
            invite.seen = false
            invite.created_at = Time.now
          
            invite.save
          end
        end
        redirect_to :action => 'show', :id => @event.id 
    else
      flash[:error] = "Event not created!"
      redirect_to action: 'new'
    end
  end
  private
    def event_params
        params.require(:event).permit(:user_id, :name, :start, :end, :description)
    end
end