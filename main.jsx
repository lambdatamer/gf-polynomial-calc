"use strict";

var _field_ = 7;
_visible_zeros_ = true;

var test1 = new Polynomial(3, 5, [1, 2, 3, 4]);
var test2 = new Polynomial(3, 5, [4, 3, 2, 1]);
var variables = [test1, test2];

var current;

var App = React.createClass({
	getInitialState: function(){
		return ({variables: []});
	},
	componentDidMount: function(){
		this.setState({variables: this.props.variables});
	},
	handlePolynomialParsed: function(){
		this.setState({variables: this.props.variables});
	},
	render: function(){
		return (
			<div id="application">
				This is PolyCalc Alpha!
				<Parser onParseSubmit={this.handlePolynomialParsed} />
				<VariableList variables={this.state.variables} />
			</div>
		);
	}
});

var Parser = React.createClass({
	getInitialState: function(){
		return{ inputStr: "" }
	},

	handleStringChange: function(e){
		this.setState({inputStr: e.target.value});
	},

	handleSubmit: function(e){
		e.preventDefault();
		var inputStr = this.state.inputStr;
		var parsedPolynomial = new Polynomial(0, _field_);
		parsedPolynomial.parse(inputStr);
		variables.push(parsedPolynomial);
		this.setState({inputStr: ""});
		this.props.onParseSubmit();
	},

	render: function(){
		return (
			<form id="parser-form" onSubmit={this.handleSubmit}>
				<input 
					type="text" 
					placeholder="Type text here..." 
					value={this.state.inputStr}
					onChange={this.handleStringChange}/>
				<input type="submit" value="Parse!" />
			</form>
		)
	}
});

var VariableList = React.createClass({
	render: function(){
		var variableMap = this.props.variables.map(function(variable, index){
			return (
				<Variable pid={index + 1} polynomial={variable.toStringPolynomial()} />
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
	rawMarkup: function(){
		return {__html: this.props.polynomial};

	},
	render: function(){
		return (
			<div className="variable">
				<span className="variable-key">
					{this.props.pid + ") "}
				</span>
				<span dangerouslySetInnerHTML={this.rawMarkup()} />
			</div>
		)
	}
});

ReactDOM.render(<App variables={variables} />, document.body);
