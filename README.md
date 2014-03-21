cs194project
============
KarmaFriend
Matt Bettonville, Conner Jevning, Brian Peltz, and Travis Sanchez


KarmaFriend is a mobile/desktop app designed to help people find casual things to do with their friends or people near them. Our system allows people to create events, find events in their local geo area, and invite friends from facebook to their events. It even has an auto tagging service when creating the event descriptions so users can find certain events more quickly.

The experience of the application is designed to be ephemeral—events appear on a calendar, and a user can sign up for them or flick them out of the way to see what else there is.

We used Ruby on Rails for its rapid development and platform compatability, and easy to
expand MVC framework. We also put our app on Heroku to test. Postgres is the database 
type in Heroku.

The main tables in our model are users and events. Any user can create and event an issue invitations, another table, to other users. We import Facebook’s OpenGraph in order to connect people to their friends, and we handled most of our user accounts with a Rails component called Devise.

In addition to connecting users with many events, invitations also store information about RSVPs, and attendance. They also provide a handle for accessing Facebook information, such as names an photographs, from a given event. This allows us to create an immersive experience for the user.

The last piece of our model is a databased corpus of english words and common phrases. We use this database in our event auto tagging system, in which we send event descriptions to the server in realtime over AJAX and analyze them against a model of English language to find phrases often associated with events.

Another component of the application is its geolocation system. Users can mark an event as “public”, meaning anyone is welcome to sign up within their local area. This system works by looking at the users IP address as a geolocation marker. Although this system could easily be fooled by a proxy server, it provides a fast, unintrusive, but still usable proximity estimate. It also provides some measure of privacy for the users posting up the events as people will not know any exact location from when the event was posted.

After much debate, we reduced the application to a single screen: a calendar view. The goal was to create a dynamic, living calendar that a user could easily pop open and feel comfortable with. The calendar is a large javascript application with several interesting components. Events are loaded dynamically via AJAX to populate the calendar and stored in a client-side model. The model, contained in the timeSlots array, is structured as such: each of the 24 time slots contains two items: “active”, a record of the event currently being displayed in that time slot, and “maybe”, an array of records for events the user has stored in the maybe folder by swiping them to the right. Some helper functions allow client-side access to basically all the information a user could want, although it is a little slow on first load as a result. When a time slot is emptied, usually from a user rejecting an invitation or public event, AJAX calls repopulate it with a new event.

Most events (excepting the ones you personally have created) are draggable via custom touch and swipe handling functions that we built from scratch. To make scrolling easy and prevent user mistakes, events only most horizontally. Upon tapping an event, it animates up into a full event view, displaying key information and offering a user the option to accept an invitation.

Pressing the “maybe” button or swiping an event to the right moves it into its time slot’s “maybe” folder. This allows users to say, “this looks interesting, but I want to check out what else is going on.” Tapping on the folder will circulate the user back through the events they have said “maybe” to.

A “+” button in the top left of the screen allows access to the new events form. This form contains the previously described tagging feature, as well as a fast, client-side friend search for quickly creating events.
