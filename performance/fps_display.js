/*jshint browser: true*/

(function () {
    'use strict';

    var div = document.querySelector('#fps');
    var history = [];
    var last_display = window.performance.now();

    div.innerHTML = '<table><tr><td><span id="fps"></span></td><td><td><span id ="sps"></span></tr></table>'

    div.update = function( samples) {
        var now = window.performance.now();
        while (history.length > 5) {
            if (history[0][0] < (now - 1500)) {
                history.shift();
            } else {
                break;
            }
        }
        history.push([now , samples]);

        if (history.length > 1 && (now - last_display > 1000)) {
            var interval = (history[history.length -1][0] - history[0][0]) /1000;
            var samples = history.reduce(function (p, s) {return p+s[1]}, 0);
            div.querySelector('#fps').innerHTML = '' + (history.length / interval).toFixed(1) + ' fps';
            div.querySelector('#sps').innerHTML = '' + (samples / interval).toFixed(0) + ' samples/second';
            last_display = now;
        }
        //console.log(samples);
    }
})();
