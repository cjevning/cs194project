class AddMaybeToInvitations < ActiveRecord::Migration
  def change
      add_column :invitations, :maybe, :boolean
      add_column :invitations, :rejected, :boolean
  end
end
