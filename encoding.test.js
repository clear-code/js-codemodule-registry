var encoding;

var utf8String = atob('5pel5pys6Kqe');
var sjisString = atob('k/qWe4zq');
var ucs2String = decodeURIComponent(escape(utf8String));

function setUp()
{
	var ns = { namespace : {} };
	utils.include('encoding.jsm', ns);
	encoding = ns.namespace.encoding;
}

function tearDown()
{
}

function test_convertEncoding()
{
	assert.equals(ucs2String, encoding.UTF8ToUnicode(utf8String));
	assert.equals(ucs2String, encoding.UTF8ToUCS2(utf8String));
	assert.equals(utf8String, encoding.UnicodeToUTF8(ucs2String));
	assert.equals(utf8String, encoding.UCS2ToUTF8(ucs2String));

	assert.equals('日本語', encoding.XToUnicode(sjisString, 'Shift_JIS'));
	assert.equals('日本語', encoding.XToUCS2(sjisString, 'Shift_JIS'));
	assert.equals(sjisString, encoding.UnicodeToX('日本語', 'Shift_JIS'));
	assert.equals(sjisString, encoding.UCS2ToX('日本語', 'Shift_JIS'));
}

function test_export()
{
	var ns = {};
	encoding.export(ns);

	assert.equals(ucs2String, ns.UTF8ToUnicode.call(null, utf8String));
	assert.equals(ucs2String, ns.UTF8ToUCS2.call(null, utf8String));
	assert.equals(utf8String, ns.UnicodeToUTF8.call(null, ucs2String));
	assert.equals(utf8String, ns.UCS2ToUTF8.call(null, ucs2String));

	assert.equals('日本語', ns.XToUnicode.call(null, sjisString, 'Shift_JIS'));
	assert.equals('日本語', ns.XToUCS2.call(null, sjisString, 'Shift_JIS'));
	assert.equals(sjisString, ns.UnicodeToX.call(null, '日本語', 'Shift_JIS'));
	assert.equals(sjisString, ns.UCS2ToX.call(null, '日本語', 'Shift_JIS'));
}
