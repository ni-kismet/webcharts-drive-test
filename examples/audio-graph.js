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
        var data = [];
        var inputBuffer = audioProcessingEvent.inputBuffer;
        // The output buffer contains the samples that will be modified and played
        var outputBuffer = audioProcessingEvent.outputBuffer;

        // Loop through the output channels (in this case there is only one)
        for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
            var inputData = inputBuffer.getChannelData(channel);
            var outputData = outputBuffer.getChannelData(channel);
/*
            // Loop through the samples
            for (var sample = 0; sample < inputBuffer.length; sample++) {
                // make output equal to the same as the input
                outputData[sample] = inputData[sample];
            }
*/
            data.push(Array.prototype.slice.call(inputData));
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
        NationalInstruments.HtmlVI.Elements.NIElement.addNIEventListener('attached', function () {
            loadSound("media/Delia Derbyshire - Doctor Who Theme.mp3");
        });
    });
})();
