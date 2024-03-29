class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable, 
         :omniauthable, :omniauth_providers => [:facebook]

  has_many :events
  has_many :invitations
  
  def self.new_with_session(params, session)
    super.tap do |user|
      if data = session["devise.facebook_data"] && session["devise.facebook_data"]["extra"]["raw_info"]
        user.email = data["email"] if user.email.blank?
      end
    end
  end
  def self.find_for_facebook_oauth(auth)

    dbUsers = self.all(:conditions => ["uid = ?", auth["uid"]])

  	where(auth.slice(:provider, :uid)).first_or_create do |user|
  		user.provider = auth.provider
  		user.uid = auth.uid
  		user.email = auth.info.email
        user.name = auth.info.name
  		user.password= Devise.friendly_token[0,20]
        
        dbUsers.each do |u|
            if u != user
                invitations = Invitations.where( user: u )
                invitations.each do |i|
                    i.user = user
                    i.save
                end
                u.destroy()
            end
        end
    end

  end
end
