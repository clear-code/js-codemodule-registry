// -*- indent-tabs-mode: t; tab-width: 4 -*-

var isWindows = navigator.platform.toLowerCase().indexOf('win32') > -1;

var registry;

function clearKey(aRoot, aPath)
{
	try {
		var regKey = Cc['@mozilla.org/windows-registry-key;1']
						.createInstance(Ci.nsIWindowsRegKey);
		regKey.open(aRoot, aPath, Ci.nsIWindowsRegKey.ACCESS_ALL);
		try {
			let values = [];
			for (let i = 0, maxi = regKey.valueCount; i < maxi; i++)
			{
				values.push(regKey.getValueName(i));
			}
			values.forEach(function(aName) {
				regKey.removeValue(aName);
			});
		}
		catch(e) {
		}
		try {
			let children = [];
			for (let i = 0, maxi = regKey.childCount; i < maxi; i++)
			{
				children.push(regKey.getChildName(i));
			}
			children.forEach(function(aName) {
				clearKey(aRoot, aPath+'\\'+aName);
			});
		}
		catch(e) {
		}
		regKey.close();
	}
	catch(e) {
	}

	aPath = aPath.replace(/\\([^\\]+)$/, '');
	var name = RegExp.$1;
	var parentRegKey = Cc['@mozilla.org/windows-registry-key;1']
					.createInstance(Ci.nsIWindowsRegKey);
	try {
		parentRegKey.open(aRoot, aPath, Ci.nsIWindowsRegKey.ACCESS_ALL);
		try {
			if (parentRegKey.hasChild(name))
				parentRegKey.removeChild(name);
		}
		catch(e) {
			parentRegKey.close();
			throw e;
		}
		finally {
			parentRegKey.close();
		}
	}
	catch(e) {
	}
}

function clearRoot()
{
	clearKey(
		Ci.nsIWindowsRegKey.ROOT_KEY_CURRENT_USER,
		'HKCU\\Software\\ClearCode Inc.\\JSCodeModule'
	);
}

function startUp()
{
	clearRoot();
}

function shutDown()
{
	clearRoot();
}


function setUp()
{
	var ns = { namespace : {} };
	utils.include('registry.jsm', ns);
	registry = ns.namespace.registry;

}

function tearDown()
{
}

test__splitKey.setUp = clearRoot;
test__splitKey.tearDown = clearRoot;
function test__splitKey()
{
	function assertSplitKey(aExpected, aInput)
	{
		if (isWindows) {
			assert.equals(
				aExpected,
				registry._splitKey(aInput)
			);
		}
		else {
			assert.raises(
				registry.ERROR_PLATFORM_IS_NOT_WINDOWS,
				function() {
					registry._splitKey(aInput)
				}
			);
		}
	}

	assertSplitKey(
		[Ci.nsIWindowsRegKey.ROOT_KEY_CLASSES_ROOT,
		 '.txt',
		 'Content Type'],
		'HKEY_CLASSES_ROOT\\.txt\\Content Type'
	);
	assertSplitKey(
		[Ci.nsIWindowsRegKey.ROOT_KEY_CLASSES_ROOT,
		 '.txt',
		 'Content Type'],
		'HKCR\\.txt\\Content Type'
	);

	assertSplitKey(
		[Ci.nsIWindowsRegKey.ROOT_KEY_CURRENT_USER,
		 'Software\\Microsoft\\Windows\\'+
			'CurrentVersion\\Internet Settings',
		 'MigrateProxy'],
		'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\'+
			'CurrentVersion\\Internet Settings\\MigrateProxy'
	);
	assertSplitKey(
		[Ci.nsIWindowsRegKey.ROOT_KEY_CURRENT_USER,
		 'Software\\Microsoft\\Windows\\'+
			'CurrentVersion\\Internet Settings',
		 'MigrateProxy'],
		'HKCU\\Software\\Microsoft\\Windows\\'+
			'CurrentVersion\\Internet Settings\\MigrateProxy'
	);

	assertSplitKey(
		[Ci.nsIWindowsRegKey.ROOT_KEY_LOCAL_MACHINE,
		 'SOFTWARE\\Microsoft\\Windows\\CurrentVersion',
		 'ProgramFilesPath'],
		'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\'+
			'CurrentVersion\\ProgramFilesPath'
	);
	assertSplitKey(
		[Ci.nsIWindowsRegKey.ROOT_KEY_LOCAL_MACHINE,
		 'SOFTWARE\\Microsoft\\Windows\\CurrentVersion',
		 'ProgramFilesPath'],
		'HKLM\\SOFTWARE\\Microsoft\\Windows\\'+
			'CurrentVersion\\ProgramFilesPath'
	);

	assertSplitKey(
		[-1,
		 'Path',
		 'Name'],
		'UNKNOWN\\Path\\Name'
	);
}

