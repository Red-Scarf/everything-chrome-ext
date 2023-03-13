# everything-chrome-ext
Google extension of Everything(www.voidtools.com)

页面选择文本后，可以发起HTTP请求去Everything获取搜索结果。
因此需要本地启动Everything的HTTP服务，并且开启跨域（CORS）。

根据论坛的问答(https://www.voidtools.com/forum/viewtopic.php?t=9177)，需要在Everything.ini文件的`http_server_header`属性里配置
```
http_server_header=Access-Control-Allow-Origin: *
```

HTTP服务配置用户名密码后，前端请求需要加上Authorization请求头，会触发options请求，判定跨域失败，只能不配置用户名密码来绕过该问题。