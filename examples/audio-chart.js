(function () {
    "use strict";

    var chartElement = document.querySelector("#chart");
    var i = 0;
    // create the audio context (chrome only for now)
    if (!window.AudioContext) {
        if (!window.webkitAudioContext) {
            alert('no audiocontext found');
        }
        window.AudioContext = window.webkitAudioContext;
    }

    var context = new AudioContext();

    var audioBuffer;
    var sourceNode;
    var javascriptNode;
    var data = [];

    var visibleBuffer = new HistoryBuffer(88200, 2);
    var hiddenBuffer = new HistoryBuffer(88200, 2);
    var onChange;
    var frozen = false;

    function stopPlot() {
        //onChange = visibleBuffer.callOnChange;
        //visibleBuffer.callOnChange = undefined;
    }

    function startPlot() {
        //visibleBuffer.onChange(onChange);
        visibleBuffer.appendArray(hiddenBuffer.toArray());
    }
    
    // load the sound
    setupAudioNodes();
    chartElement.setHistoryBuffer(visibleBuffer);
    function setupAudioNodes() {

        // setup a javascript node
        javascriptNode = context.createScriptProcessor(2048, 2, 2);
        // connect to destination, else it isn't called
        javascriptNode.connect(context.destination);


        // create a buffer source node
        sourceNode = context.createBufferSource();
        sourceNode.connect(javascriptNode);

        sourceNode.connect(context.destination);
    }

    // load the specified sound
    function loadSound(url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        // When loaded decode the data
        request.onload = function () {

            // decode the data
            context.decodeAudioData(request.response, function (buffer) {
                // when the audio is decoded play the sound
                playSound(buffer);
            }, onError);
        }
        request.send();
    }

    function playSound(buffer) {
        sourceNode.buffer = buffer;
        sourceNode.start(0);
        sourceNode.loop = true;
    }

    // log if an error occurs
    function onError(e) {
        console.log(e);
    }

    // when the javascript node is called
    // we send the data in the buffers to the chart
    javascriptNode.onaudioprocess = function (audioProcessingEvent) {
        var inputBuffer = audioProcessingEvent.inputBuffer;

        // Loop through the input channels
        for (var channel = 0; channel < inputBuffer.numberOfChannels; channel++) {
            if (data[channel] === undefined) {
                data[channel] = [];
            }
            data[channel] = inputBuffer.getChannelData(channel);
        }

        if(!frozen) {
            for(var i=0; i<2047; i++)
                visibleBuffer.push([data[0][i], data[1][i]]);
        } else {
            for(var i=0; i<2047; i++)
                hiddenBuffer.push([data[0][i], data[1][i]]);
        }
    }

    $('#myForm input').on('click', function() {
            if(frozen) {
                startPlot();
                frozen = !frozen;
            } else {
                stopPlot();
                frozen = !frozen;
            }
    });

    var domReady = function (readyCallback) {
        if (window.HTMLImports && window.HTMLImports.whenReady) {
            HTMLImports.whenReady(readyCallback);
        } else if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', readyCallback);
        } else {
            readyCallback();
        }
    };

    domReady(function () {
        NationalInstruments.HtmlVI.Elements.NIElement.addNIEventListener('attached', function () {
            loadSound("media/Low Roar - Ill Keep Coming.mp3");
        });
    });
})();
