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
           @eventList.push(eventHash)
        end

        render json: @eventList
    end
end