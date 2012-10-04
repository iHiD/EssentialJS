module("Translation tests");

(function(){
	var translations = Resolver("translations");

	translations.declare(["keys",null,"abc","en"],"My ABC");
	translations.declare(["phrases",null,"my abc","en"],"My ABC");

	translations.declare(["keys",null,"url","begin"],"[");
	translations.declare(["keys",null,"url","end"],"]");
	translations.declare(["keys",null,"url","en"],"My URL [url]");
	translations.declare(["phrases",null,"my url","en"],"My URL [url]");

	translations.declare(["keys",null,"login.error","begin"],"[");
	translations.declare(["keys",null,"login.error","end"],"]");
	//TODO translations.declare(["keys",null,"login.error","defaults"],{ user:"?", url:"?"});
	translations.declare(["keys",null,"login.error","en"],"Not logged in with [user] URL [url]");
	translations.declare(["phrases",null,"login error","en"],"Not logged in with [user] URL [url]");

})()

test("Static Translations english",function(){
	var translations = Resolver("translations");
	var _ = Resolver("essential")("translate");

	equal(_("unmatched"),undefined,"Undefined for unmatched keys")
	equal(_({ key:"unmatched" }),undefined)
	equal(_({ phrase:"unmatched phrase" }),"unmatched phrase")

	equal(_("abc"),"My ABC","Phrase for matched key")
	equal(_({ key:"abc" }),"My ABC")
	equal(_({ phrase:"my abc" }),"My ABC")

	equal(_("url",{ url: "http://abc.com"}),"My URL http://abc.com")

	equal(_("login.error",{ url: "http://abc.com", user:"user1" }),"Not logged in with user1 URL http://abc.com")
	equal(_("login.error",{ url: "http://abc.com" }),"Not logged in with [user] URL http://abc.com")
	equal(_("login.error",{ user:"user1" }),"Not logged in with user1 URL [url]")

	ok(1,"{cache:true, key:'abc' } saves resulting template on object")
	ok(1,"reverse translate, phrase -> key -> phrase")
})

module("Console tests");

test("Multi parameter logging",function(){
	ok(1)
})

//TODO eitherClass
// test("ArraySet as classList replacement",function(){
	
// })