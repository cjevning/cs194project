class AddReviewedToEvents < ActiveRecord::Migration
  def change
  	  	add_column :events, :reviewed, :boolean, :default => false
  end
end
