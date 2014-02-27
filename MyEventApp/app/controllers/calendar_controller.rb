class CalendarController < ApplicationController
    def day
      
    end
    
    
    def events
        @eventList = Array.new
        oneA = Hash.new
        oneA["name"] = "Late night coding sesh"
        oneA["start"] = DateTime.new(2014,1,2,9)
        oneA["end"] = DateTime.new(2014,1,2,10)
        oneA["description"] = "RoR and JS all day and all night long all week"
        oneA["start_in_seconds"] = oneA["start"].to_i
        @eventList.push(oneA)
        
        nineA = Hash.new
        nineA["name"] = "Early Coffee"
        nineA["start"] = DateTime.new(2014,1,2,17)
        nineA["end"] = DateTime.new(2014,1,2,18)
        nineA["description"] = "Grab a coffee with someone new!"
        nineA["start_in_seconds"] = nineA["start"].to_i
        @eventList.push(nineA)
        
        noon = Hash.new
        noon["name"] = "Lunch"
        noon["start"] = DateTime.new(2014,1,2,20)
        noon["end"] = DateTime.new(2014,1,2,21)
        noon["description"] = "Looking for a good chat over lunch"
        noon["start_in_seconds"] = noon["start"].to_i
        @eventList.push(noon)
        puts @eventList

        render json: @eventList
    end
end