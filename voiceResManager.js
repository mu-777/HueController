/**
 * Created by ryosuke on 16/12/10.
 */

/* global require, module, exports, console */
(function () {
    'use strict';

    var Q = require("q"),
        player = require("play-sound")({"player": "aplay"}),
        sound = require("node-aplay"),
        voiceList = require("./voiceList.json");

    function _playVoice(path) {
        var music = new sound(path);
        return function () {
            var deferred = Q.defer();
            music.play();
            return deferred.promise;
        }
    }

    function playVoice(path) {
        return function () {
            var deferred = Q.defer();
            player.play(path,{"aplay":["-Dhw:1,0"]}, function (err) {
                if (err == null) {
                    deferred.resolve(null);
                } else {
                    deferred.reject(err);
                }
            });
            return deferred.promise;
        }
    }

    module.exports = {
        hmm: playVoice(voiceList.hmm),
        tsunagattane: playVoice(voiceList.tsunagattane),
        jaane: playVoice(voiceList.jaane),
        jan: playVoice(voiceList.jan),
        okaeri: playVoice(voiceList.okaeri),
        konnichiwa: playVoice(voiceList.konnichiwa),
        hotto: playVoice(voiceList.hotto),
        pipo: playVoice(voiceList.pipo),
        pirorin: playVoice(voiceList.pirorin),
        oyasumi: playVoice(voiceList.oyasumi)
    }

})();
