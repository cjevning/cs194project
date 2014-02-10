class EventsController < ApplicationController
  def index
  	@events = Event.where( user_id: current_user.id )
  end

  def new
    @event = Event.new
  end

  def show
    if !Event.exists?(params[:id])
       redirect_to action: 'new' 
    end
    @event = Event.find(params[:id])

  end

  def delete
  
  end

  def edit
  
  end

  def create
  	@event = Event.new(params[:event][:event])
    if @event.save
      flash[:success] = "Event Created!"
      redirect_to :action => 'show', :id => @event.id 
    else
      flash[:error] = "Event not created!"
      redirect_to action: 'new'
    end
  end
  private
  def event_params
      params.require(:event).permit(:user_id, :name, :start, :end, :description)
  end
end
