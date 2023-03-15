$.extend({
    "defaultConfig": function () {
        // 默认配置
        return {
            baseUrl: 'http://127.0.0.1',
            params: {
                'c': 5, // 限制5条
                'j': 1, // json返回
            }
        };
    }
});