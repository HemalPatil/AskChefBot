var builder = require("botbuilder");

// create connector
//var connector = new builder.ConsoleConnector().listen();
var connector = new builder.ChatConnector();

// create bot
var bot = new builder.UniversalBot(connector);

// '/' is the root dialog
// this root dialog of the conversation should start only when user logs in for first time or after the entire recipe is cooked
// TODO : start conversation after recipe complete instead of asking what to cook, ask choice based on previous recipe
bot.dialog("/", 
[
	function (session, args, next)
	{
		session.send("Hello user!");	// TODO : replace "user" with the actual user's name
		if(!session.conservationData.whatToCook)
		{
			session.beginDialog("/whatToCook");
		}
	},
	function (session, results)
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
		
		builder.Prompts.choice(session, "What do you want to cook today?", );
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