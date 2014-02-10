class EventsController < ApplicationController
  def index
  	@events = Event.find( uid: current_user.uid )
  end

  def new
  end

  def delete
  end

  def edit
  end
end
