/**
 * Created by Liming on 2016/6/10.
 */
"use strict";
//Data initialize
if(localStorage.getItem("loop") == null) {  //后台循环周期
    localStorage.setItem("loop", "10000");
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
 * 空行匹配
 * @type {RegExp}
 */
var regBlankLine = /(\r)+|(\n)+|(\r\n)+/g;
/**
 * 图片地址匹配
 * @type {RegExp}
 */
var regImage = /<img src="(.+?)" \/>/;
/**
 * 标题匹配
 * @type {RegExp}
 */
var regTitle = /<h2>[ ]*<a href="(.+?)" target="_blank">(.+?)<\/a>/;
/**
 * 更新匹配
 * @type {RegExp}
 */
var regUpdated = /S(\d*)E(\d*)/;
/**
 * 下一集匹配
 * @type {RegExp}
 */
var regNext = /<font class="f2">(.+?)<\/font>/;
/**
 * 时间匹配
 * @type {RegExp}
 */
var regNextIsTime = /(\d{4})-(\d{2})-(\d{2})/;
/**
 * REQUEST 请求
 * @param {string} method 请求方法
 * @param {string} url 链接
 * @param {string|null} data 数据
 * @param {function} [success] 成功回调
 * @param {function} [error] 失败回调
 * @param {function} [complete] 完成回调
 * @private
 */
var request = function(method, url, data, success, error, complete) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if(xmlHttp.readyState == 4) {
            if(xmlHttp.status == 200) {
                success && success(xmlHttp);
            } else {
                error && error(xmlHttp);
            }
            complete && complete(xmlHttp);
        }
    };
    xmlHttp.open(method, url, true);
    if(method == "POST") {
        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    }
    xmlHttp.send(data);
};
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
    var index = data.indexOf("<ul class=\"user-favlist\">");
    data = data.substring(index, data.indexOf("</ul>", index));
    data = data.split("</li>");
    var old_obj = JSON.parse(localStorage.getItem("list"));
    var obj = [];
    for(var i = 0; i < data.length; i++) {
        //标题
        if(!regTitle.test(data[i])) {
            continue;
        }
        var link = null;
        link = regTitle.exec(data[i]);
        var title = link[2].trim();
        link = link[1].trim();
        //图片
        var image = regImage.exec(data[i])[1];
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
        var next = regNext.exec(data[i])[1].trim();
        //下一集剩余天数
        var nextDays = null;
        if(regNextIsTime.test(next)) {
            var t = regNextIsTime.exec(next);
            nextDays = (new Date(t[1], t[2] - 1, t[3]) - today) / 86400000;
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
setLoop();
