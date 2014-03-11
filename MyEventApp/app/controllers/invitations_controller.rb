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



def update 
	@invitation.update_attributes(invitations_params)

end

private
    def invitations_params
        params.require(:event).permit(:user_id, :event_id, :accepted, :seen)
    end
end
