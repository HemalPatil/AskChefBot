var builder = require("botbuilder");

// create connector
//var connector = new builder.ConsoleConnector().listen();
var connector = new builder.ChatConnector();

// create bot
var bot = new builder.UniversalBot(connector);

// '/' is the root dialog
bot.dialog("/", 
[
	function (session, args, next)
	{
		session.send("Hello user!");	// TODO : replace "user" with the actual user's name
		if(!session.conversationData.whatToCook)
		{
			session.beginDialog("/whatToCook");
		}
	},
	function (session, results, next)
	{
		session.conversationData.whatToCook = results.response;
		session.send("So you want to cook " + session.conversationData.whatToCook + " today");
		session.send("Let me search the recipe for it!");
	}
]);

bot.dialog("/whatToCook",
[
	function (session)
	{
		builder.Prompts.text(session, "What do you want to cook today?");
	},
	function (session, results)
	{
		session.endDialogWithResult(results);
	}
])

// create server
var restify = require("restify");
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function ()
{
	console.log("%s listening to %s", server.name, server.url); 
});
server.post("/api/messages", connector.listen());