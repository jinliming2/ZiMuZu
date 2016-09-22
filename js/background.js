/**
 * Created by Liming on 2016/6/10.
 */
"use strict";
//Data initialize
if(localStorage.getItem("loop") == null) {  //后台循环周期
    localStorage.setItem("loop", "1800000");
}
if(localStorage.getItem("background") == null) {  //后台开关
    localStorage.setItem("background", "true");
}
if(localStorage.getItem("list") == null) {  //列表
    localStorage.setItem("list", "[]");
}
/**
 * 后台事件
 * @type {number|boolean}
 */
var background = false;
/**
 * 图片地址匹配
 * @type {RegExp}
 */
var regImage = /<a href="\/resource\/\d+"><img src="(.+?)" \/><span class="point"><em>(\d{1,2}\.?)<\/em>(\d+)<\/span><\/a>/;
/**
 * 标题匹配
 * @type {RegExp}
 */
var regTitle = /<strong><a href="\/resource\/(\d+)">【(.+?)】《(.+?)》<\/a><\/strong>/;
/**
 * 更新匹配
 * @type {RegExp}
 */
var regUpdated = /S(\d+)E(\d+)/;
/**
 * 下一集匹配
 * @type {RegExp}
 */
var regNext = /<span class="corner prevue" play_time="(\d{10})"><\/span>/;
/**
 * 状态匹配
 * @type {RegExp}
 */
var regStatus = /<span class="ts">(.+?)<\/span>/;
/**
 * 星期
 * @type {string[]}
 */
var weekday = ["日", "一", "二", "三", "四", "五", "六"];
/**
 * 请求成功
 * @param xmlHttp {XMLHttpRequest} 请求对象
 */
var success = function(xmlHttp) {
    var today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    var data = xmlHttp.responseText.replace(regBlankLine, "");
    data = data.split("<li class=\"clearfix\">");
    var old_obj = JSON.parse(localStorage.getItem("list"));
    var obj = [];
    for(var i = 1; i < data.length; i++) {
        //标题、链接
        if(!regTitle.test(data[i])) {
            continue;
        }
        var link = null;
        link = regTitle.exec(data[i]);
        var title = "[" + link[2].trim() + "]" + link[3].trim();
        link = "http://www.zimuzu.tv/resource/" + link[1].trim();
        //图片、得分
        var image = regImage.exec(data[i]);
        var point = image[2].trim() + image[3].trim();
        image = image[1];
        //更新到季集
        var updated = null;
        var updatedS = null;
        var updatedE = null;
        if(regUpdated.test(data[i])) {
            updated = regUpdated.exec(data[i]);
            updatedS = updated[1].trim();
            updatedE = updated[2].trim();
            updated = updated[0].trim();
        }
        //下一集
        var next = null;
        var nextDays = null;
        if(regNext.test(data[i])) {  //下一集信息
            next = new Date(regNext.exec(data[i])[1].trim() * 1000);
            //下一集剩余天数
            nextDays = (next - today) / 86400000;
            next = next.getFullYear() + "-" + (next.getMonth() + 1) + "-" + next.getDate() + " " + weekday[next.getDay()];
        } else if(regStatus.test(data[i])) {  //状态信息
            next = regStatus.exec(data[i])[1].trim();
        }
        //存储
        obj[obj.length] = {
            link: link,
            image: image,
            title: title,
            updated: updated,
            updatedS: updatedS,
            updatedE: updatedE,
            next: next,
            nextDays: nextDays
        };
        //检查更新
        for(var j = 0; j < old_obj.length; j++) {
            if(old_obj[j].link == link) {
                if(old_obj[j].updatedS != updatedS || old_obj[j].updatedE != updatedE) {
                    //updated
                    chrome.notifications.create(link, {
                        type: "image",
                        iconUrl: "img/favicon32.png",
                        appIconMaskUrl: "img/favicon32.png",
                        title: title,
                        message: updated,
                        contextMessage: chrome.i18n.getMessage("NotificationMessage"),
                        priority: 0,
                        buttons: [
                            {
                                title: chrome.i18n.getMessage("NotificationButton1")
                            }
                        ],
                        imageUrl: image,
                        isClickable: false,
                        requireInteraction: false
                    });
                }
                break;
            }
        }
    }
    localStorage.setItem("list", JSON.stringify(obj));
};
/**
 * 设置后台循环
 */
var setLoop = function() {
    if(background) {
        clearInterval(background);
    }
    background = false;
    if(localStorage.getItem("background") == "true") {
        background = setInterval(function() {
            request("GET", "http://www.zimuzu.tv/user/fav", null, success);
        }, localStorage.getItem("loop") - 0);
    }
};
//Receive Message
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch(message.code) {
        case 0:  //设置查询
            setLoop();
            sendResponse(true);
            break;
    }
});
//Notification Button Clicked
chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
    chrome.tabs.create({
        url: notificationId,
        active: true
    });
});
//启动后直接查询一次
request("GET", "http://www.zimuzu.tv/user/fav", null, success);
//启动后设置后台查询
setLoop();

//安装提示
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        chrome.tabs.create({
            url: chrome.extension.getURL("option.html?ac=install")
        });
    } else if (details.reason == "update") {
    }
});
