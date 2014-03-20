class AddFrequentWords < ActiveRecord::Migration
  def change
  	create_table :frequent_words do |t|
  		t.string :word
  	end
  end
end
