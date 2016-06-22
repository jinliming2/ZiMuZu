/**
 * Created by Liming on 2016/6/10.
 */
"use strict";
(function() {
    /** 开关标签 */
    var labSwitch = document.getElementById("labSwitch");
    labSwitch.innerHTML = chrome.i18n.getMessage("labSwitch");

    /** 开关按钮 */
    var switch_ = document.getElementById("switch");
    switch_.checked = localStorage.getItem("background") == "true";
    switch_.addEventListener("change", function() {
        localStorage.setItem("background", switch_.checked);
        chrome.runtime.sendMessage({code: 0}, function(response) {
        });
    });

    /** 周期标签 */
    var labLoop = document.getElementById("labLoop");
    var time = localStorage.getItem("loop");
    labLoop.innerHTML = chrome.i18n.getMessage("labLoop") + "（" + (time - 0) / 60000 + "min）";

    /** 周期Slider */
    var timeSlider = document.getElementById("loop");
    timeSlider.value = time;
    //实时显示
    timeSlider.addEventListener("input", function() {
        labLoop.innerHTML = chrome.i18n.getMessage("labLoop") + "（" + (timeSlider.value - 0) / 60000 + "min）";
    });
    //确认保存
    timeSlider.addEventListener("change", function() {
        localStorage.setItem("loop", timeSlider.value);
        chrome.runtime.sendMessage({code: 0}, function(response) {
        });
    });

    /** 评价标签 */
    var labRating = document.getElementById("labRating");
    labRating.innerHTML = chrome.i18n.getMessage("labRating");
    document.getElementById("rating").addEventListener("click", rating);

    /** Bug标签 */
    var labBug = document.getElementById("labBug");
    labBug.innerHTML = chrome.i18n.getMessage("labBug");
    document.getElementById("issues").addEventListener("click", issues);
    document.getElementById("support").addEventListener("click", support);

    /** GitHub标签 */
    var labRepository = document.getElementById("labRepository");
    labRepository.innerHTML = chrome.i18n.getMessage("labRepository");
    document.getElementById("gitHub").addEventListener("click", gitHub);

    /** Donate标签 */
    var labDonate = document.getElementById("labDonate");
    labDonate.innerHTML = chrome.i18n.getMessage("labDonate");
    document.getElementById("aliPay").addEventListener("click", aliPay);
    document.getElementById("weChat").addEventListener("click", weChat);
    document.getElementById("payPal").addEventListener("click", payPal);
    
    /** Tip */
    var tip = document.getElementById("tip");
    var tip_ok = document.getElementById("tip_ok");
    tip_ok.innerHTML = chrome.i18n.getMessage("tipOK");
    tip_ok.addEventListener("click", function() {
        tip.removeAttribute("style");
    });
    if(getQueryString("ac") === "install") {
        var tip_title = document.getElementById("tip_title");
        var tip_body = document.getElementById("tip_body");
        tip_title.innerHTML = chrome.i18n.getMessage("tipInstallTitle");
        tip_body.innerHTML = chrome.i18n.getMessage("tipInstallBody") + chrome.app.getDetails().version;
        tip.style.display = "flex";
        tip.style.display = "-webkit-flex";
    }
})();

function rating() {
    chrome.tabs.create({
        url: "https://chrome.google.com/webstore/detail/nadhjjijbdhgjhhnkggeliaajkhjnjil/reviews",
        active: true
    });
}

function issues() {
    chrome.tabs.create({
        url: "https://github.com/772807886/ZiMuZu/issues",
        active: true
    });
}

function support() {
    chrome.tabs.create({
        url: "https://chrome.google.com/webstore/detail/nadhjjijbdhgjhhnkggeliaajkhjnjil/support",
        active: true
    });
}

function gitHub() {
    chrome.tabs.create({
        url: "https://github.com/772807886/ZiMuZu",
        active: true
    });
}

var donate = document.getElementById("donate");
donate.addEventListener("click", function() {
    donate.style.display = "none";
});

function aliPay() {
    donate.innerHTML = "<img src=\"./img/AliPay.jpg\">";
    donate.style.display = "block";
}

function weChat() {
    donate.innerHTML = "<img src=\"./img/mmqrcode1459686420375.png\">";
    donate.style.display = "block";
}

function payPal() {
    chrome.tabs.create({
        url: "https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=jinliming2@qq.com&currency_code=USD&amount=1&return=https://www.jinliming.ml&item_name=ZiMuZu%20-%20Google%20Chrome%20Extension&item_number=1&undefined_quantity=1&no_note=0",
        active: true
    });
}
