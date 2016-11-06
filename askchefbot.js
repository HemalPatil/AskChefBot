var builder = require("botbuilder");
var model = require("./models.js");

// create connector
//var connector = new builder.ConsoleConnector().listen();
var connector = new builder.ChatConnector();

// create bot
var bot = new builder.UniversalBot(connector);

// connect to database
model.startConnection();

// '/' is the root dialog
bot.dialog("/", 
[
	function (session, args, next)
	{
		session.send("Hello user!");	// TODO : replace "user" with the actual user's name
		if(!session.userData.whatToCook)
		{
			session.beginDialog("/whatToCook");
		}
	},
	function (session, results, next)
	{
		session.userData.whatToCook = results.response.entity;
		session.send("Let me search the recipe for " + session.userData.whatToCook);
	}
]);

function showWhatToCookPromptCallBack(session, array)
{
	builder.Prompts.choice(session, "What do you have in mind? You can search recipes by these options or by name", array);
}

function showCuisinePromptCallBack(session, array)
{
	builder.Prompts.choice(session, "Choose a cuisine", array);
}

function showOccasionPromptCallBack(session, array)
{
	builder.Prompts.choice(session, "Choose an occasion", array);
}

function showRecipeListPromptCallBack(session, array)
{
	console.log(array);
	builder.Prompts.choice(session, "How about these?", array);
}

bot.dialog("/whatToCook",
[
	function (session, args, next)
	{
		model.getSearchCategories(session, showWhatToCookPromptCallBack);
	},
	function (session, results, next)
	{
		switch(results.response.entity.toLowerCase())
		{
			case "cuisine" :
				session.beginDialog("/getRecipeByCuisine");
				break;
			case "occasion" :
				session.beginDialog("/getRecipeByOccasion");
				break;
			case "ingredient" :
				session.beginDialog("/getRecipeByIngredient");
				break;
			case "recipe name" :
				session.beginDialog("/getRecipeByName");
				break;
			default:
				session.send("I did not get you. Please select an option.");
				break;
		}
	},
	function(session, results, next)
	{
		console.log(results.response.entity);
		session.send("Let's cook "+ results.response.entity);
	},
	function (session, results)
	{
		session.endDialogWithResult(results);
	}
]);

bot.dialog("/getRecipeByCuisine",
[
	function(session, args, next)
	{
		model.getCuisines(session, showCuisinePromptCallBack);
	},
	function(session, results, next)
	{
		var cuisineName = results.response.entity;
		model.getRecipesByCuisine(session, cuisineName, showRecipeListPromptCallBack);
	},
	function(session, results, next)
	{
		console.log(results);
		var recipeName = [];
		recipeName[0] = results.response.entity;
		var yes = ["YES", "NO"];
		session.userData.whatToCook = recipeName[0];
		builder.Prompts.choice(session, "Let's cook " + recipeName, yes);
	},
	function(session, results, next)
	{
		if(results.response.entity == "YES")
		{
			session.beginDialog("/recipeIngredients");
		}		
		else session.replaceDialog("/whatToCook");
	}
]);

bot.dialog("/getRecipeByOccasion",
[
	function(session, args, next)
	{
		model.getOccasions(session, showOccasionPromptCallBack);
	},
	function(session, results, next)
	{
		var occasionName = results.response.entity;
		model.getRecipesByOccasion(session, occasionName, showRecipeListPromptCallBack);
	},
	function(session, results, next)
	{
		var recipeName = [];
		recipeName[0] = results.response.entity;
		var yes = ["YES", "NO"];
		session.userData.whatToCook = recipeName[0];
		builder.Prompts.choice(session, "Let's cook "+recipeName, yes);
	},
	function(session, results, next)
	{
		if(results.response.entity == "YES") 
		{
			session.beginDialog("/recipeIngredients");
		}
		else session.replaceDialog("/whatToCook");
	}
]);

bot.dialog("/getRecipeByIngredient",
[
	function(session, args, next)
	{
		builder.Prompts.text(session, "Enter the name of the ingredient.");
	},
	function(session, results, next)
	{
		var ingredientName = results.response;
		model.getRecipesByIngredient(session, ingredientName, showRecipeListPromptCallBack);
	},
	function(session, results)
	{
		session.endDialogWithResult(results);
	}
]);

bot.dialog("/getRecipeByName",
[
	function(session, args, next)
	{
		builder.Prompts.text(session, "Enter the name of the recipe.");
	},
	function(session, results, next)
	{
		var recipeName = results.response;
		model.getRecipesByName(session, recipeName, showRecipeListPromptCallBack);
	},
	function(session, results, next)
	{
		var recipeName = results.response.entity;
		var yes = ["YES", "NO"];
		session.userData.whatToCook = recipeName;
		console.log("recipe name lolz " + session.userData.whatToCook);
		builder.Prompts.choice(session, "Let's cook " + recipeName, yes);
	},
	function(session, results, next)
	{
		console.log("recipe name lolwa " + session.userData.whatToCook);
		if(results.response.entity == "YES") 
		{
			session.beginDialog("/recipeIngredients");
		}
		else
		{
			session.userData.whatToCook = null;
			session.replaceDialog("/whatToCook")
		}
	},
	function(session, results)
	{
		session.endDialogWithResult(results);
	}
]);

function recipeIngredientsCallBack(session, ingredientsArray)
{
	session.send("The ingredients are : ");
	for(var i in ingredientsArray)
	{
		session.send(ingredientsArray[i]);
	}
	builder.Prompts.choice(session, "All set?", ["DONE"]);
}

bot.dialog("/recipeIngredients",
[
	function(session, args, next)
	{
		var recipe = session.userData.whatToCook;
		console.log("recipe steps " + recipe);
		model.getRecipeIngredients(session, recipe, recipeIngredientsCallBack);
	},
	function(session, results, next)
	{
		if(results.response.entity == "DONE")
		{
			session.userData.stepCount=1;
			session.send("Let's start making " + session.userData.whatToCook + " then.");
			session.beginDialog("/recipeSteps");
		}
	}
]);

function showRecipeStepCallBack(session, step)
{
	console.log("step callback : " + step);
	if(step != model.endOfRecipe)
	{
		session.send(step.step);
		builder.Prompts.choice(session, "Are you done? ", ["DONE"]);
	}
	else
	{
		session.send("Happy fooding!");
	}
}

bot.dialog("/recipeSteps",
[
	function(session, args, next)
	{
		console.log("recipe steps " + session.userData.stepCount + " " + session.userData.whatToCook);
		model.getRecipeSteps(session, session.userData.whatToCook, session.userData.stepCount, showRecipeStepCallBack);
	},
	function(session, results, next)
	{
		if(results.response.entity=="DONE")
		{
			session.userData.stepCount++;
			session.replaceDialog("/recipeSteps");
		}
		else
		{
			session.userData.stepCount=null;
			session.endConversation();
		}
	}
]);

// create server
var restify = require("restify");
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function ()
{
	console.log("%s listening to %s", server.name, server.url); 
});
server.post("/api/messages", connector.listen());