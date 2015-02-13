var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
var faker = require("faker");
var fs = require("fs");
faker.locale = "en";
//Random = require('random-js')
var mock = require('mock-fs');
var _ = require('underscore');

function main()
{
	var args = process.argv.slice(2);

	if( args.length == 0 )
	{
		args = ["subject.js"];
	}
	var filePath = args[0];

	constraints(filePath);

	generateTestCases()

}


function fakeDemo()
{
	console.log( faker.phone.phoneNumber() );
	console.log( faker.phone.phoneNumberFormat() );
	console.log( faker.phone.phoneFormats() );

}

var functionConstraints =
{
}

var mockFileLibrary = 
{
	pathExists:
	{
		'path/fileExists': {}
	},
	fileWithContent:
	{
		pathContent: 
		{	
  			file1: 'text content',
  					
		}

	},
	fileWithNoContent:
	{
		pathContent: 
		{	
  			file1: '',
		}
	}

};

function generateTestCases()
{

	var content = "var subject = require('./subject.js')\nvar mock = require('mock-fs');\n";
	for ( var funcName in functionConstraints )
	{
		var params = {};

		// initialize params
		for (var i =0; i < functionConstraints[funcName].params.length; i++ )
		{
			var paramName = functionConstraints[funcName].params[i];
			//params[paramName] = '\'' + faker.phone.phoneNumber()+'\'';
			params[paramName] = '\'\'';
		}
		//debugstmt
		console.log( params );

		// update parameter values based on known constraints.
		var constraints = functionConstraints[funcName].constraints;
		// Handle global constraints...
		var fileWithContent = _.some(constraints, {mocking: 'fileWithContent' });
		var pathExists      = _.some(constraints, {mocking: 'fileExists' });
		var fileWithNoContent = _.some(constraints, {mocking: 'fileWithNoContent'});

		var areacode = _.some(constraints,{ident:'phoneNumber'});
		var arg_one = _.some(constraints,{ident:'p'});
		var arg_two = _.some(constraints,{ident:'q'});
		var normtrue = _.some(constraints,{value:true});
		var normfalse = _.some(constraints,{value:false});


		for( var c = 0; c < constraints.length; c++ )
		{
			var constraint = constraints[c];
			//debugstmt
			//console.log("i am the constraint"+ constraint)
			if( params.hasOwnProperty( constraint.ident ) )
			{
				params[constraint.ident] = constraint.value;
			}
		}

		// Prepare function arguments.
		var args = Object.keys(params).map( function(k) {return params[k]; }).join(",");
		//debugstmt
		console.log(args)



		 if( pathExists || fileWithContent )
		{
			content += generateMockFsTestCases(pathExists,fileWithContent,funcName, 'CheckEmptyBuf');
			content += generateMockFsTestCases(pathExists,fileWithContent,funcName, args);
			// Bonus...generate constraint variations test cases....
			content += generateMockFsTestCases(!pathExists,!fileWithContent,funcName, args);
			content += generateMockFsTestCases(pathExists,!fileWithContent,funcName, args);
			content += generateMockFsTestCases(!pathExists,fileWithContent,funcName, args);
			
		}

		else if(arg_one || arg_two)
		{
							
			content+=testForInc(arg_one,arg_two,funcName,args);
			content+=testForInc(arg_one,!arg_two,funcName,args);
			content+=testForInc(!arg_one,arg_two,funcName,args);
		}
		
		else if(normtrue || normfalse)
		{

			var phoneNo=faker.phone.phoneNumberFormat();
			var phoneInFormat=faker.phone.phoneFormats();
			var options=
			{
				toString:function(){return "{normalize:true}";},
			}
			//var options = "normalize:true"
			content += "subject.{0}({1});\n".format(funcName, "'"+phoneNo+"','"+phoneInFormat+"',"+options);
			options['toString']=function(){return "{normalize:false}";};
			content += "subject.{0}({1});\n".format(funcName, "'"+phoneNo+"','"+phoneInFormat+"',"+options);
			content += "subject.{0}({1});\n".format(funcName, "'"+phoneNo+"','"+phoneInFormat+"',"+!options);
		
		}

		else if(areacode)
		{
			// Emit simple test case.
			//var generateRandomNumber = faker.phone.phoneNumberFormat();
			//content += "subject.{0}({1});\n".format(funcName, args);
			content+=testForBlacklist(areacode,funcName,args);
			content+=testForBlacklist(!areacode,funcName,args);
			
		}

		else 
		{
			// Emit simple test case.
			/*var generateRandomNumber = faker.phone.phoneNumberFormat();*/
			content += "subject.{0}({1});\n".format(funcName, args);
			

		}

	}

	console.log(content);


	fs.writeFileSync('test.js', content, "utf8");

}

