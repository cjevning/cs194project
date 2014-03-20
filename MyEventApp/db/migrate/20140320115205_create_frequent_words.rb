class CreateFrequentWords < ActiveRecord::Migration
  def change
    create_table :frequent_words do |t|
      t.string :word

      t.timestamps
    end
  end
end
