class AddTookAttendanceToEvents < ActiveRecord::Migration
  def change
  	  	add_column :events, :taken_attendance, :boolean, default => false
  end
end
