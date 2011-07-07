/*
 * Copyright 2011 Stephane Godbillon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function(ftmpl) {
	ftmpl.utils = {
		escapeHTML: function(s) {
			if(s.isRaw)
				return s.toString()
			return ('' + s).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace('/&/g', '&amp;')
		},
		raw: function(s) {
			return {
				isRaw: true,
				toString: function() {
					return s
				}
			}
		}
	};

	var compiledTemplates = {};

	function copyObj(into, source) {
		for(var i in source)
			if(source[i] !== undefined)
				into[i] = source[i]
		return into;
	}

	ftmpl.options = {
		specialChar: '$'
	}

	ftmpl.run = function(name, o) {
		return this.compiledTemplates[name](o)
	}

	ftmpl.compile = function(name, source, recompile) {
		source = source || document.getElementById(name).innerHTML
		if(!recompile && compiledTemplates[name])
			return compiledTemplates[name]
		return compiledTemplates[name] = this._compile(source)
	}

	ftmpl._compile = function(str, options) {
		options = copyObj(copyObj({}, ftmpl.options), options || {})
		var result = "var raw = window.FluidTmpl.utils.raw; var result = ''; _ = _ || {};"

		var tokens = {}

		tokens[options.specialChar + "("] = {
			name: options.specialChar + "(",
			func: function(str, i, until) {
				var next = findMatching(str, i + 1, '(')
				result += "result += window.FluidTmpl.utils.escapeHTML((" + str.substring(i + 1, next) + "));"
				parseRaw(next + 1, until)
			}
		}
		tokens[options.specialChar + "if("] = {
			name: options.specialChar + "if(",
			func: function(str, i, until) {
				var next = parenthesisBlock(str, i, "if", true)
				var _else = eatWhiteSpaces(str, next + 1)
				if(str.indexOf("else", _else) === _else) {
					result += "else {"
					_else = eatWhiteSpaces(str, _else + 4)
					next = bracketBlock(str, _else)
					result += "}"
				}
				parseRaw(next + 1, until)
			}
		}
		tokens[options.specialChar + "for("] = {
			name: options.specialChar + "for(",
			func: function(str, i, until) {
				var next = parenthesisBlock(str, i, "for", true)
				parseRaw(next + 1, until)
			}
		},
		tokens[options.specialChar + "while("] = {
			name: options.specialChar + "while(",
			func: function(str, i, until) {
				var next = parenthesisBlock(str, i, "while", true)
				parseRaw(next + 1, until)
			}
		},
		tokens[")"] = {
			name: ")",
			raw: true
		};
		tokens["("] = {
			name: "(",
			raw: true
		};
		tokens["{"] = {
			name: "{",
			raw: true
		};
		tokens["}"] = {
			name: "}",
			raw: true
		};

		function eatWhiteSpaces(str, i) {
			while(i < str.length && /\s/.test(str.charAt(i))) i++
			return i;
		}

		function parenthesisBlock(str, i, prepend, needBracketBlock) {
			var next = findMatching(str, i + 1, '(') + 1
			result += prepend + str.substring(i, next)
			if(needBracketBlock) {
				result += "{"
				next = eatWhiteSpaces(str, next + 1)
				next = bracketBlock(str, next)
				result += "}"
			}
			return next
		}

		function bracketBlock(str, i) {
			var next = findMatching(str, i + 1, '{')
			parseRaw(i + 1, next)
			return next
		}

		function parseRaw(i, until) {
			add(wrapRaw(findNextToken(str, i, function(str, token, i, buffer) {
				add(wrapRaw(buffer))
				if(token.func) {
					token.func(str, i, until)
					return true
				}
				if(token.raw)
					add(wrapRaw(token.name))
			}, until)))
		}

		function add(str) {
			result += "result += " + str + ";\n"
		}

		function wrapRaw(str) {
			return "'" + str.replace(/'/g, "\\'").replace(/\n/g, "\\n") + "'"
		}

		function findMatching(str, i, c) {
			var opened = 1,
				closed = 0;
			var closing = c === '(' ? ')' : '}'
			var found = -1
			findNextToken(str, i, function(str, t, i) {
				if(t.name === closing) closed++
				if(t.name === c) opened++
				if(closed === opened) {
					found = i
					return true
				}
			})
			if(found > -1) return found
			throw {message: c + " at index " + i + " is not closed !"}
		}

		function isToken(s) {
			for(var i in tokens) {
				if(tokens[i].name === s) return tokens[i]
				if(tokens[i].name.indexOf(s) === 0) return "maybe"
			}
			return false
		}

		function findNextToken(str, i, f, until) {
			var escape = false
			var buffer = ""
			var token = ""
			while(i < str.length && (!until || i < until)) {
				var c = str.charAt(i)
				if(c === "\\" && !escape) {
					escape = true
				} else {
					if(!escape) {
						token += c
						var maybeToken = isToken(token)
						if(maybeToken !== "maybe") {
							if(maybeToken.name) {
								if(f(str, maybeToken, i, buffer))
									return ""
								token = ""
								buffer = ""
							} else {
								buffer += token
								token = ""
							}
						}
					} else {
						escape = false
						buffer += c
					}
				}
				i++;
			}
			return buffer;
		}

		parseRaw(0)
		result += "; return result;"

		return function(o) {
			var f = new Function('_', result)
			if(o !== undefined && o !== null) {
				if(o.constructor === Array) {
					var finalResult = ""
					for(var i = 0; i < o.length; i++)
						finalResult += f(o[i])
					return finalResult
				}
				if(o.constructor === Object)
					return f(o)
			}
			return ""
		}
	}
})(window.FluidTmpl = window.FluidTmpl || {})