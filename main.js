/**
 * Created by ryosuke on 16/11/06.
 */

/* global require, module, exports, console */
(function () {
    'use strict';
    var Q = require("q"),
        Julius = require('julius'),
        hue = require("./hueController"),
        dashButton = require('node-dash-button'),
        voiceRes = require("./voiceResManager"),
        wordList = require("./wordList.json"),
        dashIDs = {"ag": "34:d2:70:89:ea:51"};

    function voiceController() {
        var grammar = new Julius.Grammar(),
            triggered = false;

        Object.keys(wordList).map(function (key) {
            return wordList[key];
        }).reduce(function (prev, curr) {
            return prev.concat(curr);
        }).forEach(function (str) {
            console.log(str);
            grammar.add(str);
        });

        grammar.compile(function (err, result) {
            if (err) {
                console.log("compile error");
                throw err
            }
            var julius = new Julius(grammar.getJconf());

            hue.getData("config");
            julius.on('result', function (str) {
                console.log(str);
                if (!triggered && wordList.trigger.includes(str)) {
                    triggered = true;
                    voiceRes.hmm();
                    setTimeout(function () {
                        triggered = false;
                        console.log("timeout");
                    }, 4000);
                }
                if (triggered && wordList.goout.includes(str)) {
                    voiceRes.jaane();
                    hue.turnOff();
                    triggered = false;
                }
                if (triggered && wordList.goodnight.includes(str)) {
                    voiceRes.oyasumi();
                    hue.turnOff();
                    triggered = false;
                }
                if (triggered && wordList.comehome.includes(str)) {
                    voiceRes.okaeri();
                    hue.turnOn();
                    triggered = false;
                }
                if (triggered && wordList.light.includes(str)) {

                    hue.isON().then(function (isOn) {
                        if (isOn) {
                            voiceRes.hotto();
                            hue.turnOff();
                        } else {
                            voiceRes.jan();
                            hue.turnOn();
                        }
                        triggered = false;
                    });
                }
            });
            julius.on('error', function (str) {
                console.error('ERROR', str);
            });
            julius.start();
        });
        console.log(hue.getData());

    }

    function dashButtonController() {
        var dash = dashButton("34:d2:70:89:ea:51", null, null, 'all');

        dash.on("detected", function (dashid) {
            if (dashid === dashIDs["ag"]) {
                voiceRes.pirorin();
		console.log("toggled");
                hue.toggle();
            }
        });
    }

    voiceRes.konnichiwa();
    voiceController();
    dashButtonController();

})();
