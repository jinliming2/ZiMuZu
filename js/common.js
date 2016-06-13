/**
 * Created by Liming on 2016/6/12.
 */
"use strict";
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
    data = data || null;
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
