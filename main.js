/**
 * Created by ryosuke on 16/11/06.
 */

/* global require, module, exports, console */
(function () {
    'use strict';
    var Q = require("q"),
        deferred = Q.defer(),
        Julius = require('julius'),
        grammar = new Julius.Grammar(),
        julius = new Julius(grammar.getJconf()),
        wordList = require("./wordList.json"),
        hue = require("./hueController");

    Object.keys(wordList).forEach(function (key) {
        grammar.add(wordList[key]);
    });

    var triggered = false;

    grammar.compile(function (err, result) {
        if (err) {
            throw err
        }
        hue.getData("config");


        julius.on('result', function (str) {
            console.log(str);

            if (triggered && str == wordList.turnOff) { //いってきます
                hue.turnOff();
            }
            if (triggered && str == wordList.turnOn) { //ただいま
                hue.turnOn();
            }
            if (str == wordList.trigger) {
                triggered = true;
                setTimeout(function () {
                    triggered = false;
                    console.log("timeout");
                }, 3000);
            }
        });

        julius.on('error', function (str) {
            console.error('ERROR', str);
        });

        julius.start();

    });
})();