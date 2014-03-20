class HomeController < ApplicationController
	before_filter :authenticate_user!
	def index
        @invitations = Invitations.where( user: current_user )
        @events = Event.where( user: current_user )
        @events.each do |event|
            puts event.name
            puts event.user_id
        end
	end

	def eventsAccordion
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
		@nearEvents = Event.where("lat <= ? AND lat >= ? AND lng <= ? AND lng >= ?", maxLat, minLat, maxLng, minLng)

		puts @nearEvents


		@timeIntervals = [1,3,6,12,24,72,1073741823]
		@invitations = Invitations.where( user_id: current_user.id )
		@events = Event.where( user_id: current_user.id )
		@eventsGrouped = []
		len = @timeIntervals.length
		for elem in 0..len
			@eventGroup = []
			@eventsGrouped.push(@eventGroup)
		end
		currTime = Time.now
		@nearEvents.each do |e|
			diff = (e.start-currTime)/(60*60)
			if (diff > -1) 
				for elem in 0..len
					if (diff < @timeIntervals[elem]) 
						toPush = @eventsGrouped[elem]
						toPush.push(e)
						break
					end
				end
			end
		end
	end
end
