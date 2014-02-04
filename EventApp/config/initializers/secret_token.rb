# Be sure to restart your server when you modify this file.

# Your secret key is used for verifying the integrity of signed cookies.
# If you change this key, all old signed cookies will become invalid!

# Make sure the secret is at least 30 characters and all random,
# no regular words or you'll be exposed to dictionary attacks.
# You can use `rake secret` to generate a secure secret key.

# Make sure your secret_key_base is kept private
# if you're sharing your code publicly.
EventApp::Application.config.secret_key_base = 'e39c0c84c2f8c7d54c38733dcd2d8f70f8044d31efdb4fd3900c3680b9e3a57b62082004b193f209cc5d1fd50282a7756e5d8b3f28d367aee2cc89dc9f2366e5'
