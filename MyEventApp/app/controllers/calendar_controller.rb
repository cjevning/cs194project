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


    def day
      
    end


    def events
        eventList = Array.new(24)
        
        # Priority 1: Owner
        current_user.events.each do |event|
            hour = event.start.strftime("%H")
            hourInt = hour.to_i
            if (eventList[hourInt] == nil)
                eventHash = hash_for_event(event)
                eventHash["status"] = "owner"
                eventList[hourInt] = eventHash
            end
        end
        
        # Priority 2: Invite accepted
        invitations = Invitations.where( user: current_user )
        invitations.each do |invite|
            event = invite.event
            hour = event.start.strftime("%H")
            hourInt = hour.to_i
            if invite.accepted?
                if eventList[hourInt] == nil
                    eventHash = hash_for_event(invite.event)
                    eventHash["status"] = "invited_accepted"
                    eventList[hourInt] = eventHash
                end
            end
        end
        
        # Priority 3: Invite not seen
        invitations.each do |invite|
            event = invite.event
            hour = event.start.strftime("%H")
            hourInt = hour.to_i
            if !invite.seen?
                if eventList[hourInt] == nil
                    eventHash = hash_for_event(invite.event)
                    eventHash["status"] = "invited_maybe"
                    eventList[hourInt] = eventHash
                end
            end
        end
        
        # Priority 4: Invite maybe
        invitations.each do |invite|
            event = invite.event
            hour = event.start.strftime("%H")
            hourInt = hour.to_i
            
            if eventList[hourInt] == nil
                eventHash = hash_for_event(invite.event)
                eventHash["status"] = "invited_maybe"
                eventList[hourInt] = eventHash
            end
        end

        render json: eventList
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

        if invite != nil
            invite.seen = true
            invite.accepted = true
            invite.rejected = false
            invite.maybe = false
            invite.save
            message = params[:id].to_s
        else
            message = -1.to_s
        end
        
        render json: message
    end


    def reject
        replyHash = Hash.new
        event = Event.find(params[:id])
        invitations = Invitations.where( user: current_user, event: event)
        invite = invitations[0]
        
        if invite != nil
            invite.seen = true
            invite.accepted = false
            invite.rejected
            invite.maybe = false
            invite.save
            replyHash["rejectID"] = params[:id].to_s
        else
            replyHash["rejectID"] = -1.to_s
        end
        
        replacementInvite = event_for_hour(event.start.strftime("%H"))
        
        eventHash = nil
        if (replacementInvite != nil)
            eventHash = hash_for_event(replacementInvite.event)
            eventHash["status"] = "invite_maybe"
        end
        replyHash["replacementEvent"] = eventHash
        
        render json: replyHash
    end


    def maybe
        replyHash = Hash.new
        event = Event.find(params[:id])
        invitations = Invitations.where( user: current_user, event: event)
        invite = invitations[0]
        
        if invite != nil
            invite.seen = true
            invite.accepted = false
            invite.rejected = false
            invite.maybe = true
            invite.save
            replyHash["maybeID"] = params[:id].to_s
            else
            replyHash["maybeID"] = -1.to_s
        end
        
        replacementInvite = event_for_hour(event.start.strftime("%H"))
        
        eventHash = nil
        if (replacementInvite != nil)
            eventHash = hash_for_event(replacementInvite.event)
            eventHash["status"] = "invite_maybe"
        end
        replyHash["replacementEvent"] = eventHash
        
        render json: replyHash
    end


    def event_for_hour(hour)
        
        # Priority 1: owner
        events = Event.where( user: current_user )
        events.each do |event|
            if event.start.strftime("%H") == hour
                return event
            end
        end
        
        # Priority 2: Invite accepted
        invitations = Invitations.where( user: current_user )
        invitations.each do |invite|
            if invite.event.start.strftime("%H") == hour
                if invite.accepted?
                    return invite
                end
            end
        end
        
        # Priority 3: Invite not seen
        invitations.each do |invite|
            if invite.event.start.strftime("%H") == hour
                if !invite.seen?
                    return invite
                end
            end
        end
        
        # Priority 4: Public event not seen
        #events.each do |event|
        #    if event.start.strftime("%H") == hour
        #        if event.public?
        #            if !event.seen?
        #        return event
        #    end
        #end
        
        # Priority 5: FoF not seen

        # Priority 6: Invite maybe
        invitations.each do |invite|
            if invite.event.start.strftime("%H") == hour
                if invite.maybe?
                    return invite
                end
            end
        end
        
        return nil
        
    end


    def feed
        @user = User.find( params[:id] )
        @events = Event.where( user: @user )
        @invitations = Invitations.where( user: @user )
        respond_to do |format|
            format.ics
        end
    end

end