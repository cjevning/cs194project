class CalendarController < ApplicationController
    def day
      
    end
    
    
    def events
        @eventList = Array.new
        current_user.events.each do |event|
           eventHash = Hash.new
           eventHash["name"] = event.name
           eventHash["start"] = event.start
           eventHash["end"] = event.end
           eventHash["description"] = event.description
           eventHash["start_in_seconds"] = event.start.to_i
           eventHash["id"] = event.id
           invites = Invitations.where(event_id:event.id)
           eventHash["num_invites"] = invites.length
           @eventList.push(eventHash)
        end

        render json: @eventList
    end

    def event_details
        eventHash = Hash.new
        @event = Event.find(params[:id])
        eventHash["name"] = @event.name
        eventHash["start"] = @event.start
        eventHash["end"] = @event.end
        eventHash["description"] = @event.description
        eventHash["start_in_seconds"] = @event.start.to_i
        eventHash["id"] = @event.id

        invitesArray = Array.new
        invites = Invitations.where(event_id:@event.id)
        invites.each do |invite|
            inviteHash = Hash.new
            inviteHash["accepted"] = invite.accepted
            inviteHash["seen"] = invite.seen
            inviteHash["name"] = invite.user.name
            inviteFriend = FbGraph::User.fetch(invite.user.uid, access_token: session[:fb_access_token])
            inviteHash["picture_url"] = inviteFriend.picture
            invitesArray.push(inviteHash)
        end
        eventHash["invitations"] = invitesArray

        render json: eventHash
    end

end