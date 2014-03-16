class AddFofToEvents < ActiveRecord::Migration
  def change
      add_column :events, :allows_fof, :boolean
  end
end
