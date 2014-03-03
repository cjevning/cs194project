class HomeController < ApplicationController
	before_filter :authenticate_user!
	def index
        @invitations = Invitations.where( user_id: current_user.id )
        @events = Event.where( user_id: current_user.id )
        @events.each do |event|
            puts event.name
            puts event.user_id
        end
	end

	def eventsAccordion
		@timeIntervals = [1,3,6,12,24,72,Integer::MAX]
		@invitations = Invitations.where( user_id: current_user.id )
		@events = Event.where( user_id: current_user.id )
		@eventsGrouped = new Array()
		@eventGroup = new Array()
		@events.each do |e|
			puts e.start
		end
	end
end
