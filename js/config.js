function defaultConfig() {
    // 默认配置
    return {
        baseUrl: 'http://127.0.0.1',
        params: {
            'c': 5, // 限制5条
            'j': 1, // json返回
            'size_column': 1, // 文件大小
            'sort': 'size', // 按大小排序
            'ascending': 0, // 降序
        }
    };
}