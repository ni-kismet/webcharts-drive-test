(function () {
    "use strict";

    var chart = document.querySelector("#chart");
    var waveSelection = document.querySelector("#formWave");
    var freqSelection = document.querySelector("#frequency");
    var ampSelection = document.querySelector("#amplitude");
    var generateDataSelection = document.querySelector("#generateData");
    var chartYAxis = document.querySelector("#chartY");

    var generate = true;
    var t = 0;
    var hb;
    var a = 5;
    var freq = 10;

    var w = 62;
    var waveform = "1";

    function generateData(waveform) {
        w = 2*Math.PI*freq;
        var R = -0.0000156 * (t-20)**4 + 2.5,
            T = -0.0000156 * (t-20)**4 + 6,
            b = 0;
        b += (0 < t && t < 40) ? R : 0;
        b += (200 < t && t < 360) ? T : 0;
        switch(waveform) {
            case "1":
                //return a * Math.sin(t*w);
                return R;
            case "2":
                return T;
            case "3":
                return (-2*a/Math.PI) * Math.atan(1/Math.tan(w*t/2));
        }
    }

    function updateChart() {
        if (!hb) {
          var chartElement = document.querySelector('#chart');
          if (typeof chartElement.getHistoryBuffer !== 'function') {
              return;
          }

          hb = chartElement.getHistoryBuffer();
          hb.setWidth(2);
      }

      if (generate) {
          hb.push([generateData("1"), generateData("2")/*, generateData("3")*/]);
          t += 1;
      }
    }
    setInterval(updateChart, 1);

    waveSelection.onclick = function () {
        waveform = document.querySelector('input[name="myRadio"]:checked').value;
    }

    generateDataSelection.onclick = function () {
        var sel = document.querySelector('input[name="myRadio2"]:checked').value;
        generate = sel === "on" ? true : false;
    }

    freqSelection.onkeypress = function(e) {
        if (!e) e = window.event;
        var keyCode = e.keyCode || e.which;
        if (keyCode == '13'){
            // Enter pressed
            freq = Number(freqSelection.value) || 10;
        }
    }

    ampSelection.onkeypress = function(e) {
        if (!e) e = window.event;
        var keyCode = e.keyCode || e.which;
        if (keyCode == '13'){
            // Enter pressed
            a = Number(ampSelection.value) || 5;
        }
    }
})();
