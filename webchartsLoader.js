var arr = [
    "../node_modules/engineering-flot/lib/jquery.event.drag.js",
    "../node_modules/engineering-flot/lib/jquery.mousewheel.js",
    "../node_modules/engineering-flot/dist/es5/jquery.flot.js",
    "../node_modules/flot-cursors-plugin/dist/es5/jquery.flot.cursors.js",
    "../node_modules/ni-data-types/dist/es5-minified/ni-data-types.min.js",
    "../node_modules/flot-charting-plugin/dist/es5/jquery.flot.charting.js",
    "../node_modules/flot-intensitygraph-plugin/jquery.flot.intensitygraph.js",
    "../node_modules/three/build/three.min.js",
    "../node_modules/url-search-params-polyfill/index.js",
    "../node_modules/flot-glplotter-plugin/jquery.flot.glplotter.js",
    "../node_modules/webcomponents-lite/webcomponents-lite.js",
    "../node_modules/@jqwidgets/jqx-element/source-minified/jqxelement-polyfills.js",
    "../node_modules/@jqwidgets/jqx-element/source-minified/jqxelement.js",

    "../node_modules/ni-webcharts/dist/es5-minified/element.min.js",
    "../node_modules/ni-webcharts/dist/es5-minified/webcharts.min.js",

    "../node_modules/jqwidgets-scripts/jqwidgets/jqx-all.js",
    "../node_modules/ni-webcharts-legends/dist/es5-minified/webcharts-legends.min.js",

    "../node_modules/ni-webcharts/dist/es5-minified/element_registration.min.js"
];

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

loadJS();
