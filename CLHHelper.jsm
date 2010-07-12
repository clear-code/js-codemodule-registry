/*
 Command Line Handlers helper library for Firefox 3.5 or later

 Usage:
   Components.utils.import('resource://my-modules/CLHHelper.jsm');
   CommandLineHandler.prototype.handle = function(aCommandLine) {
     var args = {
          server     : CLHHelper.getBooleanValue('boolean-option', aCommandLine),
          serverPort : CLHHelper.getNumericValue('numeric-option', aCommandLine, 0),
          outputHost : CLHHelper.getStringValue('string-option', aCommandLine, ''),
          testcase   : CLHHelper.getFullPath('path-option', aCommandLine, '')
       };
   };

 lisence: The MIT License, Copyright (c) 2010 ClearCode Inc.
   http://www.clear-code.com/repos/svn/js-codemodules/license.txt
 original:
   http://www.clear-code.com/repos/svn/js-codemodules/CLHHelper.jsm
*/

const EXPORTED_SYMBOLS = ['CLHHelper'];

// If namespace.jsm is available, export symbols to the shared namespace.
// See: http://www.cozmixng.org/repos/piro/fx3-compatibility-lib/trunk/namespace.jsm
var namespace;
try {
	let ns = {};
	Components.utils.import('resource://my-modules/namespace.jsm', ns);
	namespace = ns.getNamespaceFor('clear-code.com');
}
catch(e) {
	namespace = {};
}

(function() {
	const currentRevision = 1;

	var loadedRevision = 'CLHHelper' in namespace ?
			namespace.CLHHelper.revision :
			0 ;
	if (loadedRevision && loadedRevision > currentRevision) {
		return;
	}

	const Cc = Components.classes;
	const Ci = Components.interfaces;

	namespace.CLHHelper = {
		revision : currentRevision,

		_getValue : function(aOption, aCommandLine, aDefaultValue) 
		{
			if (aDefaultValue === void(0)) aDefaultValue = '';
			try {
				return aCommandLine.handleFlagWithParam(aOption, false);
			}
			catch(e) {
			}
			return aDefaultValue;
		},
	 
		getBooleanValue : function(aOption, aCommandLine) 
		{
			try {
				if (aCommandLine.handleFlag(aOption, false)) {
					return true;
				}
			}
			catch(e) {
			}
			return false;
		},
 
		getNumericValue : function(aOption, aCommandLine, aDefaultValue) 
		{
			if (!aDefaultValue) aDefaultValue = 0;
			var value = this._getValue(aOption, aCommandLine, aDefaultValue);
			if (!value) return aDefaultValue;
			value = parseInt(value);
			return isNaN(value) ? aDefaultValue : value ;
		},
 
		getStringValue : function(aOption, aCommandLine, aDefaultValue) 
		{
			retrun this._getValue(aOption, aCommandLine, aDefaultValue);
		},

		getFullPath : function(aOption, aCommandLine, aDefaultValue) 
		{
			if (!aDefaultValue) aDefaultValue = '';
			var value = this._getValue(aOption, aCommandLine, aDefaultValue);
			if (!value) return aDefaultValue;
			if (value.indexOf('/') < 0) {
				value = aCommandLine.resolveFile(value);
				return value.path;
			}
			else {
				value = aCommandLine.resolveURI(value);
				return value.spec;
			}
		}

	};
})();

var CLHHelper = namespace.CLHHelper;
