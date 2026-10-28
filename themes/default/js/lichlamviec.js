/*
 * Module Lịch làm việc (NukeViet): âm lịch + lưới tháng. Chuyển từ plugin Minland Lịch (minland.io.vn).
 * File này NukeViet tự nạp trên trang module lichlamviec.
 */

/*
 * Âm lịch Việt Nam (múi giờ +7), theo thuật toán của Hồ Ngọc Đức (https://www.informatik.uni-leipzig.de/~duc/amlich/).
 * Chạy hoàn toàn trên máy người xem, không gọi mạng. Dùng được cả trong trình duyệt (window.LLVAmLich)
 * lẫn Node (module.exports) để kiểm thử.
 */
(function (root) {
	'use strict';
	var PI = Math.PI, TZ = 7;
	var INT = Math.floor;

	function jdFromDate(dd, mm, yy) {
		var a = INT((14 - mm) / 12), y = yy + 4800 - a, m = mm + 12 * a - 3;
		var jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
		if (jd < 2299161) jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
		return jd;
	}

	function jdToDate(jd) {
		var a, b, c;
		if (jd > 2299160) { a = jd + 32044; b = INT((4 * a + 3) / 146097); c = a - INT((b * 146097) / 4); }
		else { b = 0; c = jd + 32082; }
		var d = INT((4 * c + 3) / 1461), e = c - INT((1461 * d) / 4), m = INT((5 * e + 2) / 153);
		return [e - INT((153 * m + 2) / 5) + 1, m + 3 - 12 * INT(m / 10), b * 100 + d - 4800 + INT(m / 10)];
	}

	function newMoon(k) {
		var T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = PI / 180;
		var jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
		jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
		var M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
		var Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
		var F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
		var C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
		C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
		C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
		C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
		C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
		C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
		C1 = C1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
		var deltat = T < -11
			? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
			: -0.000278 + 0.000265 * T + 0.000262 * T2;
		return jd1 + C1 - deltat;
	}

	function sunLongitude(jdn) {
		var T = (jdn - 2451545.0) / 36525, T2 = T * T, dr = PI / 180;
		var M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
		var L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
		var DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
		DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
		var L = (L0 + DL) * dr;
		return L - PI * 2 * INT(L / (PI * 2));
	}

	function sunSegment(jd) { return INT(sunLongitude(jd - 0.5 - TZ / 24) / PI * 6); }
	function newMoonDay(k) { return INT(newMoon(k) + 0.5 + TZ / 24); }

	function lunarMonth11(yy) {
		var k = INT((jdFromDate(31, 12, yy) - 2415021) / 29.530588853);
		var nm = newMoonDay(k);
		return sunSegment(nm) >= 9 ? newMoonDay(k - 1) : nm;
	}

	function leapMonthOffset(a11) {
		var k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
		var last, i = 1, arc = sunSegment(newMoonDay(k + i));
		do { last = arc; i++; arc = sunSegment(newMoonDay(k + i)); } while (arc !== last && i < 14);
		return i - 1;
	}

	/** Dương lịch → âm lịch: { day, month, year, leap, jd }. */
	function solarToLunar(dd, mm, yy) {
		var jd = jdFromDate(dd, mm, yy);
		var k = INT((jd - 2415021.076998695) / 29.530588853);
		var monthStart = newMoonDay(k + 1);
		if (monthStart > jd) monthStart = newMoonDay(k);
		var a11 = lunarMonth11(yy), b11 = a11, year;
		if (a11 >= monthStart) { year = yy; a11 = lunarMonth11(yy - 1); }
		else { year = yy + 1; b11 = lunarMonth11(yy + 1); }
		var day = jd - monthStart + 1, diff = INT((monthStart - a11) / 29), leap = 0, month = diff + 11;
		if (b11 - a11 > 365) {
			var leapDiff = leapMonthOffset(a11);
			if (diff >= leapDiff) { month = diff + 10; if (diff === leapDiff) leap = 1; }
		}
		if (month > 12) month -= 12;
		if (month >= 11 && diff < 4) year -= 1;
		return { day: day, month: month, year: year, leap: leap, jd: jd };
	}

	var CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
	var CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
	var TIET_KHI = ['Xuân phân', 'Thanh minh', 'Cốc vũ', 'Lập hạ', 'Tiểu mãn', 'Mang chủng', 'Hạ chí', 'Tiểu thử',
		'Đại thử', 'Lập thu', 'Xử thử', 'Bạch lộ', 'Thu phân', 'Hàn lộ', 'Sương giáng', 'Lập đông', 'Tiểu tuyết',
		'Đại tuyết', 'Đông chí', 'Tiểu hàn', 'Đại hàn', 'Lập xuân', 'Vũ thủy', 'Kinh trập'];
	// Giờ hoàng đạo theo chi của ngày (6 nhóm, mỗi chuỗi 12 ký tự ứng với giờ Tý → Hợi).
	var GIO_HD = ['110100101100', '001101001011', '110011010010', '101100110100', '001011001101', '010010110011'];
	// 12 sao trực ngày, bắt đầu từ Thanh Long; true là hoàng đạo.
	var SAO = [['Thanh Long', true], ['Minh Đường', true], ['Thiên Hình', false], ['Chu Tước', false], ['Kim Quỹ', true],
		['Kim Đường', true], ['Bạch Hổ', false], ['Ngọc Đường', true], ['Thiên Lao', false], ['Huyền Vũ', false],
		['Tư Mệnh', true], ['Câu Trần', false]];

	function canChiNgay(jd) { return CAN[(jd + 9) % 10] + ' ' + CHI[(jd + 1) % 12]; }
	function canChiThang(month, year) { return CAN[(year * 12 + month + 3) % 10] + ' ' + CHI[(month + 1) % 12]; }
	function canChiNam(year) { return CAN[(year + 6) % 10] + ' ' + CHI[(year + 8) % 12]; }

	function gioHoangDao(jd) {
		var pattern = GIO_HD[((jd + 1) % 12) % 6], out = [];
		for (var i = 0; i < 12; i++) {
			if (pattern.charAt(i) === '1') out.push({ chi: CHI[i], from: (i * 2 + 23) % 24, to: (i * 2 + 1) % 24 });
		}
		return out;
	}

	/** Sao trực ngày: Thanh Long bắt đầu ở chi Tý (tháng 1, 7), Dần (2, 8), Thìn (3, 9)… */
	function saoNgay(jd, lunarMonth) {
		var start = ((lunarMonth - 1) % 6) * 2, dayChi = (jd + 1) % 12;
		var s = SAO[(dayChi - start + 12) % 12];
		return { name: s[0], good: s[1] };
	}

	function tietKhi(jd) { return TIET_KHI[INT(sunLongitude(jd + 0.5 - TZ / 24) / PI * 12)]; }

	// Ngày lễ. off: ngày nghỉ theo luật lao động.
	var LE_DUONG = { '1/1': ['Tết Dương lịch', true], '3/2': ['Thành lập Đảng'], '14/2': ['Lễ Tình nhân'], '27/2': ['Thầy thuốc Việt Nam'],
		'8/3': ['Quốc tế Phụ nữ'], '26/3': ['Thành lập Đoàn'], '30/4': ['Giải phóng miền Nam', true], '1/5': ['Quốc tế Lao động', true],
		'19/5': ['Sinh nhật Bác Hồ'], '1/6': ['Quốc tế Thiếu nhi'], '21/6': ['Báo chí Việt Nam'], '28/6': ['Gia đình Việt Nam'],
		'27/7': ['Thương binh Liệt sĩ'], '19/8': ['Cách mạng tháng Tám'], '2/9': ['Quốc khánh', true], '1/10': ['Quốc tế Người cao tuổi'],
		'10/10': ['Giải phóng Thủ đô'], '13/10': ['Doanh nhân Việt Nam'], '20/10': ['Phụ nữ Việt Nam'], '31/10': ['Lễ hội Halloween'],
		'20/11': ['Nhà giáo Việt Nam'], '22/12': ['Thành lập QĐND'], '24/12': ['Giáng sinh'] };
	var LE_AM = { '1/1': ['Tết Nguyên Đán', true], '2/1': ['Tết Nguyên Đán', true], '3/1': ['Tết Nguyên Đán', true], '15/1': ['Tết Nguyên Tiêu'],
		'3/3': ['Tết Hàn thực'], '10/3': ['Giỗ Tổ Hùng Vương', true], '15/4': ['Lễ Phật đản'], '5/5': ['Tết Đoan ngọ'], '7/7': ['Lễ Thất tịch'],
		'15/7': ['Lễ Vu Lan'], '15/8': ['Tết Trung thu'], '9/9': ['Tết Trùng Cửu'], '10/10': ['Tết Thường Tân'], '23/12': ['Ông Táo chầu trời'] };

	/** Mọi thông tin của một ngày dương lịch. */
	function info(dd, mm, yy) {
		var l = solarToLunar(dd, mm, yy), le = [];
		var d = LE_DUONG[dd + '/' + mm];
		if (d) le.push({ name: d[0], off: !!d[1] });
		var a = !l.leap && LE_AM[l.day + '/' + l.month];
		if (a) le.push({ name: a[0], off: !!a[1] });
		return {
			solar: { day: dd, month: mm, year: yy },
			lunar: l,
			weekday: (l.jd + 1) % 7, // 0 = Chủ nhật
			canChi: { ngay: canChiNgay(l.jd), thang: canChiThang(l.month, l.year), nam: canChiNam(l.year) },
			sao: saoNgay(l.jd, l.month),
			gioHoangDao: gioHoangDao(l.jd),
			tietKhi: tietKhi(l.jd),
			holidays: le
		};
	}

	var api = { solarToLunar: solarToLunar, info: info, jdFromDate: jdFromDate, jdToDate: jdToDate, canChiNam: canChiNam };
	if (typeof module !== 'undefined' && module.exports) module.exports = api;
	else root.LLVAmLich = api;
})(this);

