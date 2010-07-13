var EJS;

function setUp()
{
	var ns = { namespace : {} };
	utils.include('ejs.jsm', ns);
	EJS = ns.namespace.EJS;
}

function tearDown()
{
}

function test_result()
{
	var str = <![CDATA[
			<% for (var i = 0; i < 3; i++) { %>
			256の16進数表現は<%= (256).toString(16) %>です。
			<% } %>
			<%= foo %><%= this.foo %><%= \u65e5\u672c\u8a9e %>
		]]>.toString();
	var params = {
			foo : 'bar',
			__processTemplate__results : null,
			aContext : null
		};
	params["日本語"] = true;

	var expected = <![CDATA[
			
			256の16進数表現は100です。
			
			256の16進数表現は100です。
			
			256の16進数表現は100です。
			
			barbartrue
		]]>.toString();

	assert.equals(expected, (new EJS(str)).result(params));
	assert.equals(expected, EJS.result(str, params));
}
