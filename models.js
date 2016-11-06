var mysql = require("mysql");
var connection;

// TODO : see if it is possible to make as a constructor so that conenction can be made only once
module.exports = 
{
	// call this function once when the script starts
	startConnection : function()
	{
		connection = mysql.createConnection(
		{
			host : "localhost",
			database : "askchef",
			user : "root",
			password : ""
		});

		connection.connect(function (error)
		{
			if(error)
			{
				console.log("can\'t connect");
				throw error;
			}
		});
	},

	getSearchCategories : function(session, dialogCallBack)
	{
		var data;
		connection.query("SELECT * FROM searchcategories", function(error, rows)
		{
			if(error)
			{
				console.log("rows not found");
				throw error;
			}
			else
			{
				//console.log("log from models " + rows);
				var categoryArray = [];
				for(var i in rows)
				{
					categoryArray[i] = rows[i].category;
				}
				dialogCallBack(session, categoryArray);
			}
		});
	},

	getCuisines : function (session, dialogCallBack)
	{
		var data;
		connection.query("SELECT * FROM cuisine LIMIT 10", function(error, rows)
		{
			if(error)
			{
				console.log("rows not found");
				throw error;
			}
			else
			{
				console.log(rows);
				var cuisineArray = [];
				for(var i in rows)
				{
					cuisineArray[i] = rows[i].name;
				}
				dialogCallBack(session, cuisineArray);
			}
		});
	},

	getRecipesByCuisine :function(session, cuisineName, dialogCallBack)
	{
		var data = cuisineName.toUpperCase();
		console.log(data);
		connection.query("SELECT id FROM cuisine WHERE name=?",[data], function(error, rows)
		{
			if(error)
			{
				console.log("rows not found cuisine 1");
				throw error;
			}
			else
			{
				console.log(rows);
				var id = rows[0].id;
				console.log(id);
				connection.query("SELECT * FROM recipe WHERE cuisineid=?",[id], function(error, rows)
				{
					if(error)
					{
						console.log("rows not found cuisine 2");
						throw error;
					}
					else
					{
						console.log(rows);
						var recipeList = [];
						for(var i in rows)
						{
							recipeList[i] = rows[i].name;
						}
						dialogCallBack(session, recipeList);
					}
				});
			}
		});
	},

	getOccasions : function(session, dialogCallBack)
	{
		var data;
		connection.query("SELECT * FROM occasion", function(error, rows)
		{
			if(error)
			{
				console.log("rows not found");
				throw error;
			}
			else
			{
				console.log(rows);
				var occasionList = [];
				for(var i in rows)
				{
					occasionList[i] = rows[i].name;
				}
				dialogCallBack(session, occasionList);
			}
		})
	},

	getRecipesByOccasion :function(session, occasionName, dialogCallBack)
	{
		var data=occasionName.toUpperCase();
		connection.query("SELECT id FROM occasion WHERE name=?",[data], function(error, rows)
		{
			if(error)
			{
				console.log("rows not found");
				throw error;
			}
			else
			{
				var id = rows[0].id;
				console.log(id);
				connection.query("SELECT * FROM recipe WHERE occasionid=?",[id], function(error, rows)
				{
					if(error)
					{
						console.log("rows not found");
						throw error;
					}
					else
					{
						console.log(rows);
						var recipeList = [];
						for(var i in rows)
						{
							recipeList[i] = rows[i].name;
						}
						dialogCallBack(session, recipeList);
					}
				});
			}
		});
	},

	// getRecipesByIngredient : function(session, ingredientName, dialogCallBack)
	// {
	// 	var data;
	// 	connection.query("SELECT id FROM recipes WHERE upper(name) = upper(ingredientName)", function(error, rows)
	// 	{
	// 		if(error)
	// 		{
	// 			console.log("rows not found");
	// 			throw error;
	// 		}
	// 		else
	// 		{
	// 			var id = rows[0].id;
	// 			connection.query("SELECT * FROM recipe WHERE ingred") 
	// 		}
	// 	})
	// },

	getRecipesByName : function (session, recipeName, dialogCallBack)
	{
		var data=recipeName.toUpperCase();
		connection.query("SELECT * FROM recipe WHERE name = ?",[data], function(error, rows)
		{
			if(error)
			{
				console.log("rows not found");
				throw error;
			}
			else
			{
				var recipe = [];
				recipe[0] = rows[0].name;
				dialogCallBack(session, recipe);
			}
		})
	}
}