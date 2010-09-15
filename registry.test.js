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
	if (!isWindows) return;
	clearKey(
		Ci.nsIWindowsRegKey.ROOT_KEY_CURRENT_USER,
		'HKCU\\Software\\ClearCode Inc.\\JSCodeModule'
	);
	utils.wait(100);
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
	clearRoot();

}

function tearDown()
{
}

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
		[Ci.nsIWindowsRegKey.ROOT_KEY_CLASSES_ROOT,
		 '.txt',
		 ''],
		'HKCR\\.txt\\'
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
		[Ci.nsIWindowsRegKey.ROOT_KEY_CURRENT_USER,
		 'Software\\Microsoft\\Windows\\'+
			'CurrentVersion\\Internet Settings',
		 ''],
		'HKCU\\Software\\Microsoft\\Windows\\'+
			'CurrentVersion\\Internet Settings\\'
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
		[Ci.nsIWindowsRegKey.ROOT_KEY_LOCAL_MACHINE,
		 'SOFTWARE\\Microsoft\\Windows\\CurrentVersion',
		 ''],
		'HKLM\\SOFTWARE\\Microsoft\\Windows\\'+
			'CurrentVersion\\'
	);

	assertSplitKey(
		[-1,
		 'Path',
		 'Name'],
		'UNKNOWN\\Path\\Name'
	);
	assertSplitKey(
		[-1,
		 'Path',
		 ''],
		'UNKNOWN\\Path\\'
	);
}

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
	// REG_EXPAND_SZ, default value
	assertGetValue(
		'lnkfile',
		'HKCR\\.lnk\\'
	);
}

var testData = [
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-string',
		  value    : 'string' },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-number',
		  value    : 29 },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-binary',
		  value    : [0, 2, 9, 29] },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-default\\',
		  value    : 'default' }
	];

test_setValue.parameters = testData;
function test_setValue(aData)
{
	if (isWindows) {
		registry.setValue(aData.key, aData.value);
		assert.strictlyEquals(aData.value, registry.getValue(aData.key));
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

test_setValue_overwrite.shouldSkip = !isWindows;
test_setValue_overwrite.parameters = [
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-string',
		  old      : 's',
		  value    : true,
		  expected : 'true' },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-string',
		  old      : 's',
		  value    : 29,
		  expected : '29' },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-number',
		  old      : 0,
		  value    : '2929',
		  expected : 2929 },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-number',
		  old      : 0,
		  value    : true,
		  expected : 1 },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-number',
		  old      : 0,
		  value    : false,
		  expected : 0 },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-binary',
		  old      : [0],
		  value    : 97,
		  expected : [97] },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-binary',
		  old      : [0],
		  value    : 'b',
		  expected : [98] },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-binary',
		  old      : [0],
		  value    : [true, false],
		  error    : { message  : 'Failed to write new value!',
		               reason   : 'blob contains invalid byte' } },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-binary',
		  old      : [0],
		  value    : ['a', 'b'],
		  error    : { message  : 'Failed to write new value!',
		               reason   : 'blob contains invalid byte' } },
		{ key      : 'HKCU\\Software\\ClearCode Inc.\\JSCodeModule\\test\\test-binary',
		  old      : [0],
		  value    : [{ value : true }, { value : false }],
		  error    : { message  : 'Failed to write new value!',
		               reason   : 'blob contains invalid byte' } }
	];
test_setValue_overwrite.setUp = function(aData)
{
	registry.setValue(aData.key, aData.old);
}
function test_setValue_overwrite(aData)
{
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
		assert.strictlyEquals(aData.expected, registry.getValue(aData.key));
	}
}

test_clear.shouldSkip = !isWindows;
test_clear.setUp = function() {
	testData.forEach(function(aData) {
		if (aData.error || registry.getValue(aData.key) !== null)
			return;
		registry.setValue(aData.key, aData.value);
		assert.strictlyEquals(aData.value, registry.getValue(aData.key));
	});
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
