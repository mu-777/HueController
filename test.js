/**
 * Created by ryosuke on 16/11/04.
 */

/* global require, module, exports, console */
(function () {
    'use strict';

    var Client = require("node-rest-client").Client,
        client = new Client(),
        Julius = require('julius'),
        grammar = new Julius.Grammar();





    grammar.add('おはようございます');
    grammar.add('こんにちは');
    grammar.add('おやすみなさい');
    grammar.add('ななちゃん');

    grammar.compile(function (err, result) {
        if (err) {
            throw err
        }

        var julius = new Julius(grammar.getJconf());

        julius.on('result', function (str) {
            console.log(str);
        });

        julius.start();
    });


})();