(function() {
'use strict'; // turn on Strict Mode

// Map model holding locations and filtering logic.
var Map = function(locations) {

    var self = this;

    this.locations = ko.observableArray(locations);

    this.infoWindow = null;
    this.setInfoWindow = function(infoWindow) {
        self.infoWindow = infoWindow;
    };

    this.getInfoWindow = function() {
        return self.infoWindow;
    };

    this.getLocations = function(filterText) {

        // No filter. Just return all.
        if (!filterText) {
            return self.locations();
        }

        // Filter the locations based on the filterText input
        return ko.utils.arrayFilter(self.locations(), function(location) {
            return location.name.toUpperCase().startsWith(filterText.toUpperCase());
        });
    };
};

// Location model holding properties of the location.
// Note: This also hold references to the google maps objects
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

var LocationViewModel = function() {
    var self = this;

    // Create list of locations for the model.
    self.map = new Map([
        new Location(1, 'Cure Maid Cafe', 35.702159, 139.771264),
        new Location(2, 'Cafe Style', 35.705163, 139.771250),
        new Location(3, 'Mandarake', 35.668821, 139.698807),
        new Location(4, 'Ramen Restaurant', 35.659107, 139.698166),
        new Location(5, 'Akihabara Station', 35.698597, 139.773125)
    ]);

    // Create a single info window to reuse throughout the application.
    self.map.setInfoWindow(new google.maps.InfoWindow({content: ''}));

    // If the info window is closed, stop animating the marker.
    google.maps.event.addListener(self.map.getInfoWindow(), 'closeclick', function(){
        var locations = self.getLocations();

        locations.forEach(function(location) {
            if (location.getMarker().getAnimation() !== null) {
                google.maps.event.trigger(location.getMarker(), 'click');
            }
        });
    });

    // Observe the filter text. When it changes the binds filter the list.
    self.filterText = ko.observable('');
    self.getLocations = ko.computed(function() {
        return self.map.getLocations(self.filterText());
    });

    // Treat a location click like a marker click.
    self.locationClicked = function(location) {
        var marker = location.getMarker();
        if (marker) {
            google.maps.event.trigger(marker, 'click');
        }
    };

    // Google maps objects. Not observable as per recommendation in project specs.
    self.googleMap = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644}, // These coords are from the sample. The map is immediately recentered anyways.
        zoom: 8
    });
    self.markers = [];

    // Marker rendering
    self.updateMapMarkers = function() {

        var locations = self.getLocations(),
            mapBounds = new google.maps.LatLngBounds();

        // Build a clickable marker for each location.
        locations.forEach(function(location){

            if (!location.getMarker()) {

                var marker = new google.maps.Marker({
                    map: self.googleMap,
                    draggable: false,
                    animation: google.maps.Animation.DROP,
                    position: {lat: location.latitude, lng: location.longitude}
                });
                location.setMarker(marker);

                marker.addListener('click', function () {

                    // Marker is already animating. Stop it.
                    if (marker.getAnimation() !== null) {
                        marker.setAnimation(null);
                        self.map.getInfoWindow().close();
                    } else {

                        // Loop over the locations. Stop animating other markers. Start animating the selected one.
                        locations.forEach(function(compareLocation) {
                           if (compareLocation.id === location.id) {
                               compareLocation.marker.setAnimation(google.maps.Animation.BOUNCE);
                           } else {
                               compareLocation.marker.setAnimation(null);
                           }
                        });

                        var infoWindow = self.map.getInfoWindow();

                        // Call out to the backend proxy to the twitter service.
                        jQuery.ajax({
                            url: 'http://localhost:8000/api/location/tweets',
                            method: 'GET',
                            data: {
                                'location': encodeURIComponent(location.name),
                                'lat': location.latitude,
                                'lon': location.longitude
                            },
                            success: function(data) {

                                // Build the list of twitter statuses and assign it to the infoWindow.
                                var contentString = '';
                                data.statuses.forEach(function(status) {
                                    contentString += status.text + '<br/>';
                                });

                                infoWindow.setContent(contentString);
                                infoWindow.open(self.googleMap, marker);
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                                infoWindow.setContent('Sorry, but the Twitter API seems to be down. Please try again soon.');
                                infoWindow.open(self.googleMap, marker);
                            }
                        });
                    }
                });

                self.markers.push(marker);
            }

            mapBounds.extend(location.getMarker().getPosition());
        });

        self.googleMap.fitBounds(mapBounds);
    };

    // If locations change update map markers. Right now I don't add any. But if I add some below it works!
    self.getLocations.subscribe(self.updateMapMarkers);
    self.updateMapMarkers();
};

var lvm = new LocationViewModel();
ko.applyBindings(lvm);

// Prove that adding a location the binds still work appropriately.
lvm.map.locations.push(new Location(6, 'Akiba Zone', 35.699770, 139.770332));
})();
