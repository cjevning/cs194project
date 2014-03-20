class InvitationsController < ApplicationController
def edit
	@invitation = Invitations.find(params[:id])
end


def show
    if !Invitations.exists?(params[:id])
        redirect_to action: 'new'
    end
    @invitation = Invitations.find(params[:id])
    @invitation.seen = true
    @invitation.save
    @event = @invitation.event
end



def accept
    invitation = Invitations.find(params[:id])
    invitation.accepted = true
    invitation.save
    flash[:notice] = "Invitation accepted!"
    redirect_to :controller => 'home', :action => 'index'
end



def update 
	@invitation.update_attributes(invitations_params)

end

def update
	#set attendance to true
	@invitation.update_attributes(invitations_params)
end


private
    def invitations_params
    	#trying to add attended field
        params.require(:event).permit(:user_id, :event_id, :accepted, :seen, :attended)
    end
end
