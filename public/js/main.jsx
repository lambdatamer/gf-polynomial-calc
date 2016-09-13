"use strict";

_visible_zeros_ = false;

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

	clear: function(){
		this.setState({variables: []});
	},

	toggleZerosShowing: function(e){
		_visible_zeros_ = !_visible_zeros_;
		this.setState({});
		var classes = e.target.className.split(" ");
		var index = classes.indexOf("active");
		if (index === -1){
			classes = classes.concat("active");
		}else{
			delete classes[index];
		}
		e.target.className = classes.join(" ");
	},

	render: function(){
		return (
			<div className="container">
				<h1>Galois Field <small>Polynomial Calculator <sub>alpha</sub></small></h1>
				<div className="row">
					<div id="parser-form" className="container col-md-4">
						<Parser field={this.state.field} onParserSubmit={this.handlePolynomialParsed} />
					</div>
					<div className="container col-md-2" id="config">
						<FieldControl field={this.state.field} onSelect={this.handleFieldChanged} />
						<div className="btn-group">
							<div className="btn btn-info fc-buttons" onClick={this.clear}>
							<span className="glyphicon glyphicon-fire"></span> Clear</div>
							<div className="btn btn-info fc-buttons" onClick={this.toggleZerosShowing}>
							<span className="glyphicon glyphicon-sunglasses"></span> Zeros</div>
						</div>
					</div>
				</div>
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
				<form className="input-group">
					<div className="input-group-addon">Gf</div>
					<select className="form-control" onChange={this.handleSelectChange}>
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
		if(parsedPolynomial.parse(inputStr) === -1){
			return 0;
		} 

		this.props.onParserSubmit(parsedPolynomial);
		this.setState({inputStr: ""});
	},

	render: function(){
		return (
			<form>
				<input id="parser" className="form-control"
					type="text" 
					placeholder="1x^3 + 2x^2 + 3x^1 + 4" 
					value={this.state.inputStr}
					onChange={this.handleStringChange}/>
				<div className="btn btn-primary" id="parse-button" onClick={this.handleSubmit}>Parse</div>
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
			<div className="row">
				<div id="calculator">
					<div className="col-md-6" id="calculator-body">
						<PolynomialContainer id="A" polynomial={this.state.a} />
						<ButtonList onActionSelected={this.execute} />
						<PolynomialContainer id="B" polynomial={this.state.b} />
						<h4>Result:</h4>
						<PolynomialContainer id="result" polynomial={this.state.result} />
					</div>
					<VariableList variables={this.props.variables} onSet={this.handleSet} />
				</div>
			</div>
		);
	}
});

var PolynomialContainer = React.createClass({
	rawMarkup: function(){
		var rm = this.props.polynomial.toStringPolynomial();
		return {__html: rm};
	},
	render: function(){
		var content = this.rawMarkup()
		return(
			<div className="input-group">
				<div className="input-group-addon">Gf({this.props.polynomial.field})</div>
				<div className="form-control" dangerouslySetInnerHTML={content}></div>
			</div>
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
				<div className="btn btn-success act-buttons" id="add" onClick={this.clicked}>+</div>
				<div className="btn btn-success act-buttons" id="substract" onClick={this.clicked}>-</div>
				<div className="btn btn-success act-buttons" id="multiply" onClick={this.clicked}>×</div>
				<div className="btn btn-success act-buttons" id="divide" onClick={this.clicked}>/</div>
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
			<div className="formControl col-md-offset-5" id="variables">
				{variableMap}
			</div>
		)
	}
});

var Variable = React.createClass({
	handleSet: function(e){
		var operand = e.target.className.slice(4, 5);
		this.props.onSet(operand, this.props.pid);
	},
	rawMarkup: function(){
		var rm = this.props.polynomial.toStringPolynomial();
		return {__html: rm};
	},
	render: function(){
		return (
			<div className="input-group">
				<div className="input-group-addon">Gf({this.props.polynomial.field})</div>
				<div className="form-control" dangerouslySetInnerHTML={this.rawMarkup()}></div>
				<div className="set-a input-group-addon " onClick={this.handleSet}>
					<span className="set-a glyphicon glyphicon-font" onClick={this.handleSet}></span></div>
				<div className="set-b input-group-addon" onClick={this.handleSet}>
					<span className="set-b glyphicon glyphicon-bold" onClick={this.handleSet}></span></div>

			</div>
		)
	}
});

ReactDOM.render(<App />, document.body);