/*
 * Lịch làm việc: lưới tháng gộp lịch làm việc + lịch vạn niên, khung bên cạnh là âm lịch và lịch của ngày đang chọn.
 * Vẽ vào mọi phần tử [data-mlc]. data-mlc là JSON:
 *   { today: 'YYYY-MM-DD', api: '<url REST lấy lịch>', events: [{ date, start, end, title, location, host, note }] }
 * events là lịch của tháng đầu tiên (in sẵn từ máy chủ); tháng khác tải qua api?from=…&to=….
 * Cần phần âm lịch ở trên (window.LLVAmLich).
 */
(function () {
	'use strict';
	var AL = window.LLVAmLich;
	var THU = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
	var THU_NGAN = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
	var ICON = {
		left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
		right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>'
	};

	function pad(n) { return (n < 10 ? '0' : '') + n; }
	function key(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
	function parse(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
	function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
	function monday(d) { return addDays(d, -((d.getDay() + 6) % 7)); }
	function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
	function dm(d) { return pad(d.getDate()) + '/' + pad(d.getMonth() + 1); }
	function infoOf(d) { return AL.info(d.getDate(), d.getMonth() + 1, d.getFullYear()); }
	function isOff(i) { return i.holidays.some(function (h) { return h.off; }); }
	/** Ô đầu và ô cuối của lưới tháng (Thứ Hai đầu tuần chứa ngày 1 → Chủ nhật cuối tuần chứa ngày cuối). */
	function gridRange(m) {
		var first = new Date(m.getFullYear(), m.getMonth(), 1), last = new Date(m.getFullYear(), m.getMonth() + 1, 0);
		return [monday(first), addDays(monday(last), 6)];
	}

	function Calendar(root, cfg) {
		this.root = root;
		this.api = cfg.api || '';
		this.today = cfg.today ? parse(cfg.today) : new Date();
		this.selected = new Date(this.today);
		this.view = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
		this.byDate = {};
		this.loaded = {};      // tháng đã có dữ liệu: 'YYYY-MM' → true
		this.error = false;
		this.add(cfg.events || []);
		this.loaded[this.monthKey(this.view)] = true;
		var self = this;
		root.addEventListener('click', function (e) { self.onClick(e); });
		root.addEventListener('keydown', function (e) { self.onKey(e); });
		this.render();
	}

	Calendar.prototype.monthKey = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1); };

	Calendar.prototype.add = function (list) {
		var self = this, seen = {};
		list.forEach(function (e) {
			var day = self.byDate[e.date] = self.byDate[e.date] || [];
			if (day.some(function (x) { return x.id && x.id === e.id; })) return;
			day.push(e); seen[e.date] = true;
		});
		Object.keys(seen).forEach(function (k) {
			self.byDate[k].sort(function (a, b) { return (a.start || '').localeCompare(b.start || ''); });
		});
	};

	/** Tải lịch của tháng đang xem nếu chưa có. Lỗi thì hiện thanh báo, lưới vẫn giữ để còn đổi tháng. */
	Calendar.prototype.load = function () {
		var mk = this.monthKey(this.view), self = this;
		if (this.loaded[mk] || !this.api || !window.fetch) return;
		var r = gridRange(this.view), url = this.api + (this.api.indexOf('?') < 0 ? '?' : '&') + 'from=' + key(r[0]) + '&to=' + key(r[1]);
		this.loading = mk; this.error = false; this.render();
		fetch(url, { credentials: 'same-origin' })
			.then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
			.then(function (list) { self.add(list); self.loaded[mk] = true; })
			.catch(function () { self.error = true; })
			.then(function () { if (self.loading === mk) self.loading = null; self.render(); });
	};

	Calendar.prototype.events = function (d) { return this.byDate[key(d)] || []; };

	Calendar.prototype.month = function () {
		var m = this.view, r = gridRange(m), html = '', busy = this.loading === this.monthKey(m);
		for (var d = new Date(r[0]); d <= r[1]; d = addDays(d, 1)) {
			var i = infoOf(d), ev = this.events(d), cls = ['mlc-day'];
			if (d.getMonth() !== m.getMonth()) cls.push('is-other');
			if (d.getDay() === 0) cls.push('is-sun');
			if (isOff(i)) cls.push('is-off');
			if (i.lunar.day === 1) cls.push('is-first');
			if (i.lunar.day === 15) cls.push('is-full');
			if (key(d) === key(this.today)) cls.push('is-today');
			var label = THU[d.getDay()] + ' ' + dm(d) + ', ngày ' + i.lunar.day + ' tháng ' + i.lunar.month + ' âm lịch' +
				(i.holidays.length ? ', ' + i.holidays.map(function (h) { return h.name; }).join(', ') : '') + (ev.length ? ', ' + ev.length + ' lịch' : '');
			// Ô theo kiểu lịch vạn niên: số dương lớn + chấm hoàng đạo (xanh) / hắc đạo (xám) ở trên; ngày âm nhỏ lệch phải
			// bên dưới; can chi ngày, tên ngày lễ ở giữa; rồi tới lịch làm việc. Ngày đầu tháng dương hoặc mùng 1 âm ghi "ngày/tháng" âm.
			var lunarText = i.lunar.day === 1 || d.getDate() === 1 ? i.lunar.day + '/' + i.lunar.month + (i.lunar.leap ? 'n' : '') : String(i.lunar.day);
			var holiday = i.holidays.length ? i.holidays[0].name : (i.lunar.day === 15 ? 'Ngày rằm' : '');
			var inner = '<span class="mlc-day-top"><span class="mlc-num">' + pad(d.getDate()) + '</span>' +
				'<span class="mlc-sao' + (i.sao.good ? ' is-good' : '') + '" aria-hidden="true"></span></span>' +
				'<span class="mlc-lunar">' + lunarText + '</span>' +
				'<span class="mlc-canchi">' + esc(i.canChi.ngay) + '</span>' +
				(holiday ? '<span class="mlc-hol">' + esc(holiday) + '</span>' : '');
			// Lịch làm việc: hai lịch thì hiện cả hai, từ ba lịch thì hiện một + "K lịch khác".
			var shown = ev.length > 2 ? 1 : ev.length;
			for (var k = 0; k < shown; k++) inner += '<span class="mlc-ev-mini">' + (ev[k].start ? esc(ev[k].start) + ' ' : '') + esc(ev[k].title) + '</span>';
			if (ev.length > shown) inner += '<span class="mlc-more">' + (ev.length - shown) + ' lịch khác</span>';
			inner += '<span class="mlc-dot' + (ev.length ? '' : ' is-none') + '"></span>';
			var sel = key(d) === key(this.selected);
			html += '<button type="button" class="' + cls.join(' ') + '" data-date="' + key(d) + '" aria-pressed="' + sel + '" tabindex="' + (sel ? 0 : -1) + '" aria-label="' + esc(label) + '">' + inner + '</button>';
		}
		return '<div class="mlc-card mlc-month is-big' + (busy ? ' is-busy' : '') + '">' +
			(this.error ? '<div class="mlc-alert" role="alert">Không tải được lịch tháng này. <button type="button" data-act="retry">Thử lại</button></div>' : '') +
			'<div class="mlc-dow" aria-hidden="true">' + THU_NGAN.map(function (t) { return '<div>' + t + '</div>'; }).join('') + '</div>' +
			'<div class="mlc-grid">' + html + '</div>' +
			'<div class="mlc-legend"><span class="mlc-legend-sao"><i class="mlc-sao is-good"></i>Ngày hoàng đạo</span><span class="mlc-legend-sao"><i class="mlc-sao"></i>Ngày hắc đạo</span><span><i class="mlc-today-swatch"></i>Hôm nay</span></div></div>';
	};

	/** Âm lịch của ngày đang chọn. */
	Calendar.prototype.info = function (d) {
		var i = infoOf(d), red = d.getDay() === 0 || isOff(i);
		var tags = '<span class="mlc-tag ' + (i.sao.good ? 'is-good">Hoàng đạo' : 'is-bad">Hắc đạo') + ' · ' + esc(i.sao.name) + '</span>';
		i.holidays.forEach(function (h) { tags += '<span class="mlc-tag is-red">' + esc(h.name) + (h.off ? ' · nghỉ lễ' : '') + '</span>'; });
		var hours = i.gioHoangDao.map(function (g) { return '<span>' + g.chi + ' <small>(' + g.from + '–' + g.to + 'h)</small></span>'; }).join('');
		return '<div class="mlc-card mlc-info">' +
			'<div class="mlc-info-date"><span class="mlc-info-big' + (red ? ' is-red' : '') + '">' + pad(d.getDate()) + '</span><div><div class="mlc-info-title">' +
			THU[d.getDay()] + ', ' + dm(d) + '/' + d.getFullYear() + '</div><div class="mlc-info-lunar">Âm lịch: <b>' + i.lunar.day + ' tháng ' + i.lunar.month +
			(i.lunar.leap ? ' (nhuận)' : '') + '</b> năm ' + esc(i.canChi.nam) + '</div></div></div>' +
			'<div class="mlc-tags">' + tags + '</div>' +
			'<dl class="mlc-facts"><div><dt>Ngày</dt><dd>' + esc(i.canChi.ngay) + '</dd></div><div><dt>Tháng</dt><dd>' + esc(i.canChi.thang) + '</dd></div>' +
			'<div><dt>Tiết khí</dt><dd>' + esc(i.tietKhi) + '</dd></div></dl>' +
			'<div class="mlc-good-hours"><div class="mlc-facts-label">Giờ hoàng đạo</div><div class="mlc-hours">' + hours + '</div></div></div>';
	};

	Calendar.prototype.dayEvents = function (d) {
		var ev = this.events(d), busy = this.loading === this.monthKey(d);
		var body = busy && !ev.length ? '<div class="mlc-wday-empty">Đang tải lịch…</div>'
			: !ev.length ? '<div class="mlc-wday-empty">Không có lịch</div>'
			: '<ul class="mlc-events">' + ev.map(function (e) {
				var meta = [e.location, e.host].filter(Boolean).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('');
				return '<li class="mlc-ev"><span class="mlc-ev-time">' + (e.start ? esc(e.start) + (e.end ? '–' + esc(e.end) : '') : 'Cả ngày') + '</span>' +
					'<span class="mlc-ev-title">' + esc(e.title) + '</span>' + (meta ? '<span class="mlc-ev-meta">' + meta + '</span>' : '') +
					(e.note ? '<span class="mlc-ev-meta mlc-ev-note">' + esc(e.note) + '</span>' : '') + '</li>';
			}).join('') + '</ul>';
		return '<div class="mlc-card mlc-dayevents"><h3 class="mlc-section-title">Lịch làm việc ' + dm(d) + '</h3>' + body + '</div>';
	};

	Calendar.prototype.render = function () {
		var v = this.view, nam = infoOf(new Date(v.getFullYear(), v.getMonth(), 15)).canChi.nam;
		this.root.innerHTML = '<div class="mlc">' +
			'<div class="mlc-head"><div><h2>Tháng ' + (v.getMonth() + 1) + ', ' + v.getFullYear() + '</h2><div class="mlc-sub">Năm ' + esc(nam) + ' (âm lịch)</div></div>' +
			'<div class="mlc-nav"><button class="mlc-btn" type="button" data-act="today">Hôm nay</button>' +
			'<button class="mlc-icon-btn" type="button" data-act="prev" aria-label="Tháng trước">' + ICON.left + '</button>' +
			'<button class="mlc-icon-btn" type="button" data-act="next" aria-label="Tháng sau">' + ICON.right + '</button></div></div>' +
			'<div class="mlc-split">' + this.month() + '<div class="mlc-side" aria-live="polite">' + this.info(this.selected) + this.dayEvents(this.selected) + '</div></div></div>';
	};

	Calendar.prototype.go = function (opts) {
		if (opts.select) {
			this.selected = opts.select;
			if (opts.select.getMonth() !== this.view.getMonth() || opts.select.getFullYear() !== this.view.getFullYear()) {
				this.view = new Date(opts.select.getFullYear(), opts.select.getMonth(), 1);
			}
		}
		if (opts.month) this.view = opts.month;
		this.render();
		this.load();
	};

	Calendar.prototype.onClick = function (e) {
		var t = e.target.closest('[data-act],[data-date]');
		if (!t) return;
		var act = t.getAttribute('data-act');
		if (t.hasAttribute('data-date')) this.go({ select: parse(t.getAttribute('data-date')) });
		else if (act === 'today') this.go({ select: new Date(this.today) });
		else if (act === 'prev' || act === 'next') this.go({ month: new Date(this.view.getFullYear(), this.view.getMonth() + (act === 'next' ? 1 : -1), 1) });
		else if (act === 'retry') { this.error = false; this.load(); }
		var again = this.root.querySelector(t.hasAttribute('data-date') ? '[data-date="' + key(this.selected) + '"]' : '[data-act="' + act + '"]');
		if (again) again.focus({ preventScroll: true });
	};

	/** Phím mũi tên trong lưới: ← → một ngày, ↑ ↓ một tuần. */
	Calendar.prototype.onKey = function (e) {
		var t = e.target.closest && e.target.closest('[data-date]');
		var step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
		if (!t || !step) return;
		e.preventDefault();
		this.go({ select: addDays(parse(t.getAttribute('data-date')), step) });
		var cell = this.root.querySelector('[data-date="' + key(this.selected) + '"]');
		if (cell) cell.focus({ preventScroll: true });
	};

	function boot() {
		document.querySelectorAll('[data-mlc]').forEach(function (el) {
			if (el.mlc) return;
			var cfg = {};
			try { cfg = JSON.parse(el.getAttribute('data-mlc')); } catch (err) {}
			el.mlc = new Calendar(el, cfg);
		});
	}
	window.LLVLich = { boot: boot };
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
