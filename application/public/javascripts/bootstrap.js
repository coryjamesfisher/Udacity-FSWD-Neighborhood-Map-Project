var tokyoBliss = tokyoBliss || {};

(function(){
tokyoBliss.jsIncludeError = function(asset) {

    // Fatal error. Replace the body with an error message.
    $('body').html('Sorry, but the ' + asset + ' seems to be down. Please refresh to try again.');
};
})();
