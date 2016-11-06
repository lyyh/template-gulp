'use strict';
require.config({
    baseUrl: '/src/js',
    paths: {
        jquery: 'lib/jquery.min',
        a: 'app/a'
    }
});
define('src/js/requireConfig', [], function () {
    return;
});