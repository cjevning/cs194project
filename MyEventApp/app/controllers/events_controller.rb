class EventsController < ApplicationController
  def index
  	@events = Event.where( user: current_user )
  end
  
  def get_tag
      words    = params[:words]
      final_words = []
      words.each do |word|
          print word
          if (!FrequentWords.exists?(:word => word)  and
              EnglishWords.exists?(:word => word)) or
              /[[:upper:]]/.match(word[0,1]) then
              final_words.append(word.downcase)
          end
      end
      render :json => final_words.uniq.to_json
  end

  def new
    @event = Event.new
    user = FbGraph::User.me(session[:fb_access_token]).fetch
    current  = Date.current()
    @days    = {"Today" => current, "Tomorrow" => current.tomorrow()}
    current  = current.tomorrow()
    
    for i in (0..60)
        current = current.tomorrow()
        @days[current.to_formatted_s(:long)] = current
    end
    
    @friends = user.friends
    @friends = @friends.sort_by { |user| [user.name] }
  end
  
  def with_format(format, &block)
      old_formats = formats
      self.formats = [format]
      block.call
      self.formats = old_formats
      nil
  end
  
  
  def new_part
      @event = Event.new
      user = FbGraph::User.me(session[:fb_access_token]).fetch
      current  = Date.current()
      @days    = {"Today" => current, "Tomorrow" => current.tomorrow()}
      current  = current.tomorrow()
      
      for i in (0..60)
          current = current.tomorrow()
          @days[current.to_formatted_s(:long)] = current
      end
      
      @friends = user.friends
      @friends = @friends.sort_by { |user| [user.name] }
      
      newHash = Hash.new
      with_format :html do
          newHash["content"] = render_to_string partial: "new_part", locals: {event: @event, days: @days, friends: @friends}
      end
      newHash["data"] = @friends
      render :json => newHash
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
    @friends = nil
    if !params[:friendIDs].nil?
        @friends = JSON.parse params[:friendIDs]
    end
    token = session[:fb_access_token]
    if @event.save
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
            invite.rejected = false
            invite.maybe = false
            invite.created_at = Time.now
            invite.inviter_id = current_user.id
            invite.save
          end
        end
        eventHash = hash_for_event(@event)
        eventHash["status"] = "owner";
        render json: eventHash
        #redirect_to :action => 'show', :id => @event.id
    else
      flash[:error] = "Event not created!"
      redirect_to action: 'new'
    end
  end
  
  
  def hash_for_event(evt)
      eventHash = Hash.new
      eventHash["name"] = evt.name
      eventHash["start"] = evt.start
      eventHash["end"] = evt.end
      eventHash["description"] = evt.description
      eventHash["start_in_seconds"] = evt.start.to_i
      eventHash["id"] = evt.id
      token = session[:fb_access_token]
      owner = FbGraph::User.fetch(evt.user.uid, access_token: token)
      eventHash["owner_pic"] = owner.picture
      eventHash["owner_name"] = owner.name
      
      invites = Invitations.where(event_id:evt.id)
      eventHash["num_invites"] = invites.length
      invitesArray = Array.new
      invites.each do |invite|
          inviteHash = Hash.new
          inviteHash["accepted"] = invite.accepted
          inviteHash["seen"] = invite.seen
          inviteHash["maybe"] = invite.maybe
          inviteHash["rejected"] = invite.rejected
          inviteHash["name"] = invite.user.name
          if invite.user == current_user
            inviteHash["self"] = true
          else
            inviteHash["self"] = false
          end
          inviteFriend = FbGraph::User.fetch(invite.user.uid, access_token: session[:fb_access_token])
          inviteHash["picture_url"] = inviteFriend.picture
          invitesArray.push(inviteHash)
      end
      eventHash["invitations"] = invitesArray

      return eventHash
  end


  private
    def event_params
        params.require(:event).permit(:user_id, :name, :start, :end, :description, :public, :allows_fof, :lat, :lng)
    end
end