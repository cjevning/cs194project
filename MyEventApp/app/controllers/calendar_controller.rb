class CalendarController < ApplicationController
    
    def hash_for_event(evt)
        eventHash = Hash.new
        eventHash["name"] = evt.name
        eventHash["start"] = evt.start
        eventHash["end"] = evt.end
        eventHash["description"] = evt.description
        eventHash["start_in_seconds"] = evt.start.to_i
        eventHash["id"] = evt.id
        
        owner = FbGraph::User.fetch(evt.user.uid, access_token: session[:fb_access_token])
        eventHash["owner_pic"] = owner.picture
        eventHash["owner_name"] = owner.name
        
        invites = Invitations.where(event_id:evt.id)
        eventHash["num_invites"] = invites.length
        invitesArray = Array.new
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

        return eventHash
    end


    def day
      
    end


    def events
        eventList = Array.new
        
        invitations = Invitations.where( user: current_user )
        invitations.each do |invite|
            event = invite.event
            eventHash = hash_for_event(invite.event)
            if invite.accepted
                eventHash["status"] = "invited_accepted"
            else
                eventHash["status"] = "invited_maybe"
            end
            eventList.push(eventHash)
        end
    
        current_user.events.each do |event|
            eventHash = hash_for_event(event)
            eventHash["status"] = "owner"
            eventList.push(eventHash)
        end

        render json: eventList
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


    def event_for_id
        event = Event.find(params[:id])
        eventHash = hash_for_event(event)
        if (event.user == current_user)
            eventHash["status"] = "owner"
        else
            invite = Invitations.where( user: current_user, event: event)
            if invite.accepted
                eventHash["status"] = "invite_accepted"
            else
                eventHash["status"] = "invite_maybe"
            end
        end
        
        render json: eventHash
        
    end


    def accept
        message = ""
        event = Event.find(params[:id])
        invitations = Invitations.where( user: current_user, event: event)
        invite = invitations[0]
        puts event
        puts event.name
        puts invitations
        puts invite
        puts invite.accepted
        puts invite.seen

        if invite != nil
            invite.seen = true
            invite.accepted = true
            invite.save
        
            message = "Success!"
        else
            message = "failure"
        end
        
        render json: message
    end



end