class RegistrationsController < Devise::RegistrationsController
    def new
        super
    end
    
    def create
        super
        puts "CREATING!!!"
    end
    
    def update
        super
    end
end
