"use strict";

_visible_zeros_ = true;

var current;

var App = React.createClass({
	getInitialState: function(){
		return ({variables: [], field: 2});
	},
	
	handlePolynomialParsed: function(polynomial){
		var newVariables = this.state.variables.concat([polynomial]);
		this.setState({variables: newVariables});
	},

	handleFieldChanged: function(value){
		this.setState({field: value});
	},

	render: function(){
		return (
			<div id="application">
				<h1>This is PolyCalc Alpha!</h1>
				<p>Test Ctrl+C/Ctrl+V:</p>
				<p>1x^7 + 2x^6 + 3x^5 + 4x^4 + 5x^3 + 6x^2 + 7x^1 + 8</p>
				<FieldControl field={this.state.field} onSelect={this.handleFieldChanged} />
				<Parser field={this.state.field} onParserSubmit={this.handlePolynomialParsed} />
				<Calculator variables={this.state.variables}/>
			</div>
		);
	}
});



var FieldControl = React.createClass({
	getInitialState: function(){
		return {field: 2};
	},

	handleSelectChange: function(e){
		this.props.onSelect(e.target.value);
	},

	render: function(){
		return (
			<div>
				<form id="field-control-form">
					<div>Gf</div>
					<select onChange={this.handleSelectChange}>
						<option>2</option>
						<option>3</option>
						<option>5</option>
						<option>7</option>
						<option>11</option>
						<option>13</option>
					</select>
				</form>
			</div>
		);
	}
});



var Parser = React.createClass({
	getInitialState: function(){
		return { inputStr: "" };
	},

	handleStringChange: function(e){
		this.setState({inputStr: e.target.value});
	},

	handleSubmit: function(e){
		e.preventDefault();
		var inputStr = this.state.inputStr;
		var parsedPolynomial = new Polynomial(0, this.props.field);
		parsedPolynomial.parse(inputStr);
		this.props.onParserSubmit(parsedPolynomial);
		this.setState({inputStr: ""});
	},

	render: function(){
		return (
			<form id="parser-form" onSubmit={this.handleSubmit}>
				<input 
					type="text" 
					placeholder="1x^3 + 2x^2 + 3x^1 + 4" 
					value={this.state.inputStr}
					onChange={this.handleStringChange}/>
				<input type="submit" value="Parse!" />
			</form>
		)
	}
});



var Calculator = React.createClass({
	getInitialState: function(){
		var empty = new Polynomial();
		return {a: empty, b: empty, result: empty};
	},
	handleSet: function(operand, index){
		var polynomial = this.props.variables[index];
		if(operand === "a"){
			this.setState({a: polynomial});
		}else if(operand === "b"){
			this.setState({b: polynomial});
		}
	},
	execute: function(action){
		var result;
		var operandA = this.state.a
		var operandB = this.state.b
		switch(action){
			case "add":
				result = operandA.add(operandB);
				break;
			case "substract":
				result = operandA.substract(operandB);
				break;
			case "multiply":
				result = operandA.multiply(operandB);
				break;
			case "divide":
				result = operandA.divide(operandB);
				break;
		}
		if (result === -1){
			result = new Polynomial();
			console.log ("Error: result -1");
		}
		result.normalize();

		this.setState({result: result});
	},
	render: function(){
		return (
			<div>
				<PolynomialContainer id="A" content={this.state.a} />
				<ButtonList onActionSelected={this.execute} />
				<PolynomialContainer id="B" content={this.state.b} />
				<PolynomialContainer id="result" content={this.state.result} />
				<VariableList variables={this.props.variables} onSet={this.handleSet} />
			</div>
		);
	}
});

var PolynomialContainer = React.createClass({
	rawMarkup: function(){
		var rm = this.props.content.toStringPolynomial();
		return {__html: rm};
	},
	render: function(){
		var content = this.rawMarkup()
		return(
			<dir dangerouslySetInnerHTML={content}></dir>
		);
	}
});

var ButtonList = React.createClass({	
	clicked: function(arg){
		this.props.onActionSelected(arg.target.id);
	},

	render: function(){
		return (
			<div>
				<div id="add" onClick={this.clicked}>+</div>
				<div id="substract" onClick={this.clicked}>-</div>
				<div id="multiply" onClick={this.clicked}>*</div>
				<div id="divide" onClick={this.clicked}>/</div>
			</div>
		);
	}
});



var VariableList = React.createClass({

	render: function(){
		var func = this.props.onSet;

		var variableMap = this.props.variables.map(function(variable, index){
			return (
				<Variable 
					pid={index} 
					polynomial={variable} 
					onSet={func}
				/>
			)
		});

		return (
			<div id="variables">
				{variableMap}
			</div>
		)
	}
});

var Variable = React.createClass({
	handleSet: function(e){
		var operand = e.target.className.slice(4);
		this.props.onSet(operand, this.props.pid);
	},
	rawMarkup: function(){
		var rm = this.props.polynomial.toStringPolynomial();
		return {__html: rm};
	},
	render: function(){
		return (
			<div>
				<div className="set-a" onClick={this.handleSet}>A</div>
				<div className="set-b" onClick={this.handleSet}>B</div>
				<span>
					{(this.props.pid + 1) + ") Gf[" + this.props.polynomial.field + "] "}
				</span>
				<span dangerouslySetInnerHTML={this.rawMarkup()} />
			</div>
		)
	}
});

ReactDOM.render(<App />, document.body);
