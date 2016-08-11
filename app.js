

var LocationViewModel = function() {
    var self = this;

    // Model
    self.locations = [
        {id: 1, name: "Cure Maid Cafe", address: "Japan, 〒101-0021 Tōkyō-to, Chiyoda-ku, 千代田区Sotokanda, 3 Chome−３−１５−５ ジーストア・アキバ Cure Maid Cafe"},
        {id: 2, name: "Cafe Style", address: "秋葉原の京風ネットカフェ 和style.cafe AKIBA店"},
        {id: 3, name: "Mandarake", address: "まんだらけコンプレックス Mandarake"},
        {id: 4, name: "Ramen Restaurant", address: "Japan, 〒101-0025 Tokyo, 千代田区Kanda Sakumacho, ３−20−１"},
        {id: 5, name: "Akihabara Station", address: "1 Chome Sotokanda, Chiyoda-ku, Tōkyō-to 101-0028, Japan"},
    ];

    self.filterText = ko.observable("");

    self.getLocations = function() {

        // No filter. Just return all.
        if (!self.filterText()) {
            return self.locations;
        }

        // Filter the locations based on the filterText input
        return ko.utils.arrayFilter(self.locations, function(location) {
            return location.name.toUpperCase().startsWith(self.filterText().toUpperCase());
        });
    };

    self.locationClicked = function(location) {

    };

};

ko.applyBindings(new LocationViewModel());