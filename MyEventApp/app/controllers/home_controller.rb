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
		@invitations = Invitations.where( user_id: current_user.id )
		@events = Event.where( user_id: current_user.id )
	end
end
