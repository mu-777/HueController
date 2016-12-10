/**
 * Created by ryosuke on 16/11/02.
 */

/* global require, module, exports, console */
(function () {
    'use strict';

    var Q = require("q"),
        request = require('request'),
        fs = require('fs'),
        hueProperty = require("./hueProperty.json");

    function getHueAddress() {
        return "http://" + hueProperty.internalipaddress + "/api/" + hueProperty.username;
    }

    function connect() {
        var deferred = Q.defer();
        request.post("http://" + hueProperty.internalipaddress + "/api",
            {
                json: true,
                body: {"devicetype": "home_server_app#home_server"}
            }, function (error, response, data) {
                if (!error && response.statusCode == 200) {
                    console.log(data);
                    deferred.resolve(data)
                } else {
                    hueProperty.username = data[0]["success"]["username"];
                    fs.writeFile(huePropertyFilePath,
                        JSON.stringify(hueProperty),
                        function (err) {
                            deferred.resolve(data);
                        });
                }
            });
        return deferred.promise;
    }

    function turnOnOff(flag) {
        var deferred = Q.defer();
        request.put(getHueAddress() + "/groups/0/action",
            {
                json: true,
                body: {'on': flag}
            },
            function (error, response, data) {
                if (!error && response.statusCode == 200) {
                    deferred.resolve(data)
                } else {
                    deferred.reject(error);
                }
            });
        return deferred.promise;
    }

    function turnOn() {
        return turnOnOff(true);
    }

    function turnOff() {
        return turnOnOff(false);
    }

    function toggle() {
        var deferred = Q.defer();
        isON().then(function (isOn) {
            var action = isOn ? turnOff : turnOn;
            action().then(function (data) {
                deferred.resolve(data);
            }, function (err) {
                deferred.reject(err);
            })
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    function isON() {
        var deferred = Q.defer();
        getData("lights")
            .then(function (data) {
                data = JSON.parse(data);
                deferred.resolve(data['2']['state']['on'] && data['3']['state']['on'])
            });
        return deferred.promise;
    }

    function getData(command) {
        var deferred = Q.defer();
        request(getHueAddress() + "/" + command,
            function (error, response, data) {
                if (!error && response.statusCode == 200) {

                    deferred.resolve(data)
                } else {
                    deferred.reject(error);
                }
            });
        return deferred.promise;
    }

    function deleteUsernames() {
        var deferred = Q.defer();

        request.get(getHueAddress() + "/config", function (error, response, data) {
            if (err) {
                console.log(err);
                deferred.reject(err);
            }
            Object.keys(data["whitelist"]).map(function (username) {
                return (function () {
                    var d = Q.defer();
                    if (username == hueProperty.username) {
                        d.resolve();
                    } else {
                        request.del(getHueAddress() + "/config/whitelist/" + username,
                            function (data, res) {
                                console.log(data);
                                d.resolve();
                            });
                    }
                    return d.promise;
                });
            }).reduce(function (prev, curr) {
                return prev.then(curr, function (err) {
                    console.log(err);
                });
            }, Q());
        });
    }

    module.exports = {
        connect: connect,
        turnOn: turnOn,
        turnOff: turnOff,
        deleteUserNames: deleteUsernames,
        getData: getData,
        toggle: toggle,
        isON: isON
    };

})();