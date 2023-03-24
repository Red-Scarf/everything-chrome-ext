const urlTextObj = $('input[name=url]');
const paramsObj = $('textarea[name=params]');
const defaultConfig = $.defaultConfig();
// 保存配置
function saveOptions() {
	let url = defaultConfig.baseUrl;
	let params = defaultConfig.params;
	if (urlTextObj.val()) {
		url = urlTextObj.val();
	} else {
		urlTextObj.val(defaultConfig.baseUrl);
	}
	if (paramsObj.val()) {
		params = $.parseJSON(paramsObj.val()); // 字符串转成对象直接保存
	} else {
		paramsObj.val(JSON.stringify(params)); // 赋默认值
	}
	chrome.storage.local.set({ 'baseUrl': url, 'params': params });
}

// 展示保存的配置
function restoreOptions() {
	chrome.storage.local.get(['baseUrl', 'params']).then((result) => {
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
}

document.addEventListener('DOMContentLoaded', restoreOptions);
$('#save').click(saveOptions);