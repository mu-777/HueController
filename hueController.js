/**
 * Created by ryosuke on 16/11/02.
 */

/* global require, module, exports, console */
(function () {
    'use strict';

    var Q = require("q"),
        Julius = require('julius'),
        grammar = new Julius.Grammar(),
        wordList = require("./wordList.json"),
        julius = new Julius(grammar.getJconf()),
        hueProperty = require("./hueProperty.json"),
        Client = require("node-rest-client").Client,
        client = new Client();

    var request = require('request');

    function getHueAddress() {
        return "http://" + hueProperty.internalipaddress + "/api/" + hueProperty.username;
    }

    function connect() {
        client.post("http://" + hueProperty.internalipaddress + "/api",
            {data: {"devicetype": "home_server_app#home_server"}},
            function (data, response) {
                console.log("#####################################");
                console.log(data);
                hueProperty.username = data[0]["success"]["username"];
            }).on("error", function (err) {
            console.log(err);
        });
    }

    function turnOnOffHue(flag) {
        console.log("turnOnOffHue");
        client.put(getHueAddress() + "/groups/0/action",
            {
                data: {"on": flag},
                requestConfig: {
                    timeout: 1000, //request timeout in milliseconds
                    noDelay: true, //Enable/disable the Nagle algorithm
                    keepAlive: true, //Enable/disable keep-alive functionalityidle socket.
                    keepAliveDelay: 1000 //and optionally set the initial delay before the first keepalive probe is sent
                },
                responseConfig: {
                    timeout: 1000 //response timeout
                }
            },
            function (data, response) {
                console.log(data);
            }).on("error", function (err) {
            console.log(err);
        }).on('requestTimeout', function (req) {
            console.log('request has expired');
            req.abort();
        }).on('responseTimeout', function (res) {
            console.log('response has expired');
        });
    }

    function getData(command) {
        client.get(getHueAddress() + "/" + command,
            function (data, response) {
                console.log(data);
            }).on("error", function (err) {
            console.log(err);
        });
    }

    function deleteUsernames() {
        var defered = Q.defer(),
            list = [];

        client.get(getHueAddress() + "/config",
            function (data, response) {
                list = Object.keys(data["whitelist"]);
                console.log(list);
                list.map(function (username) {
                    return (function () {
                        if (username == hueProperty.username) {
                            defered.resolve();
                        } else {
                            client.delete(getHueAddress() + "/config/whitelist/" + username,
                                function (data, res) {
                                    console.log(data);
                                    defered.resolve();
                                });
                        }
                        return defered.promise;
                    });
                }).reduce(function (prev, curr) {
                    return prev.then(curr, function (err) {
                        console.log(err);
                    });
                }, Q());
            }).on("error", function (err) {
            console.log(err);
        });

    }

    function print(str) {
        console.log(str);
    }

    Object.keys(wordList).forEach(function (key) {
        grammar.add(wordList[key]);
    });

    grammar.compile(function (err, result) {
        if (err) {
            throw err
        }

        // connect();
        getData("config");
        getData("lights");
        julius.on('result', function (str) {
            console.log(str);

            if (str == wordList.turnOff) {
                turnOnOffHue(false);
            }
            if (str == wordList.turnOn) {
                turnOnOffHue(true);
            }
            if (str == wordList.trigger) {
                // getData("groups");
                getData("config");
                request(getHueAddress() + "/config", function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        console.log(response); // Print the google web page.
                        console.log(body); // Print the google web page.
                    }
                });
            }
        });
        julius.on('error', function (str) {
            console.error('ERROR', str);
        });

        julius.start();

    });


})();