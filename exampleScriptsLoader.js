var arr = [];
//function addapted from https://stackoverflow.com/questions/5235321/how-do-i-load-a-javascript-file-dynamically
function loadJS() {
    if (arr.length === 0) {
        return;
    }
    var jsElm = document.createElement("script");
    jsElm.type = "text/javascript";
    jsElm.src = arr.shift();
    jsElm.defer = true;
    jsElm.onload = loadJS;
    document.head.appendChild(jsElm);
}

$.getJSON("../exampleScripts.json", function(json) {
    arr = json;
    loadJS();
});
