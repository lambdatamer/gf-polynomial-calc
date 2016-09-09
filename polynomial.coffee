_visible_zeros_ = false
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

	toStringPolynomial: ->
		result = ""
		index = @degree
		while index >= 0
			cur = @coeff[index]
			if result
				if cur or _visible_zeros_
					result += " + "
			if cur or _visible_zeros_
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
			tmp = _visible_zeros_
			_visible_zeros_ = true
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
			console.log do @toStringPolynomial
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
				console.log do b.toStringPolynomial
				console.log "---------------------------------------"
				console.log do a.toStringPolynomial
			index1--

		if logging
			_visible_zeros_ = tmp;
			console.log "\nResult: #{do result.toStringPolynomial}"
			console.log "\nReminder: #{do a.toStringPolynomial}"

		do result.normalize

	parse:(inputStr) ->
		# 5x^3^ + 3x^2^ + 0x^1^ + 7x^1^ + 5
		result = new Polynomial 0, @field
		monomials = inputStr.split "+"
		result.degree = monomials.length

		monomials.map (monomial) ->
			try
				cur = parseInt monomial, 10
				throw 1 if isNaN(cur)
				strCur = String(cur);
				monomial = monomial.slice(monomial.indexOf(strCur) + strCur.length)
				tmp = monomial.indexOf "^"
				
				if tmp == -1
					if !result.coeff[0]
						if isNaN(parseInt monomial, 10)
							result.coeff[0] = cur
							return
						else 
							throw 2
					else 
						throw 3

				monomial = monomial.slice tmp + 1

				deg = parseInt monomial, 10
				throw 3 if isNaN(deg);
				if result.coeff[deg] == undefined
					result.coeff[deg] = cur
				else
					result.coeff[deg] += cur
					throw 4
				return

			catch e
				check = "\n\t\t Check 'HELP' for instructions."

				if e == 1
					console.error "Error: Bad coefficient#{check}"
				if e == 2
					console.error "Error: Can't find \"^\" after coefficient#{check}"
				if e == 3
					console.error "Error: Bad degree#{check}"
				if e == 4 
					console.warn "Warning: Two or more monomials have the same degree"
				return -1

		result.degree = result.coeff.length - 1
		do result.normalize
		this.coeff = result.coeff
		this.degree = result.degree
		return @
