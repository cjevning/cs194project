class CreateInvitations < ActiveRecord::Migration
  def change
    create_table :invitations do |t|
      t.boolean :accepted
      t.boolean :seen
      t.timestamp :created_at
      t.timestamps
    end
  end
end
