var Map = function(locations) {

    var self = this;

    this.locations = ko.observableArray(locations);
    this.activeLocation = ko.observable();

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

var Location = function(id, name, latitude, longitude) {

    var self = this;

    this.id = id;
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
    this.marker = null;
    this.infoWindow = null;

    this.setMarker = function(marker) {
        self.marker = marker;
    };

    this.getMarker = function() {
        return self.marker;
    }

    this.setInfoWindow = function(infoWindow) {
        self.infoWindow = infoWindow;
    }

    this.getInfoWindow = function() {
        return self.infoWindow;
    }
};

var LocationViewModel = function() {
    var self = this;

    self.map = new Map([
        new Location(1, "Cure Maid Cafe", 35.702159, 139.771264),
        new Location(2, "Cafe Style", 35.705163, 139.771250),
        new Location(3, "Mandarake", 35.668821, 139.698807),
        new Location(4, "Ramen Restaurant", 35.659107, 139.698166),
        new Location(5, "Akihabara Station", 35.698597, 139.773125)
    ]);
    self.filterText = ko.observable("");

    self.getLocations = ko.computed(function() {
        return self.map.getLocations(self.filterText());
    });

    self.locationClicked = function(location) {
        var marker = location.getMarker();
        if (marker) {

            if (marker.getAnimation() !== null) {
                // hide info dialog
            } else {
                //show info dialog

            }

            google.maps.event.trigger(marker, 'click');
        }
    };

    // Google maps objects. Not observable as per recommendation in project specs.
    self.googleMap = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8
    });
    self.markers = [];

    // Marker rendering
    self.updateMapMarkers = function() {
        var locations = self.getLocations(),
            mapBounds = new google.maps.LatLngBounds();

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

                    if (marker.getAnimation() !== null) {
                        marker.setAnimation(null);
                        location.getInfoWindow().close();
                    } else {

                        locations.forEach(function(compareLocation) {
                           if (compareLocation.id === location.id) {
                               compareLocation.marker.setAnimation(google.maps.Animation.BOUNCE);
                           } else {
                               compareLocation.marker.setAnimation(null);
                               var compareInfoWindow = compareLocation.getInfoWindow();
                               if (compareInfoWindow !== null) {
                                   compareInfoWindow.close();
                               }
                           }
                        });

                        jQuery.ajax({
                            url: "http://localhost:8000/api/location/tweets",
                            method: "GET",
                            data: {
                                'location': encodeURIComponent(location.name),
                                'lat': location.latitude,
                                'lon': location.longitude
                            },
                            success: function(data) {

                                var contentString = '';
                                data.statuses.forEach(function(status) {
                                    contentString += status.text + '<br/>';
                                });

                                var infoWindow = location.getInfoWindow();
                                if (infoWindow === null) {
                                    var infoWindow = new google.maps.InfoWindow({
                                        content: contentString
                                    });
                                } else {
                                    infoWindow.setContent(contentString);
                                }

                                infoWindow.open(self.googleMap, marker);
                                location.setInfoWindow(infoWindow);
                            },
                            error: function(data) {
                                // @todo handle error
                                console.log('failed to authenticate');
                                console.dir(data);
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

    self.getLocations.subscribe(self.updateMapMarkers);
    self.updateMapMarkers();

};

ko.applyBindings(new LocationViewModel());