// 默认配置
const defaultConfig = {
	baseUrl: 'http://127.0.0.1'
}
$(function () {
	let urlTextObj = $('input[name=url]');
	let paramsObj = $('textarea[name=params]');
	// 保存按钮
	$('#save').click(() => {
		let url = urlTextObj.val();
		let params = $.parseJSON(paramsObj.val()); // 字符串转成对象直接保存
		console.log('保存按钮 url', url, params);
		chrome.storage.local.set({ 'baseUrl': url, 'params': params })
	})
	console.log($('.option'));
	// 配置的回车事件
	$('.option').keyup((event) => {
		if (event.keyCode == 13) {
			$('#save').trigger("click");
		}
	})

	// 展示配置信息
	chrome.storage.local.get(['baseUrl', 'params']).then((result) => {
		console.log('获取本地配置信息', result);
		let defaultConfig = $.defaultConfig();
		// 默认url
		let url = defaultConfig.baseUrl;
		if (result['baseUrl']) url = result['baseUrl'];
		urlTextObj.val(url);
		// 默认额外参数
		let params = defaultConfig.params;
		if (result['params']) {
			params = result['params'];
		}
		paramsObj.val(JSON.stringify(params)); // 转成json字符串才能展示在文本框中
	})
})
