var hash;

function setUp()
{
	var ns = { namespace : {} };
	utils.include('hash.jsm', ns);
	hash = ns.namespace.hash;
}

function tearDown()
{
}

function test_compute()
{
	function assertHash(aExpected, aSource, aAlgorithm)
	{
		assert.equals(aExpected, hash.computeHash(aSource, aAlgorithm));
		assert.equals(aExpected, hash[aAlgorithm](aSource));
	}

	assertHash('D9CCE882EE690A5C1CE70BEFF3A78C77', 'hello world', 'md2');
	assertHash('5EB63BBBE01EEED093CB22BB8F5ACDC3', 'hello world', 'md5');
	assertHash('2AAE6C35C94FCFB415DBE95F408B9CE91EE846ED',
	           'hello world', 'sha1');
	assertHash('B94D27B9934D3E08A52E52D7DA7DABFAC484EFE37A5380EE9088F7ACE2EFCDE9',
	           'hello world', 'sha256');
	assertHash('FDBD8E75A67F29F701A4E040385E2E23986303EA10239211AF907FCBB83578B3'+
	           'E417CB71CE646EFD0819DD8C088DE1BD',
	           'hello world', 'sha384');
	assertHash('309ECC489C12D6EB4CC40F50C902F2B4D0ED77EE511A7C7A9BCD3CA86D4CD86F'+
	           '989DD35BC5FF499670DA34255B45B0CFD830E81F605DCF7DC5542E93AE9CD76F',
	           'hello world', 'sha512');
}

function test_computeFromFile()
{
	function assertHash(aExpected, aSource, aAlgorithm)
	{
		assert.equals(aExpected, hash.computeHash(aSource, aAlgorithm));
		assert.equals(aExpected, hash[aAlgorithm](aSource));
	}

	var source = utils.normalizeToFile('fixtures/hash.txt');
	assertHash('4D8F010D437637D3D72E8D935A660757', source, 'md2');
	assertHash('2609A2251E2A1A934A99539BA54D6E55', source, 'md5');
	assertHash('7BD6E50A060F9D63CDD89082CC215025A800333E',
	           source, 'sha1');
	assertHash('23615DDBB04C4F5976DE4D70671A928A1904D15A7E3B573E1E5DADEF24802110',
	           source, 'sha256');
	assertHash('99D9FA2F423643543784685A81C8E86CFC700AA342655264A3B116490BA18E03'+
	           '830F627C4E4A4DA00142569BC836E8E3',
	           source, 'sha384');
	assertHash('871F8CFEAA2C091376C21E3142605BE19E77C1D61DC96D39E9BBCBEC3D4753DC'+
	           'CA25CBAEC62C33A3AC0930B5B757FEBB3419809C2E97FDD640FD21EDC4A4733E',
	           source, 'sha512');
}
