MyEventApp::Application.routes.draw do
 
  get "calendar/day"
  root 'calendar#day'

  devise_for :user, :controllers => { :omniauth_callbacks => "user/omniauth_callbacks" }
  
  get 'home/index' => 'home#index'
  get 'home' => 'home#index'
  get 'events/index' => 'events#index'
  get 'events/new' => 'events#new'
  get 'events/new_part' => 'events#new_part'
  get 'events/delete' => 'events#delete'
  get 'events/edit' => 'events#edit'
  get 'events/get_tag' => 'events#get_tag'
  get 'events/attendance' => 'events#attendance'
  get 'events/show' => 'events#show'
  get 'user/profile' => 'user#profile'
  get 'user/search' => 'user#search'
  get 'home/eventsAccordion' => 'home#eventsAccordion'
  get 'calendar/events' => 'calendar#events'
  get 'calendar/event_details' => 'calendar#event_details'
  get 'calendar/accept' => 'calendar#accept'
  get 'calendar/reject' => 'calendar#reject'
  get 'calendar/maybe' => 'calendar#maybe'
  get 'invitations/show' => 'invitations#show'
  get 'invitations/accept' => 'invitations#accept'
  get 'invitations/flaked' => 'invitations#flaked'
  match 'events/create' => 'events#create', via: [:get, :post], :as => :event
  resources :events

  get 'calendar/feed/:id/feed' => 'calendar#feed', :as => 'cal_feed_path'
  

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
