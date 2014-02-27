class CalendarController < ApplicationController
    def day
      
    end
    
    
    def events
        @eventList = Array.new
        nineA = Event.new
        nineA.name = "Early Coffee"
        nineA.start = DateTime.new(2014,1,2,9)
        nineA.end = DateTime.new(2014,1,2,10)
        nineA.description = "Grab a coffee with someone new!"
        @eventList.push(nineA)
        
        nineA = Event.new
        nineA.name = "Lunch"
        nineA.start = DateTime.new(2014,1,2,12)
        nineA.end = DateTime.new(2014,1,2,13)
        nineA.description = "Looking for a good chat over lunch"
        @eventList.push(nineA)
        puts @eventList

        render json: @eventList
    end
end