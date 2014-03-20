class EventTags < ActiveRecord::Base
	belongs_to :event
	belongs_to :tags
end
