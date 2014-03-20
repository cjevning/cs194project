# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)


#Fill in the common words to the database
f1 = File.open("app/assets/common_words.txt")
f1.each_line do |line|
	FrequentWords.create :word => line[0..-2]
end

f2 = File.open("app/assets/corpus.txt")
f2.each_line do |line|
	EnglishWords.create :word => line[0..-3]
end