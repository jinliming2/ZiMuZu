/**
 * Created by Liming on 2016/6/10.
 */
"use strict";
var userHead = document.getElementById("head");
var userUsername = document.getElementById("username");
var userLevel = document.getElementById("level");
var userSign = document.getElementById("sign");

/**
 * 请求成功
 * @param xmlHttp {XMLHttpRequest} 请求对象
 */
var getUserData = function(xmlHttp) {
    var json = JSON.parse(xmlHttp.responseText);
    if(json && json.status && json.status == 1 && json.data && json.data.userinfo) {
        userHead.src = json.data.userinfo.avatar_t;
        userUsername.innerHTML = json.data.userinfo.nickname;
        userLevel.innerHTML = json.data.userinfo.group_name;
        userSign.innerHTML = chrome.i18n.getMessage("linkSignIn");
        userSign.removeEventListener("click", jumpToLogIn);
        userSign.addEventListener("click", jumpToSignIn);
    }
};

/**
 * 跳转到登录页面
 */
var jumpToLogIn = function() {
    chrome.tabs.create({
        url: "http://www.zimuzu.tv/user/login",
        active: true
    });
};

/**
 * 跳转到签到页面
 */
var jumpToSignIn = function() {
    chrome.tabs.create({
        url: "http://www.zimuzu.tv/user/sign",
        active: true
    });
};

(function() {
    //Buttons
    var btnGoTo = document.getElementById("go_to");
    var btnFavourite = document.getElementById("favourite");
    var btnSchedule = document.getElementById("schedule");
    btnGoTo.innerHTML = chrome.i18n.getMessage("btnGoTo");
    btnFavourite.innerHTML = chrome.i18n.getMessage("btnFavourite");
    btnSchedule.innerHTML = chrome.i18n.getMessage("btnSchedule");
    //Events
    btnGoTo.addEventListener("click", function() {
        chrome.tabs.create({
            url: "http://www.zimuzu.tv/",
            active: true
        });
    });
    btnFavourite.addEventListener("click", function() {
        chrome.tabs.create({
            url: "http://www.zimuzu.tv/user/fav",
            active: true
        });
    });
    btnSchedule.addEventListener("click", function() {
        chrome.tabs.create({
            url: "http://www.zimuzu.tv/tv/eschedule",
            active: true
        });
    });
    //list
    var divList = document.getElementById("list");
    var list = JSON.parse(localStorage.getItem("list"));
    for(var i = 0; list && i < list.length; i++) {
        var item = document.createElement("div");
        var image = document.createElement("img");
        var title = document.createElement("div");
        var updated = document.createElement("div");
        var next = document.createElement("div");
        title.innerHTML = list[i].title;
        image.src = list[i].image;
        updated.innerHTML = list[i].updated;
        if(list[i].nextDays) {
            next.innerHTML = list[i].next + "(" + list[i].nextDays + ")";
        } else {
            next.innerHTML = list[i].next;
        }
        item.classList.add("item");
        title.classList.add("item_title");
        updated.classList.add("item_updated");
        next.classList.add("item_next");
        item.appendChild(image);
        item.appendChild(title);
        item.appendChild(updated);
        item.appendChild(next);
        item.dataset.url = list[i].link;
        item.addEventListener("click", function() {
            chrome.tabs.create({
                url: this.dataset.url,
                active: true
            });
        });
        divList.appendChild(item);
    }
    //user information
    userUsername.innerHTML = chrome.i18n.getMessage("labLoggedOut");
    userSign.innerHTML = chrome.i18n.getMessage("linkLogIn");
    userSign.removeEventListener("click", jumpToSignIn);
    userSign.addEventListener("click", jumpToLogIn);
    request("GET", "http://www.zimuzu.tv/user/login/getCurUserTopInfo", null, getUserData);
})();
