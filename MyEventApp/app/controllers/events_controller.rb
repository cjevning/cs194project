class EventsController < ApplicationController
  def index
  	@events = Event.where( user_id: current_user.uid )
  end

  def new

  end
  def show
    event = params[:eventId]
  end

  def delete
  
  end

  def edit
  
  end

  def create
  	event = Event.new( { :user_id => current_user.uid, :name => params[:name],
                         :start => params[:start], :end => [:end], :description => params[:description] } )
    if event.save
      flash[:success] = "Event Created!"
      redirect_to action: 'show', eventId: event.id
    else
      flash[:error] = "Event not created!"
      redirect_to action: 'new'
    end
  end
end
