// Create namespace for public functions.
var tokyoBliss = tokyoBliss || {};

(function() {
'use strict'; // turn on Strict Mode

// Map model holding locations and filtering logic.
var Map = function(locations, onLocationsFiltered) {

    var self = this;

    this.locations = ko.observableArray(locations);

    // Observe the filter text. When it changes the binds filter the list.
    this.filterText = ko.observable('');
    self.onLocationsFiltered = onLocationsFiltered;

    this.infoWindow = null;
    this.setInfoWindow = function(infoWindow) {
        self.infoWindow = infoWindow;
    };

    this.getInfoWindow = function() {
        return self.infoWindow;
    };

    this.getLocations = ko.computed(function() {

        // Filter the locations based on the filterText input
        var locations = ko.utils.arrayFilter(self.locations(), function(location) {

            var isMatch = location.name.toUpperCase().startsWith(self.filterText().toUpperCase());

            if (location.getMarker()) {
                if (isMatch) {
                    location.getMarker().setVisible(true);
                } else {
                    location.getMarker().setVisible(false);

                    // If we are hiding the selected pin, then unselect and close info window
                    if (location.getMarker().getAnimation() !== null) {
                        location.getMarker().setAnimation(null);
                        self.infoWindow.close();
                    }
                }
            }

            return isMatch;
        });

        self.onLocationsFiltered();
        return locations;
    });
};

// Location model holding properties of the location.
// Note: This also hold references to the google maps marker objects
// that correspond to them.
var Location = function(id, name, latitude, longitude) {

    var self = this;

    this.id = id;
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
    this.marker = null;

    this.setMarker = function(marker) {
        self.marker = marker;
    };

    this.getMarker = function() {
        return self.marker;
    };
};

var LocationViewModel = function(googleMap) {
    var self = this;

    self.googleMap = googleMap;
    self.mapBounds = new google.maps.LatLngBounds();

    // Create list of locations for the model.
    self.map = new Map([
        new Location(1, 'Cure Maid Cafe', 35.702159, 139.771264),
        new Location(2, 'Cafe Style', 35.705163, 139.771250),
        new Location(3, 'Mandarake', 35.668821, 139.698807),
        new Location(4, 'Ramen Restaurant', 35.659107, 139.698166),
        new Location(5, 'Akihabara Station', 35.698597, 139.773125)
    ], function(){

        // Using a callback to avoid putting the google map directly in the model.
        // This will reposition the map to fit all markers
        self.googleMap.fitBounds(self.mapBounds);
    });

    // Create a single info window to reuse throughout the application.
    self.map.setInfoWindow(new google.maps.InfoWindow({content: ''}));
    self.addMarker = function(location) {

        var marker = location.getMarker();

        if (marker === null) {

            marker = new google.maps.Marker({
                map: self.googleMap,
                draggable: false,
                animation: google.maps.Animation.DROP,
                position: {lat: location.latitude, lng: location.longitude}
            });

            marker.addListener('click', function () {

                var infoWindow = self.map.getInfoWindow();

                // Close the info window other wise there is a lag between icon animation shift and new info window.
                infoWindow.close();

                // Marker is already animating. Stop it.
                if (marker.getAnimation() !== null) {
                    marker.setAnimation(null);
                } else {

                    // Loop over the locations. Stop animating other markers. Start animating the selected one.
                    self.map.locations().forEach(function (compareLocation) {
                        if (compareLocation.id === location.id) {
                            compareLocation.getMarker().setAnimation(google.maps.Animation.BOUNCE);
                        } else {
                            compareLocation.getMarker().setAnimation(null);
                        }
                    });

                    // Call out to the backend proxy to the twitter service.
                    jQuery.ajax({
                        url: 'http://localhost:8000/api/location/tweets',
                        method: 'GET',
                        data: {
                            'location': encodeURIComponent(location.name),
                            'lat': location.latitude,
                            'lon': location.longitude
                        }
                    }).done(function (data) {

                        // Build the list of twitter statuses and assign it to the infoWindow.
                        var contentString = '';
                        data.statuses.forEach(function (status) {

                            // Anchor tag insertion copied from
                            // https://coderwall.com/p/5yqeow/create-anchor-links-from-tweet-text
                            contentString += status.text.replace(
                                    /(>|<a[^<>]+href=['"])?(https?:\/\/([-a-z0-9]+\.)+[a-z]{2,5}(\/[-a-z0-9!#()\/?&.,]*[^ !#?().,])?)/gi,
                                    function ($0, $1, $2) {
                                        return ($1 ? $0 : '<a href="' + $2 + '" target="_blank">' + $2 + '</a>');
                                    }) + '<br/>';
                        });

                        infoWindow.setContent(contentString);
                        infoWindow.open(self.googleMap, marker);

                    }).fail(function (jqXHR, textStatus) {
                        infoWindow.setContent('Sorry, but the Twitter API seems to be down. Please try again soon.');
                        infoWindow.open(self.googleMap, marker);
                    });
                }
            });

            location.setMarker(marker);

            self.mapBounds.extend(location.getMarker().getPosition());
        }
    };

    // Initialized above with array instead of calling
    // addLocation for each to avoid wonky startup.
    self.addLocation = function(location) {
        self.addMarker(location);
        self.map.locations.push(location);
    };

    // Add a marker for each location.
    self.map.locations().forEach(function(location){
        self.addMarker(location);
    });

    // If the info window is closed, stop animating the marker.
    google.maps.event.addListener(self.map.getInfoWindow(), 'closeclick', function(){
        var locations = self.map.getLocations();

        locations.forEach(function(location) {
            if (location.getMarker().getAnimation() !== null) {
                google.maps.event.trigger(location.getMarker(), 'click');
            }
        });
    });

    // Treat a location list item click like a marker click.
    self.locationClicked = function(location) {
        var marker = location.getMarker();
        if (marker) {
            google.maps.event.trigger(marker, 'click');
        }
    };

    // Reposition map on resize
    window.onresize = function(){
        self.googleMap.fitBounds(self.mapBounds);
    };
};

tokyoBliss.initialize = function() {
    // Google maps objects. Not observable as per recommendation in project specs.
    var googleMap = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644}, // These coords are from the sample. The map is immediately recentered anyways.
        zoom: 8
    });

    var lvm = new LocationViewModel(googleMap);
    ko.applyBindings(lvm);

    // Prove that adding a location the binds still work appropriately.
    lvm.addLocation(new Location(6, 'Akiba Zone', 35.699770, 139.770332));
};

})();
