class InvitationsController < ApplicationController
def edit
	@invitation = Invitations.find(params[:id])
end

def update 
	@invitation.update_attributes(invitations_params)

end

def editFlake
	@invitation.update_attributes(invitations_params)

#get invitations
def updateFlakes()
	@invitations = Invitations.where(event_id: @recentEvent.id)
	@invitations.each do |invitation|
		invitation.editFlake
	end
end


private
    def invitations_params
        params.require(:event).permit(:user_id, :event_id, :accepted, :seen)
    end
end
