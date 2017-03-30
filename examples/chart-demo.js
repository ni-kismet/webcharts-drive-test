(function () {
    "use strict";

    var chart = document.querySelector("#chart");
    var waveSelection = document.querySelector("#formWave");
    var freqSelection = document.querySelector("#frequency");
    var ampSelection = document.querySelector("#amplitude");
    var autoscaleSelection = document.querySelector("#formAutoscale");
    var chartYAxis = document.querySelector("#chartY");

    var t = 0;
    var hb;
    var a = 5;
    var freq = 10;

    var w = 62;
    var waveform = "1";

    function generateData() {
        w = 2*Math.PI*freq;
        switch(waveform) {
            case "1":
                //Sine wave
                return a * Math.sin(t*w);
            case "2":
                //Square wave
                return a * Math.sign(Math.sin(t*w));
            case "3":
                //Sawtooth wave
                return (-2*a/Math.PI) * Math.atan(1/Math.tan(w*t/2));
            case "4":
                //Triange wave
                return (2*a/Math.PI) * Math.asin(Math.sin(t*w));
            case "5":
                //Random
                return (Math.random()*10*t) * Math.sin(t*w*Math.random());
        }
    }

    function updateChart() {
        if (!hb) {
          var chartElement = document.querySelector('#chart');
          if (typeof chartElement.getHistoryBuffer !== 'function') {
              return;
          }

          hb = chartElement.getHistoryBuffer();
      }

      hb.push(generateData());

      t += 0.001; 
    }
    setInterval(updateChart, 1);

    waveSelection.onclick = function () {
        waveform = document.querySelector('input[name="myRadio"]:checked').value;
    }  

    autoscaleSelection.onclick = function () {
        var sel = document.querySelector('input[name="myRadio2"]:checked').value;
        chartYAxis.attributes[9].nodeValue = sel;

        if(sel === "none") {
            chartYAxis.attributes[7].nodeValue = "-10";
            chartYAxis.attributes[8].nodeValue = "10";
        }
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
