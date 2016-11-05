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
	}
}