test_getValue.setUp = clearRoot;
test_getValue.tearDown = clearRoot;
function test_getValue()
{
	function assertGetValue(aExpected, aKey)
	{
		if (isWindows) {
			assert.strictlyEquals(
				aExpected,
				registry.getValue(aKey)
			);
		}
		else {
			assert.raises(
				registry.ERROR_PLATFORM_IS_NOT_WINDOWS,
				function() {
					registry.getValue(aKey)
				}
			);
		}
	}

	// REG_SZ
	assertGetValue(
		'text/plain',
		'HKCR\\.txt\\Content Type'
	);
	// REG_DWORD
	assertGetValue(
		0,
		'HKLM\\Software\\Microsoft\\Windows\\'+
			'CurrentVersion\\explorer\\Advanced\\TaskbarSizeMove'
	);
}

var testData = [
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-string',
		  value    : 'string' },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-string',
		  value    : true,
		  expected : 'true' },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-string',
		  value    : 29,
		  expected : '29' },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-number',
		  value    : 29 },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-number',
		  value    : '2929',
		  expected : 2929 },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-number',
		  value    : true,
		  expected : 1 },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-number',
		  value    : false,
		  expected : 0 },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-binary',
		  value    : [0, 2, 9, 29] },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-binary',
		  value    : 97,
		  expected : [97] },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-binary',
		  value    : 'b',
		  expected : [98] },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-binary',
		  value    : [true, false],
		  error    : 'Failed to write new value!' },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-binary',
		  value    : ['a', 'b'],
		  error    : 'Failed to write new value!' },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-binary',
		  value    : [{ value : true }, { value : false }],
		  error    : 'Failed to write new value!' }
	];

if (isWindows) {
	test_setValue.setUp = clearRoot;
	test_setValue.tearDown = clearRoot;
}
test_setValue.parameters = testData;
function test_setValue(aData)
{
	if (isWindows) {
		if (aData.error) {
			assert.raises(
				aData.error,
				function() {
					registry.setValue(aData.key, aData.value)
				}
			);
		}
		else {
			registry.setValue(aData.key, aData.value);
			assert.strictlyEquals(
				('expected' in aData ? aData.expected : aData.value ),
				registry.getValue(aData.key)
			);
		}
	}
	else {
		assert.raises(
			registry.ERROR_PLATFORM_IS_NOT_WINDOWS,
			function() {
				registry.setValue(aData.key, aData.value)
			}
		);
	}
}

test_clear.shouldSkip = !isWindows;
test_clear.setUp = function() {
	clearRoot();
	testData.forEach(function(aData) {
		if (aData.error) return;
		registry.setValue(aData.key, aData.value);
		assert.strictlyEquals(
			('expected' in aData ? aData.expected : aData.value ),
			registry.getValue(aData.key)
		);
	});
};
test_clear.tearDown = function() {
	clearRoot();
};
function test_clear()
{
	registry.clear('HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-string');
	assert.isNull(registry.getValue('HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-string'));

	registry.clear('HKCU\\Software\\ClearCode Inc.\\JSCodeModule');
	testData.forEach(function(aData) {
		assert.isNull(registry.getValue(aData.key));
	});
}
