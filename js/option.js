/**
 * Created by Liming on 2016/6/10.
 */
"use strict";
(function() {
    var switch_ = document.getElementById("switch");
    var labSwitch = document.getElementById("labSwitch");
    var labLoop = document.getElementById("labLoop");
    var timeSlider = document.getElementById("loop");
    switch_.checked = localStorage.getItem("background") == "true";
    var time = localStorage.getItem("loop");
    labSwitch.innerHTML = chrome.i18n.getMessage("labSwitch");
    labLoop.innerHTML = chrome.i18n.getMessage("labLoop") + "(" + (time - 0) / 60000 + "min): ";
    timeSlider.value = time;
    timeSlider.addEventListener("change", function() {
        labLoop.innerHTML = chrome.i18n.getMessage("labLoop") + "(" + (timeSlider.value - 0) / 60000 + "min): ";
        localStorage.setItem("loop", timeSlider.value);
        chrome.runtime.sendMessage({code: 0}, function(response){
        });
    });
    switch_.addEventListener("change", function() {
        localStorage.setItem("background", switch_.checked);
        chrome.runtime.sendMessage({code: 0}, function(response){
        });
    });
})();
