class InvitationsController < ApplicationController
def edit
	@invitation = Invitations.find(params[:id])
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
