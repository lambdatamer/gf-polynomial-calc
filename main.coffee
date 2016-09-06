VISIBLE_ZEROS = true
class Polynomial
	constructor:(@degree = 0, @field = 2, @coeff = [0])->
		@coeff.length = @degree + 1
		do @fieldify
	
	fieldify: ->
		for elem, index in @coeff
			if elem
				elem %= @field
				elem += @field if elem < 0
			else
				elem = 0
			@coeff[index] = elem
		return @

	normalize: ->       
		do @fieldify
		while @degree
			break if @coeff[@degree]
			@degree--
			@coeff.length--
		return @

	toStringpolynomial: ->
		result = ""
		index = @degree
		while index >= 0
			cur = @coeff[index]
			if result
				if cur or VISIBLE_ZEROS
					result += " + "
			if cur or VISIBLE_ZEROS
				if index == 0
					result += cur
				else
					result += "#{cur}x^#{index}^" 
			index--
		return result

	equal: (polynomial) ->
		@degree = polynomial.degree
		@field = polynomial.field
		for elem, index in polynomial.coeff
			@coeff = elem
		return @

	add: (polynomial) ->
		if @field isnt polynomial.field
			console.log "Error: Attempt to realize [ADDITION] in different fields"
			return @
		
		a       = @coeff
		b       = polynomial.coeff
		deg     = Math.max @degree, polynomial.degree
		result  = new Polynomial deg, @field
		rc      = result.coeff

		for elem, index in result.coeff
			rc[index] = a[index] + b[index]
		
		do result.normalize

	substract: (polynomial) ->
		if @field isnt polynomial.field
			console.log "Error: Attempt to realize [SUBSTRACTION] in different fields"
			return @

		a       = @coeff
		b       = polynomial.coeff
		deg     = Math.max @degree, polynomial.degree
		result  = new Polynomial deg, @field
		rc      = result.coeff

		for elem, index in result.coeff
			if not a[index]
				rc[index] = -b[index]
			else if not b[index]
				rc[index] = a[index]
			else
				rc[index] = a[index] - b[index]

		do result.normalize

	multiply: (polynomial) ->
		if @field isnt polynomial.field
			console.log "Error: Attempt to realize [MULTIPLICATION] in different fields"
			return @

		result  = new Polynomial (@degree + polynomial.degree), @field
		rc      = result.coeff

		for elem1, index1 in @coeff
			for elem2, index2 in polynomial.coeff
				continue if not elem1 or not elem2
				
				rc[index1 + index2] += elem1 * elem2

		return do result.normalize

	_scalarMultiply: (scalar) ->
		result = new Polynomial
		result.equal @
		rc = result.coeff

		for elem, index in result.coeff
			rc = elem * scalar

		do result.fieldify

	_powerShift: (pow) ->
		return @ if pow <= 0
		
		result = new Polynomial
		result.equal @
		result.degree += pow
		rc = result.coeff

		while pow
			rc.unshift 0
			pow--

		do result.normalize

	divide: (polynomial) ->
		logging = false
		if logging
			tmp = VISIBLE_ZEROS
			VISIBLE_ZEROS = true
		if @field isnt polynomial.field
			console.log "Error: Attempt to realize [DIVISION] in different fields"
			return @
		if @degree < polynomial.degree
			zero = new Polynomial()
			return zero

		do @normalize
		do polynomial.normalize

		result  = new Polynomial (polynomial.degree - 1), @field
		a       = new Polynomial
		b       = new Polynomial
		index1  = a.degree
		index2  = 0;

		a.equal @

		if logging
			console.log do @toStringpolynomial
			console.log ("=======================================");
		while index1 > result.degree
			continue if not a.coeff[index1]
			
			b.equal polynomial

			index2 = 0
			while index2 < @field 
				b.equal(polynomial._scalarMultiply index2)
				index2++
				break if b.coeff[b.degree] == a.coeff[index1]


			result.coeff[a.degree - polynomial.degree] = index2
			b.equal(b._powerShift(index1 - polynomial.degree))
			a.equal(a.substract b)
			a.fieldify
			if logging
				console.log "-"
				console.log do b.toStringpolynomial
				console.log "---------------------------------------"
				console.log do a.toStringpolynomial
			index1--

		if logging
			VISIBLE_ZEROS = tmp;
			console.log "\nResult: #{do result.toStringpolynomial}"
			console.log "\nReminder: #{do a.toStringpolynomial}"

		do result.normalize

	parse:(inputStr) ->
		# 5x^3^ + 3x^2^ + 0x^1^ + 7^x^ + 5
		result = new Polynomial 0, @field
		try
			while true
				cur = parseInt inputStr, 10
				throw 1 if cur == NaN
				console.log "Current coeff: #{cur}"
				inputStr = inputStr.slice (inputStr.indexOf "x^") + 2
				console.log "Sliced string: #{inputStr}"
				deg = parseInt inputStr, 10
				console.log "Current degree: #{deg}"
				inputStr = inputStr.slice (inputStr.indexOf "+") + 2
				console.log "Sliced string: #{inputStr}"
				
				if deg = NaN
					if inputStr.indexOf "+" == -1
						result.coeff[0] = cur
					else
						throw 2
				else
					result.coeff[deg] = cur
				if inputStr.indexOf "+" == -1
					break

		catch e
			if e == 1
				console.log "Error: Bad coefficient
				\nCheck 'HELP' for instructions."
				return -1;
			if e == 2
				console.log "Error: Bad degree
				\nCheck 'HELP' for instructions."
				return -1;
		return @

#=====================
# DEBUG
#=====================
test1   = new Polynomial 5,3,[1,2,3,4,5,6]
# test2 = new Polynomial 5,3,[9,8,7]
# console.log do test1.toStringpolynomial
# console.log do test2.toStringpolynomial
# console.log ""
# console.log "sum: #{do test1.add(test2).toStringpolynomial}"
# console.log "substract: #{do test1.substract(test2).toStringpolynomial}"
# console.log "multiply: #{do test1.multiply(test2).toStringpolynomial}"
# console.log "divide: #{do test1.divide(test2).toStringpolynomial}" #DEBUG!!! ALWAYS RETURNS 0

testStr = "5x^3^ + 3x^2^ + 0x^1^ + 7^x^ + 5"

test1.parse testStr

