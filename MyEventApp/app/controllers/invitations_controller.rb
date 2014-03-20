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

def flaked
    @users = params[:users]
    eventID = params[:event_id]
    @users.each do |user|
        invitation = Invitations.where(event_id:eventID, user_id:user).first
        invitation.attended = false;
        invitation.save;
        puts user
        @current_user = User.all.first
        puts "tard"
        puts @current_user
        update_score_invites
    end

    redirect_to :controller => 'home', :action => 'index'
end

def update_score_invites
        print "tard2"
        puts @current_user
        invitations1 = Invitations.where(user_id: @current_user, accepted: true, attended: true)
        count1 = invitations1.count
        invitations2 = Invitations.where(user_id: @current_user, accepted: true)
        count2 = invitations2.count
        puts "count1"
        puts count1
        puts "count2"
        puts count2
        score = ((count1+1) / (count2+1)) * 100
        @current_user.score = score 
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
