define('a', [
    'require',
    'exports',
    'module'
], function (require, exports, module) {
    function fn() {
        console.log('this is the module a');
    }
    exports.fn = fn;
});
define('main', ['a'], function (A) {
    A.fn();
});