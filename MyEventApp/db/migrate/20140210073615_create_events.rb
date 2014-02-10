class CreateEvents < ActiveRecord::Migration
  def change
    create_table :events do |t|
 	  t.integer  :user_id
 	  t.string   :name
      t.datetime :start
      t.datetime :end
      t.text     :description
      t.timestamps
    end
  end
end
