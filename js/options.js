// 默认配置
const defaultConfig = {
	baseUrl: 'http://127.0.0.1'
}
$(function () {
	let urlText = $('input[name=url]');
	// 保存按钮
	$('#save').click(() => {
		let url = urlText.val();
		console.log('保存按钮 url', url);
		chrome.storage.local.set({ 'baseUrl': url })
	})
	console.log($('.option'));
	// 配置的回车事件
	$('.option').keyup((event) => {
		if (event.keyCode == 13) {
			$('#save').trigger("click");
		}
	})
	// 展示配置信息
	chrome.storage.local.get('baseUrl').then((result) => {
		console.log('获取本地配置信息', result);
		let url = defaultConfig.baseUrl;
		if (result['baseUrl']) url = result['baseUrl'];
		urlText.val(url);
	})
})
