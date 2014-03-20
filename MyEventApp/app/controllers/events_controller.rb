class EventsController < ApplicationController
  def index
  	@events = Event.where( user: current_user )
  end

  def new
    #check here to see if they have an event that has expired
    #get current date
    #@event1 = Event.where(user: current_user, end < DateTime.now, rated: false).order("end").take
    #if(!event.rated?)
     # redirect_to action: 'rate'
   # end
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

  def attendance
    @event = Event.find(params[:id])
    @invites = Invitations.where(event_id:@event.id)  
  end

  def updateAttendance
    redirect_to controller: 'home', action: 'index'
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
            fInvite = User.find_by(uid: friend)
            invite = Invitations.new
            if fInvite == nil
              matchingFriend = FbGraph::User.fetch(friend, access_token: token)
              fInvite = User.new(:uid=>matchingFriend.identifier, :name=>matchingFriend.name, :email=>matchingFriend.email)
              fInvite.password = "hippopotamus72"
              fInvite.email = "crocodile" + matchingFriend.identifier + "@unregistered.com"
              fInvite.save!
            end
            invite.user = fInvite
            invite.event = @event
            invite.accepted = false
            invite.seen = false
            invite.created_at = Time.now
            invite.save
          end
        end
        flash[:notice] = "Event created!"
        redirect_to :action => 'show', :id => @event.id 
    else
      flash[:error] = "Event not created!"
      redirect_to action: 'new'
    end
  end
  private
    def event_params
        params.require(:event).permit(:user_id, :name, :start, :end, :description, :public, :allows_fof)
    end
end