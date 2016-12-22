
ui.date = { Week : ['日', '一', '二', '三', '四', '五', '六'] };

ui.date.format = function(v,formatter) {

	if(! (v instanceof Date)) {
		v = new Date(v * 1000);
	}

	var str = formatter;
   
    str = str.replace(/yyyy|YYYY/, v.getFullYear());
    str = str.replace(/yy|YY/, (v.getYear() % 100) > 9 ? (v.getYear() % 100).toString() : '0' + (v.getYear() % 100));

    str = str.replace(/MM/, v.getMonth() > 9 ? (v.getMonth() + 1).toString() : '0' + (v.getMonth() + 1));
    str = str.replace(/M/g, v.getMonth());

    str = str.replace(/w|W/g, ui.date.Week[v.getDay()]);

    str = str.replace(/dd|DD/, v.getDate() > 9 ? v.getDate().toString() : '0' + v.getDate());
    str = str.replace(/d|D/g, v.getDate());

    str = str.replace(/hh|HH/, v.getHours() > 9 ? v.getHours().toString() : '0' + v.getHours());
    str = str.replace(/h|H/g, v.getHours());
    str = str.replace(/mm/, v.getMinutes() > 9 ? v.getMinutes().toString() : '0' + v.getMinutes());
    str = str.replace(/m/g, v.getMinutes());

    str = str.replace(/ss|SS/, v.getSeconds() > 9 ? v.getSeconds().toString() : '0' + v.getSeconds());
    str = str.replace(/s|S/g, v.getSeconds());

    return str;
};