function generateMockFsTestCases (pathExists,fileWithContent,funcName,args) 
{
	var testCase = "";
	// Insert mock data based on constraints.
	var mergedFS = {};
    if(args === 'CheckEmptyBuf')
	{
		args = '\'path/fileExists\',\'Filename.txt\'';
		if( pathExists)
		{
			for (var attrname in mockFileLibrary.pathExists) { mergedFS[attrname] = mockFileLibrary.pathExists[attrname]; }
		}
	}
	else {	
	if( pathExists )
	{
		for (var attrname in mockFileLibrary.pathExists) { mergedFS[attrname] = mockFileLibrary.pathExists[attrname]; }
	}
	if( fileWithContent )
	{
		for (var attrname in mockFileLibrary.fileWithContent) { mergedFS[attrname] = mockFileLibrary.fileWithContent[attrname]; }
	}

	if( !fileWithContent )
		{
			for (var attrname in mockFileLibrary.fileWithNoContent) { mergedFS[attrname] = mockFileLibrary.fileWithNoContent[attrname]; }
		}

}



	testCase += 
	"mock(" +
		JSON.stringify(mergedFS)
		+
	");\n";

	testCase += "\tsubject.{0}({1});\n".format(funcName, args );
	testCase+="mock.restore();\n";
	return testCase;
}



function testForInc(arg_one,arg_two,funcName,args)
{
		var testCase="";
		var argsAfterSplit=args.split(',');
		if(arg_one)
		{
			//var numb = new Random(Random.engines.mt19937().seedWithArray([0x12345678, 0x90abcdef]))
			//console.log(numb);
			var randnumber = Math.floor(Math.random()*5);
			var numb=(argsAfterSplit[0]) - randnumber;
			argsAfterSplit[0]=numb;
		}
		if(arg_two){
			if(argsAfterSplit[1]=="undefined")
			{
				var randnumb2 = Math.floor(Math.random()*5);
				argsAfterSplit[1]= randnumb2;
			}
			else
			{
				var randnumb2 = Math.floor(Math.random()*5);
				var numb2 = (argsAfterSplit[1]) - randnumb2;
				argsAfterSplit[1]= numb2;
			}
		}

		testCase+="subject.{0}({1});\n".format(funcName, argsAfterSplit);
		return testCase;
}

