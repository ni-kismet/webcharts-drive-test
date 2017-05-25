(function () {
    "use strict";

    var graph = document.querySelector("#graph");

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

    // load the sound
    setupAudioNodes();

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
    // we send the data in the buffers to the graph
    javascriptNode.onaudioprocess = function (audioProcessingEvent) {
        var inputBuffer = audioProcessingEvent.inputBuffer;

        // Loop through the input channels
        for (var channel = 0; channel < inputBuffer.numberOfChannels; channel++) {
            if (data[channel] === undefined) {
                data[channel] = [];
            }
            data[channel] = inputBuffer.getChannelData(channel);
        }
        graph.setData(data);
    }

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
        graph.onReady = function() {
            loadSound("media/Delia Derbyshire - Doctor Who Theme.mp3");
        };
    });
})();
