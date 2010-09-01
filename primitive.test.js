var primitive;

function setUp()
{
	primitive = utils.import('primitive.jsm', {}).primitive;
}

function tearDown()
{
}

function test_toVariant()
{
	assert.isInstanceOf(Ci.nsIVariant, primitive.toVariant('string'));
	assert.isInstanceOf(Ci.nsIVariant, primitive.toVariant(true));
	assert.isInstanceOf(Ci.nsIVariant, primitive.toVariant(29));
	assert.isInstanceOf(Ci.nsIVariant, primitive.toVariant({ value : true }));
	assert.isInstanceOf(Ci.nsIVariant, primitive.toVariant([0, 1, 2]));
	assert.isInstanceOf(Ci.nsIDOMWindow, primitive.toVariant(window));
	assert.isInstanceOf(Ci.nsIDOMDocument, primitive.toVariant(document));
}

function test_toSupportsArray()
{
	var source = [
			'string',
			true,
			29,
			{ value : true },
			[0, 1, 2],
			window,
			document
		];
	var array = primitive.toSupportsArray(source);
	assert.isInstanceOf(Ci.nsISupportsArray, array);
	array.QueryInterface(Ci.nsICollection);
	assert.equals(source.length, array.Count());
	assert.isInstanceOf(Ci.nsIVariant, array.GetElementAt(0));
	assert.isInstanceOf(Ci.nsIVariant, array.GetElementAt(1));
	assert.isInstanceOf(Ci.nsIVariant, array.GetElementAt(2));
	assert.isInstanceOf(Ci.nsIVariant, array.GetElementAt(3));
	assert.isInstanceOf(Ci.nsIVariant, array.GetElementAt(4));
	assert.isInstanceOf(Ci.nsIDOMWindow, array.GetElementAt(5));
	assert.isInstanceOf(Ci.nsIDOMDocument, array.GetElementAt(6));
}

function test_toPropertyBag()
{
	var hash = {
			string   : 'string',
			bool     : true,
			number   : 29,
			hash     : { value : true },
			array    : [0, 1, 2],
			window   : window,
			document : document
		};
	var bag = primitive.toPropertyBag(hash);
	assert.isInstanceOf(Ci.nsIPropertyBag, bag);
	assert.equals(hash.string, bag.getProperty('string'));
	assert.equals(hash.bool, bag.getProperty('bool'));
	assert.equals(hash.number, bag.getProperty('number'));
	assert.equals(hash.hash, bag.getProperty('hash'));
	assert.equals(hash.array, bag.getProperty('array'));
	assert.equals(hash.window, bag.getProperty('window'));
	assert.equals(hash.document, bag.getProperty('document'));
}

function test_toHash()
{
	var bag = Cc['@mozilla.org/hash-property-bag;1']
				.createInstance(Ci.nsIWritablePropertyBag);
	bag.setProperty('string', 'string');
	bag.setProperty('bool', true);
	bag.setProperty('number', 29);
	bag.setProperty('hash', { value : true });
	bag.setProperty('array', [0, 1, 2]);
	bag.setProperty('window', window);
	bag.setProperty('document', document);

	var hash = primitive.toHash(bag);
	assert.equals(
		{
			string   : 'string',
			bool     : true,
			number   : 29,
			hash     : { value : true },
			array    : [0, 1, 2],
			window   : window,
			document : document
		},
		hash
	);
}

function test_export()
{
	var ns = {};
	primitive.export(ns);
	assert.isFunction(ns.toVariant);
	assert.isFunction(ns.toSupportsArray);
	assert.isFunction(ns.toPropertyBag);
	assert.isFunction(ns.toHash);
}

