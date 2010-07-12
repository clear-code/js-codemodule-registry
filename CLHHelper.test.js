var CLHHelper;

var DELIMITER = navigator.platform.toLowerCase().indexOf('win') > -1 ? '\\' : '/' ;

function CommandLineStub(aOptions) {
	this._options = aOptions || {};
}
CommandLineStub.prototype = {
	handleFlag : function(aFlag, aCaseSensitive)
	{
		aFlag = '-'+aFlag;
		if (aFlag in this._options) {
			delete  this._options[aFlag];
			return true;
		}
		else {
			return false;
		}
	},
	handleFlagWithParam : function(aFlag, aCaseSensitive)
	{
		aFlag = '-'+aFlag;
		if (aFlag in this._options) {
			if (!this._options[aFlag])
				throw Components.results.NS_ERROR_INVALID_ARG;
			let value = this._options[aFlag];
			delete  this._options[aFlag];
			return value;
		}
		else {
			return null;
		}
	},
	resolveFile : function(aPath)
	{
		var file = utils.getFileFromURLSpec(utils.baseURL);
		aPath.split(DELIMITER).forEach(function(aPart) {
			file.append(aPart);
		});
		return file;
	},
	resolveURI : function(aPath)
	{
	}
};

function setUp()
{
	commandLineStub = new CommandLineStub({
		'-option-boolean' : null,
		'-option-int'     : '29',
		'-option-num'     : '29.29',
		'-option-string'  : 'string',
		'-option-path'    : 'CLHHelper.jsm'
	});

	var ns = { namespace : {} };
	utils.include('CLHHelper.jsm', ns);
	CLHHelper = ns.namespace.CLHHelper;
}

function tearDown()
{
}


function test_getBooleanValue()
{
	assert.isTrue(CLHHelper.getBooleanValue('option-boolean', commandLineStub));
	assert.isTrue(CLHHelper.getBooleanValue('-option-int', commandLineStub));
	assert.isFalse(CLHHelper.getBooleanValue('option-undefined', commandLineStub));
}

function test_getNumericValue()
{
	assert.equals(29, CLHHelper.getNumericValue('option-int', commandLineStub));
	assert.equals(29.29, CLHHelper.getNumericValue('option-num', commandLineStub));
	assert.equals(29, CLHHelper.getNumericValue('option-undefined', commandLineStub, 29));
}

function test_getStringValue()
{
	assert.equals('string', CLHHelper.getStringValue('option-string', commandLineStub));
	assert.equals('default', CLHHelper.getStringValue('option-undefined', commandLineStub, 'default'));
}

function test_getFullPath()
{
	var expected = utils.getFileFromURLSpec(utils.baseURL);
	expected.append('CLHHelper.jsm');
	assert.equals(expected.path, CLHHelper.getFullPath('option-path', commandLineStub));
}

function test_formatHelpInfo()
{
	var expected = <![CDATA[
  -option1             description1
  -option2-too-long-name
                       description2
  -option3             description3 this is too long this is too long this
                       is too long
  -option4-too-long-name
                       description4 this is too long this is too long this
                       is too long
]]>.toString().replace(/^\n/, '');

	assert.equals(
		expected,
		CLHHelper.formatHelpInfo({
			'option1' : 'description1',
			'-option2-too-long-name' : 'description2',
			'option3' : 'description3 this is too long this is too long this is too long',
			'-option4-too-long-name' : 'description4 this is too long this is too long this is too long'
		})
	);
}

