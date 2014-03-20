class AddAttendedToInvitations < ActiveRecord::Migration
  def change
  	add_column :invitations, :attended, :boolean, :default => true
  end
end