function constraints(filePath)
{
   var buf = fs.readFileSync(filePath, "utf8");
	var result = esprima.parse(buf, options);

	traverse(result, function (node) 
	{
		if (node.type === 'FunctionDeclaration') 
		{
			var funcName = functionName(node);
			console.log("Line : {0} Function: {1}".format(node.loc.start.line, funcName ));

			var params = node.params.map(function(p) {return p.name});

			functionConstraints[funcName] = {constraints:[], params: params};

			// Check for expressions using argument.
			traverse(node, function(child)
			{
				if( child.type === 'BinaryExpression' && child.operator == "==")
				{
					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{
						// get expression from original source code:
						//var expression = buf.substring(child.range[0], child.range[1]);
						//console.log("Hello"+child.right.range[0])
						//	console.log(child.right.range[1])
						var rightHand = buf.substring(child.right.range[0], child.right.range[1])
						functionConstraints[funcName].constraints.push( 
							{
								ident: child.left.name,
								value: rightHand
							});
					}
				}

				if( child.type === 'BinaryExpression' && child.operator == "==")
					{
						if( child.left.type == 'Identifier' && child.left.name=="area")
							{
								// get expression from original source code:
								//var expression = buf.substring(child.range[0], child.range[1]);
								var rightHand = buf.substring(child.right.range[0], child.right.range[1])
								functionConstraints[funcName].constraints.push(
								{
									ident: 'phoneNumber',
									value: rightHand,
								}
								);
							}
					}

			if( child.type === 'BinaryExpression' && child.operator == "<")
				{
					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{
						var rightHand = buf.substring(child.right.range[0], child.right.range[1])

							functionConstraints[funcName].constraints.push( 
							{
								ident: child.left.name,
								value: rightHand
							});
					}
				}

				 if( child.type === 'BinaryExpression' && child.operator == ">")
				
					{
							if( child.left.type == 'MemberExpression' && child.left.property.name=='length')
							
								{
									// get expression from original source code:
									//var expression = buf.substring(child.range[0], child.range[1]);
									var rightHand = buf.substring(child.right.range[0], child.right.range[1])
								
									functionConstraints[funcName].constraints.push(
											{
												ident: child.left.name,
												value: rightHand
											});


								}
					}


				

				if( child.type == 'LogicalExpression' && child.operator=="||")
				{

					if(child.left.type=='UnaryExpression')
					{
						functionConstraints[funcName].constraints.push(
							{
							ident: child.left.argument.name,
							value: true,
							}
							);
						functionConstraints[funcName].constraints.push(
							{
							ident: child.left.argument.name,
							value: false,
							}
							);
					}

				if(child.right.type=='UnaryExpression' && child.right.operator == "!")
				{
					if(child.right.argument.type=='MemberExpression')
					{
					functionConstraints[funcName].constraints.push(
						{
						ident: child.right.argument.object.name+'.'+child.right.argument.property.name,
						value: true,
						}
						);
					}
				}
			}


			if( child.type == "CallExpression" && 
					 child.callee.property &&
					 child.callee.property.name =="readFileSync" )
				{
					for( var p =0; p < params.length; p++ )
					{
						if( child.arguments[0].name == params[p] )
						{
							functionConstraints[funcName].constraints.push( 
							{
								// A fake path to a file
								ident: params[p],
								value: "'pathContent/file1'",
								mocking: 'fileWithContent'
							});
						}
					}
				}


				if( child.type == "CallExpression" &&
					 child.callee.property &&
					 child.callee.property.name =="existsSync")
				{
					for( var p =0; p < params.length; p++ )
					{
						if( child.arguments[0].name == params[p] )
						{
							functionConstraints[funcName].constraints.push( 
							{
								// A fake path to a file
								ident: params[p],
								value: "'path/fileExists'",
								mocking: 'fileExists'
							});
						}
					}
				}


			});

			console.log( functionConstraints[funcName]);

		}
	});
}


function testForBlacklist(areacode,funcName,args)

	{
		var testCase="";
		//console.log("hi" + args);
		var argsAfterSplit=args.split(',');
		var code =argsAfterSplit[0].substring(1,4);
		//console.log("hello"+argsAfterSplit[0]);
		var phoneNumb = "";
		
		var randomphonenumber=faker.phone.phoneNumberFormat().toString();
		if(areacode)
			{
				phoneNumb=code + randomphonenumber.substring(3,12);
				console.log(phoneNumb);
			}
		else
			{
				phoneNumb = randomphonenumber;
			}
		phoneNumb="'"+phoneNumb+"'";
		var finalArgs = "";
		console.log(phoneNumb);
		finalArgs =  phoneNumb;
		testCase+="subject.{0}({1});\n".format(funcName, finalArgs);
		return testCase;
	};

function traverse(object, visitor) 
{
    var key, child;

    visitor.call(null, object);
    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null) {
                traverse(child, visitor);
            }
        }
    }
}

function traverseWithCancel(object, visitor)
{
    var key, child;

    if( visitor.call(null, object) )
    {
	    for (key in object) {
	        if (object.hasOwnProperty(key)) {
	            child = object[key];
	            if (typeof child === 'object' && child !== null) {
	                traverseWithCancel(child, visitor);
	            }
	        }
	    }
 	 }
}

function functionName( node )
{
	if( node.id )
	{
		return node.id.name;
	}
	return "";
}


if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

main();