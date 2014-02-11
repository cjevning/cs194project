class CreateInvitations < ActiveRecord::Migration
  def change
    create_table :invitations do |t|
      t.integer :user_id
      t.integer :event_id
      t.boolean :accepted
      t.boolean :seen
      t.timestamp :created_at

      t.timestamps
    end
  end
end