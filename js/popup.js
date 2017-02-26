/**
 * Created by Liming on 2016/6/10.
 */
"use strict";
var userHead = document.getElementById("head");
var userUsername = document.getElementById("username");
var userLevel = document.getElementById("level");
var userSign = document.getElementById("sign");
var btnGoTo = document.getElementById("go_to");
var btnFavourite = document.getElementById("favourite");
var btnSchedule = document.getElementById("schedule");
var divList = document.getElementById("list");
var labRefresh = document.getElementById("refresh");
var searchInput = document.getElementById("search_input");

/**
 * 今天的播出表
 * @type {RegExp}
 */
var regCurrent = /<td class="ihbg cur">(.+?)<\/td>/;
/**
 * 获取日期
 * @type {RegExp}
 */
var regDate = /<dt>(.+?)<\/dt>/;
/**
 * 获取节目
 * @type {RegExp}
 */
var regShow = /<a href="(.+?)" title=".+?">(.+?)<\/a>/g;

/**
 * 用户信息请求成功
 * @param xmlHttp {XMLHttpRequest} 请求对象
 */
var getUserData = function(xmlHttp) {
    var json = JSON.parse(xmlHttp.responseText);
    if(json && json.status && json.status == 1 && json.data && json.data.userinfo) {
        userHead.src = json.data.userinfo.avatar_s;
        userUsername.innerHTML = json.data.userinfo.nickname;
        userLevel.innerHTML = json.data.userinfo.common_group_name;
        userSign.innerHTML = chrome.i18n.getMessage("linkUserInfo");
        userSign.removeEventListener("click", jumpToLogIn);
        userSign.addEventListener("click", jumpToUserInfo);
        btnFavourite.classList.remove("hide");
    } else {
        userHead.src = "./img/default_head.png";
        userUsername.innerHTML = chrome.i18n.getMessage("labLoggedOut");
        userLevel.innerHTML = "";
        userSign.innerHTML = chrome.i18n.getMessage("linkLogIn");
        userSign.removeEventListener("click", jumpToUserInfo);
        userSign.addEventListener("click", jumpToLogIn);
        btnFavourite.classList.add("hide");
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
var jumpToUserInfo = function() {
    chrome.tabs.create({
        url: "http://www.zimuzu.tv/user/user",
        active: true
    });
};

/**
 * 打开节目页面
 */
var openShow = function() {
    chrome.tabs.create({
        url: this.dataset.link,
        active: true
    });
};

/**
 * 播放表请求成功
 * @param xmlHttp {XMLHttpRequest} 请求对象
 */
var getSchedule = function(xmlHttp) {
    var divToday = document.getElementById("today");
    var data = xmlHttp.responseText.replace(regBlankLine, "");
    //今天
    if(regCurrent.test(data)) {
        try {
            var today = regCurrent.exec(data);
            //日期
            var date;
            if(regDate.exec(today[1])) {
                date = regDate.exec(today[1])[1];
            }
            var shows = [];
            var show = regShow.exec(today[1]);
            while(show != null) {
                shows[shows.length] = {
                    link: "http://www.zimuzu.tv" + show[1],
                    title: show[2]
                };
                show = regShow.exec(today[1]);
            }
            var divDate = document.createElement("div");
            divDate.innerHTML = date;
            divDate.classList.add("today_date");
            divToday.appendChild(divDate);
            for(var i = 0; i < shows.length; i++) {
                var divShow = document.createElement("div");
                divShow.innerHTML = shows[i].title;
                divShow.dataset.link = shows[i].link;
                divShow.addEventListener("click", openShow);
                divShow.classList.add("today_show");
                divToday.appendChild(divShow);
            }
        } catch(e) {
            console.log(e);
        }
    }
};

var loadList = function() {
    var items = document.querySelectorAll(".item");
    for(var i = 0; i < items.length; i++) {
        divList.removeChild(items[i]);
    }
    var list = JSON.parse(localStorage.getItem("list"));
    for(i = 0; list && i < list.length; i++) {
        var item = document.createElement("div");
        var image = document.createElement("img");
        var title = document.createElement("div");
        var updated = document.createElement("div");
        var next = document.createElement("div");
        title.innerHTML = list[i].title;
        image.dataset.src = list[i].image;
        updated.innerHTML = list[i].updated;
        if(list[i].nextDays) {
            next.innerHTML = list[i].next + "(" + list[i].nextDays + ")";
        } else {
            next.innerHTML = list[i].next;
        }
        item.classList.add("item");
        title.classList.add("item_title");
        image.classList.add("item_image");
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
    //Hide Refresh
    divList.scrollTop = 25;
    //load image
    setTimeout(function() {
        var img = document.getElementsByTagName("img");
        for(var i = 0; i < img.length; i++) {
            if(img[i].dataset.src) {
                img[i].src = img[i].dataset.src;
            }
        }
    }, 0);
};

var refresh = function() {
    labRefresh.removeEventListener("click", refresh);
    labRefresh.innerHTML = chrome.i18n.getMessage("labRefreshing");
    chrome.runtime.sendMessage({code: 1}, function(result) {
        if(result) {
            loadList();
            labRefresh.innerHTML = chrome.i18n.getMessage("labRefresh");
        } else {
            labRefresh.innerHTML = chrome.i18n.getMessage("labRefreshError");
        }
        labRefresh.addEventListener("click", refresh);
    });
};

/**
 * 加载页面
 */
(function() {
    //i18n
    btnGoTo.innerHTML = chrome.i18n.getMessage("btnGoTo");
    btnFavourite.innerHTML = chrome.i18n.getMessage("btnFavourite");
    btnSchedule.innerHTML = chrome.i18n.getMessage("btnSchedule");
    searchInput.setAttribute("placeholder", chrome.i18n.getMessage("iptSearch"));
    labRefresh.innerHTML = chrome.i18n.getMessage("labRefresh");
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
    labRefresh.addEventListener("click", refresh);
    //list
    loadList();
    //user information
    userUsername.innerHTML = chrome.i18n.getMessage("labLoading");
    userSign.innerHTML = chrome.i18n.getMessage("linkLogIn");
    userSign.removeEventListener("click", jumpToUserInfo);
    userSign.addEventListener("click", jumpToLogIn);
    request("GET", "http://www.zimuzu.tv/user/login/getCurUserTopInfo", null, getUserData);
    //load Schedule
    request("GET", "http://www.zimuzu.tv/tv/eschedule", null, getSchedule);
})();

/**
 * 搜索框
 */
(function () {
    var div = document.getElementById("search");
    div.addEventListener("click", function () {
        searchInput.focus();
    });
    searchInput.addEventListener("keydown", function(e) {
        if(e.keyCode == 13 && searchInput.value.length > 0) {
            chrome.tabs.create({
                //url: "http://www.zimuzu.tv/search?keyword=" + searchInput.value,
                url: "http://www.zmz2017.com/search?keyword=" + searchInput.value,
                active: true
            });
        }
    });
})();
