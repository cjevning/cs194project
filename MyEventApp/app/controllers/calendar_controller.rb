class CalendarController < ApplicationController
    
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
            if !invite.rejected?
                if eventList[hourInt] == nil
                    eventHash = hash_for_event(invite.event)
                    eventHash["status"] = "invited_maybe"
                    eventList[hourInt] = eventHash
                end
            end
        end

        # Priority 5: Random close
        nearEvents = getNearEvents(nil)

        nearEvents.each do |event|
            invitations = Invitations.where( user: current_user, event: event)
            if (invitations.length == 0)
                hour = event.start.strftime("%H")
                hourInt = hour.to_i
                if (eventList[hourInt] == nil)
                    eventHash = hash_for_event(event)
                    eventHash["status"] = "public"
                    eventList[hourInt] = eventHash
                end
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
        elsif event != nil
            invite = Invitations.new
            invite.user = current_user
            invite.event = event
            invite.accepted = true
            invite.seen = true
            invite.rejected = false
            invite.maybe = false
            invite.created_at = Time.now
            invite.inviter_id = -1
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
            invite.rejected = true
            invite.maybe = false
            invite.save
            replyHash["rejectID"] = params[:id].to_s
        elsif event != nil
            invite = Invitations.new
            invite.user = current_user
            invite.event = event
            invite.accepted = false
            invite.seen = true
            invite.rejected = true
            invite.maybe = false
            invite.created_at = Time.now
            invite.inviter_id = -1
            invite.save
            replyHash["rejectID"] = params[:id].to_s
        else
            replyHash["rejectID"] = -1.to_s
        end
        
        replacementEvent = event_for_hour(event.start.strftime("%H"))
        
        eventHash = nil
        if (replacementEvent != nil)
            eventHash = hash_for_event(replacementEvent)
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
        
        replacementEvent = event_for_hour(event.start.strftime("%H"))
        
        eventHash = nil
        if (replacementEvent != nil)
            eventHash = hash_for_event(replacementEvent)
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
                    return invite.event
                end
            end
        end
        
        # Priority 3: Invite not seen
        invitations.each do |invite|
            if invite.event.start.strftime("%H") == hour
                if !invite.seen?
                    return invite.event
                end
            end
        end
        
        # Priority 4: Public event not seen
        events = getNearEvents(hour)
        events.each do |event|
            invitations = Invitations.where( user: current_user, event: event)
            if (invitations.length == 0)
                return event
            end
        end
        
        # Priority 5: FoF not seen

        # Priority 6: Invite maybe
        invitations.each do |invite|
            if invite.event.start.strftime("%H") == hour
                if invite.maybe?
                    return invite.event
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

    def getNearEvents(hour)
        user_ip = request.remote_ip
        location = GeoLocation.find(user_ip)
        lat = location[:latitude].to_f
        lng = location[:longitude].to_f
        oneMileForBoundingBox = 0.01448125385897
        milesAway = 5
        boxDist = milesAway * oneMileForBoundingBox
        maxLat = lat + boxDist
        minLat = lat - boxDist
        maxLng = lng + boxDist
        minLng = lng - boxDist
        if (hour == nil)
            nearEvents = Event.where("lat <= ? AND lat >= ? AND lng <= ? AND lng >= ? AND public = ?", maxLat, minLat, maxLng, minLng, true)
        else
            findHour = DateTime.now.change(hour: hour.to_i, minute: 0)
            plusOne = DateTime.now.change(hour: hour.to_i+1, minute: 0)
            nearEvents = Event.where("lat <= ? AND lat >= ? AND lng <= ? AND lng >= ? AND public = ? AND start >= ? AND start <= ?", maxLat, minLat, maxLng, minLng, true, findHour, plusOne)
            #nearEvents = Event.where("lat <= ? AND lat >= ? AND lng <= ? AND lng >= ? AND public = ?", maxLat, minLat, maxLng, minLng, true)
            nearEvents.each do |e|
                date = e.start
            end
            #nearEvents = Event.where("lat <= ? AND lat >= ? AND lng <= ? AND lng >= ? AND public = ? AND start >= ? AND start <= ?", maxLat, minLat, maxLng, minLng, true, findHour, plusOne)
        end
        return nearEvents
    end

end