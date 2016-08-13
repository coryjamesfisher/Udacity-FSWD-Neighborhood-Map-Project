Udacity FSWD Neighborhood Map Project
=====================================

About The Project
-----------------
This project generates a web page with a google map of 5 hard-coded locations in the Akihabara District of Tokyo, Japan. It provides an interactive list that can be filtered by typing in the input box above it. As the items are filtered the map will automatically recompute the viewing window to show only the matching locations. On click of either a list item or on a map marker an info window will display with a few twitter posts that were geocoded within 5 miles of the location with the name of the location in the tweet. Note that the icon does a little bouncing motion when the location is selected. This animation and the info window state are tied together so that they will only appear on the active location. I chose Akihabara because my wife are big anime geeks and this is one of the hottest locations to find anime/manga culture.

Running The Project
-------------------
 1. vagrant up && vagrant ssh
 2. cd /vagrant/backend && npm start
 3. Navigate to: http://localhost:8000/

Technologies Used
-----------------

 1. APIs Utilized  
	Google Maps  
	Twitter  
	
 2. Technologies Used  
	 Vagrant - For Virtual Machine Creation  
	 NodeJS, NPM, Express.js - for Proxying of Twitter Calls & Serving of index.html  
	 jQuery & Knockout.js - For Front End Development  
