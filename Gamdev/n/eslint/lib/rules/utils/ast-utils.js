/**
 * @fileoverview Common utils for AST.
 * @author Gyandeep Singh
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const { KEYS: eslintVisitorKeys } = require("eslint-visitor-keys");
const esutils = require("esutils");
const espree = require("espree");
const escapeRegExp = require("escape-string-regexp");
const {
    breakableTypePattern,
    createGlobalLinebreakMatcher,
    lineBreakPattern,
    shebangPattern
} = require("../../shared/ast-utils");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const anyFunctionPattern = /^(?:Function(?:Declaration|Expression)|ArrowFunctionExpression)$/u;
const anyLoopPattern = /^(?:DoWhile|For|ForIn|ForOf|While)Statement$/u;
const arrayMethodWithThisArgPattern = /^(?:every|filter|find(?:Last)?(?:Index)?|flatMap|forEach|map|some)$/u;
const arrayOrTypedArrayPattern = /Array$/u;
const bindOrCallOrApplyPattern = /^(?:bind|call|apply)$/u;
const thisTagPattern = /^[\s*]*@this/mu;


const COMMENTS_IGNORE_PATTERN = /^\s*(?:eslint|jshint\s+|jslint\s+|istanbul\s+|globals?\s+|exported\s+|jscs)/u;
const ESLINT_DIRECTIVE_PATTERN = /^(?:eslint[- ]|(?:globals?|exported) )/u;
const LINEBREAKS = new Set(["\r\n", "\r", "\n", "\u2028", "\u2029"]);

// A set of node types that can contain a list of statements
const STATEMENT_LIST_PARENTS = new Set(["Program", "BlockStatement", "StaticBlock", "SwitchCase"]);

const DECIMAL_INTEGER_PATTERN = /^(?:0|0[0-7]*[89]\d*|[1-9](?:_?\d)*)$/u;

// Tests the presence of at least one LegacyOctalEscapeSequence or NonOctalDecimalEscapeSequence in a raw string
const OCTAL_OR_NON_OCTAL_DECIMAL_ESCAPE_PATTERN = /^(?:[^\\]|\\.)*\\(?:[1-9]|0[0-9])/su;

const LOGICAL_ASSIGNMENT_OPERATORS = new Set(["&&=", "||=", "??="]);

/**
 * Checks reference if is non initializer and writable.
 * @param {Reference} reference A reference to check.
 * @param {int} index The index of the reference in the references.
 * @param {Reference[]} references The array that the reference belongs to.
 * @returns {boolean} Success/Failure
 * @private
 */
function isModifyingReference(reference, index, references) {
    const identifier = reference.identifier;

    /*
     * Destructuring assignments can have multiple default value, so
     * possibly there are multiple writeable references for the same
     * identifier.
     */
    const modifyingDifferentIdentifier = index === 0 ||
        references[index - 1].identifier !== identifier;

    return (identifier &&
        reference.init === false &&
        reference.isWrite() &&
        modifyingDifferentIdentifier
    );
}

/**
 * Checks whether the given string starts with uppercase or not.
 * @param {string} s The string to check.
 * @returns {boolean} `true` if the string starts with uppercase.
 */
function startsWithUpperCase(s) {
    return s[0] !== s[0].toLocaleLowerCase();
}

/**
 * Checks whether or not a node is a constructor.
 * @param {ASTNode} node A function node to check.
 * @returns {boolean} Whether or not a node is a constructor.
 */
function isES5Constructor(node) {
    return (node.id && startsWithUpperCase(node.id.name));
}

/**
 * Finds a function node from ancestors of a node.
 * @param {ASTNode} node A start node to find.
 * @returns {Node|null} A found function node.
 */
function getUpperFunction(node) {
    for (let currentNode = node; currentNode; currentNode = currentNode.parent) {
        if (anyFunctionPattern.test(currentNode.type)) {
            return currentNode;
        }
    }
    return null;
}

/**
 * Checks whether a given node is a function node or not.
 * The following types are function nodes:
 *
 * - ArrowFunctionExpression
 * - FunctionDeclaration
 * - FunctionExpression
 * @param {ASTNode|null} node A node to check.
 * @returns {boolean} `true` if the node is a function node.
 */
function isFunction(node) {
    return Boolean(node && anyFunctionPattern.test(node.type));
}

/**
 * Checks whether a given node is a loop node or not.
 * The following types are loop nodes:
 *
 * - DoWhileStatement
 * - ForInStatement
 * - ForOfStatement
 * - ForStatement
 * - WhileStatement
 * @param {ASTNode|null} node A node to check.
 * @returns {boolean} `true` if the node is a loop node.
 */
function isLoop(node) {
    return Boolean(node && anyLoopPattern.test(node.type));
}

/**
 * Checks whether the given node is in a loop or not.
 * @param {ASTNode} node The node to check.
 * @returns {boolean} `true` if the node is in a loop.
 */
function isInLoop(node) {
    for (let currentNode = node; currentNode && !isFunction(currentNode); currentNode = currentNode.parent) {
        if (isLoop(currentNode)) {
            return true;
        }
    }

    return false;
}

/**
 * Determines whether the given node is a `null` literal.
 * @param {ASTNode} node The node to check
 * @returns {boolean} `true` if the node is a `null` literal
 */
function isNullLiteral(node) {

    /*
     * Checking `node.value === null` does not guarantee that a literal is a null literal.
     * When parsing values that cannot be represented in the current environment (e.g. unicode
     * regexes in Node 4), `node.value` is set to `null` because it wouldn't be possible to
     * set `node.value` to a unicode regex. To make sure a literal is actually `null`, check
     * `node.regex` instead. Also see: https://github.com/eslint/eslint/issues/8020
     */
    return node.type === "Literal" && node.value === null && !node.regex && !node.bigint;
}

/**
 * Checks whether or not a node is `null` or `undefined`.
 * @param {ASTNode} node A node to check.
 * @returns {boolean} Whether or not the node is a `null` or `undefined`.
 * @public
 */
function isNullOrUndefined(node) {
    return (
        isNullLiteral(node) ||
        (node.type === "Identifier" && node.name === "undefined") ||
        (node.type === "UnaryExpression" && node.operator === "void")
    );
}

/**
 * Checks whether or not a node is callee.
 * @param {ASTNode} node A node to check.
 * @returns {boolean} Whether or not the node is callee.
 */
function isCallee(node) {
    return node.parent.type === "CallExpression" && node.parent.callee === node;
}

/**
 * Returns the result of the string conversion applied to the evaluated value of the given expression node,
 * if it can be determined statically.
 *
 * This function returns a `string` value for all `Literal` nodes and simple `TemplateLiteral` nodes only.
 * In all other cases, this function returns `null`.
 * @param {ASTNode} node Expression node.
 * @returns {string|null} String value if it can be determined. Otherwise, `null`.
 */
function getStaticStringValue(node) {
    switch (node.type) {
        case "Literal":
            if (node.value === null) {
                if (isNullLiteral(node)) {
                    return String(node.value); // "null"
                }
                if (node.regex) {
                    return `/${node.regex.pattern}/${node.regex.flags}`;
                }
                if (node.bigint) {
                    return node.bigint;
                }

                // Otherwise, this is an unknown literal. The function will return null.

            } else {
                return String(node.value);
            }
            break;
        case "TemplateLiteral":
            if (node.expressions.length === 0 && node.quasis.length === 1) {
                return node.quasis[0].value.cooked;
            }
            break;

            // no default
    }

    return null;
}

/**
 * Gets the property name of a given node.
 * The node can be a MemberExpression, a Property, or a MethodDefinition.
 *
 * If the name is dynamic, this returns `null`.
 *
 * For examples:
 *
 *     a.b           // => "b"
 *     a["b"]        // => "b"
 *     a['b']        // => "b"
 *     a[`b`]        // => "b"
 *     a[100]        // => "100"
 *     a[b]          // => null
 *     a["a" + "b"]  // => null
 *     a[tag`b`]     // => null
 *     a[`${b}`]     // => null
 *
 *     let a = {b: 1}            // => "b"
 *     let a = {["b"]: 1}        // => "b"
 *     let a = {['b']: 1}        // => "b"
 *     let a = {[`b`]: 1}        // => "b"
 *     let a = {[100]: 1}        // => "100"
 *     let a = {[b]: 1}          // => null
 *     let a = {["a" + "b"]: 1}  // => null
 *     let a = {[tag`b`]: 1}     // => null
 *     let a = {[`${b}`]: 1}     // => null
 * @param {ASTNode} node The node to get.
 * @returns {string|null} The property name if static. Otherwise, null.
 */
function getStaticPropertyName(node) {
    let prop;

    switch (node && node.type) {
        case "ChainExpression":
            return getStaticPropertyName(node.expression);

        case "Property":
        case "PropertyDefinition":
        case "MethodDefinition":
            prop = node.key;
            break;

        case "MemberExpression":
            prop = node.property;
            break;

            // no default
    }

    if (prop) {
        if (prop.type === "Identifier" && !node.computed) {
            return prop.name;
        }

        return getStaticStringValue(prop);
    }

    return null;
}

/**
 * Retrieve `ChainExpression#expression` value if the given node a `ChainExpression` node. Otherwise, pass through it.
 * @param {ASTNode} node The node to address.
 * @returns {ASTNode} The `ChainExpression#expression` value if the node is a `ChainExpression` node. Otherwise, the node.
 */
function skipChainExpression(node) {
    return node && node.type === "ChainExpression" ? node.expression : node;
}

/**
 * Check if the `actual` is an expected value.
 * @param {string} actual The string value to check.
 * @param {string | RegExp} expected The expected string value or pattern.
 * @returns {boolean} `true` if the `actual` is an expected value.
 */
function checkText(actual, expected) {
    return typeof expected === "string"
        ? actual === expected
        : expected.test(actual);
}

/**
 * Check if a given node is an Identifier node with a given name.
 * @param {ASTNode} node The node to check.
 * @param {string | RegExp} name The expected name or the expected pattern of the object name.
 * @returns {boolean} `true` if the node is an Identifier node with the name.
 */
function isSpecificId(node, name) {
    return node.type === "Identifier" && checkText(node.name, name);
}

/**
 * Check if a given node is member access with a given object name and property name pair.
 * This is regardless of optional or not.
 * @param {ASTNode} node The node to check.
 * @param {string | RegExp | null} objectName The expected name or the expected pattern of the object name. If this is nullish, this method doesn't check object.
 * @param {string | RegExp | null} propertyName The expected name or the expected pattern of the property name. If this is nullish, this method doesn't check property.
 * @returns {boolean} `true` if the node is member access with the object name and property name pair.
 * The node is a `MemberExpression` or `ChainExpression`.
 */
function isSpecificMemberAccess(node, objectName, propertyName) {
    const checkNode = skipChainExpression(node);

    if (checkNode.type !== "MemberExpression") {
        return false;
    }

    if (objectName && !isSpecificId(checkNode.object, objectName)) {
        return false;
    }

    if (propertyName) {
        const actualPropertyName = getStaticPropertyName(checkNode);

        if (typeof actualPropertyName !== "string" || !checkText(actualPropertyName, propertyName)) {
            return false;
        }
    }

    return true;
}

/**
 * Check if two literal nodes are the same value.
 * @param {ASTNode} left The Literal node to compare.
 * @param {ASTNode} right The other Literal node to compare.
 * @returns {boolean} `true` if the two literal nodes are the same value.
 */
function equalLiteralValue(left, right) {

    // RegExp literal.
    if (left.regex || right.regex) {
        return Boolean(
            left.regex &&
            right.regex &&
            left.regex.pattern === right.regex.pattern &&
            left.regex.flags === right.regex.flags
        );
    }

    // BigInt literal.
    if (left.bigint || right.bigint) {
        return left.bigint === right.bigint;
    }

    return left.value === right.value;
}

/**
 * Check if two expressions reference the same value. For example:
 *     a = a
 *     a.b = a.b
 *     a[0] = a[0]
 *     a['b'] = a['b']
 * @param {ASTNode} left The left side of the comparison.
 * @param {ASTNode} right The right side of the comparison.
 * @param {boolean} [disableStaticComputedKey] Don't address `a.b` and `a["b"]` are the same if `true`. For backward compatibility.
 * @returns {boolean} `true` if both sides match and reference the same value.
 */
function isSameReference(left, right, disableStaticComputedKey = false) {
    if (left.type !== right.type) {

        // Handle `a.b` and `a?.b` are samely.
        if (left.type === "ChainExpression") {
            return isSameReference(left.expression, right, disableStaticComputedKey);
        }
        if (right.type === "ChainExpression") {
            return isSameReference(left, right.expression, disableStaticComputedKey);
        }

        return false;
    }

    switch (left.type) {
        case "Super":
        case "ThisExpression":
            return true;

        case "Identifier":
        case "PrivateIdentifier":
            return left.name === right.name;
        case "Literal":
            return equalLiteralValue(left, right);

        case "ChainExpression":
            return isSameReference(left.expression, right.expression, disableStaticComputedKey);

        case "MemberExpression": {
            if (!disableStaticComputedKey) {
                const nameA = getStaticPropertyName(left);

                // x.y = x["y"]
                if (nameA !== null) {
                    return (
                        isSameReference(left.object, right.object, disableStaticComputedKey) &&
                        nameA === getStaticPropertyName(right)
                    );
                }
            }

            /*
             * x[0] = x[0]
             * x[y] = x[y]
             * x.y = x.y
             */
            return (
                left.computed === right.computed &&
                isSameReference(left.object, right.object, disableStaticComputedKey) &&
                isSameReference(left.property, right.property, disableStaticComputedKey)
            );
        }

        default:
            return false;
    }
}

/**
 * Checks whether or not a node is `Reflect.apply`.
 * @param {ASTNode} node A node to check.
 * @returns {boolean} Whether or not the node is a `Reflect.apply`.
 */
function isReflectApply(node) {
    return isSpecificMemberAccess(node, "Reflect", "apply");
}

/**
 * Checks whether or not a node is `Array.from`.
 * @param {ASTNode} node A node to check.
 * @returns {boolean} Whether or not the node is a `Array.from`.
 */
function isArrayFromMethod(node) {
    return isSpecificMemberAccess(node, arrayOrTypedArrayPattern, "from");
}

/**
 * Checks whether or not a node is a method which expects a function as a first argument, and `thisArg` as a second argument.
 * @param {ASTNode} node A node to check.
 * @returns {boolean} Whether or not the node is a method which expects a function as a first argument, and `thisArg` as a second argument.
 */
function isMethodWhichHasThisArg(node) {
    return isSpecificMemberAccess(node, null, arrayMethodWithThisArgPattern);
}

/**
 * Creates the negate function of the given function.
 * @param {Function} f The function to negate.
 * @returns {Function} Negated function.
 */
function negate(f) {
    return token => !f(token);
}

/**
 * Checks whether or not a node has a `@this` tag in its comments.
 * @param {ASTNode} node A node to check.
 * @param {SourceCode} sourceCode A SourceCode instance to get comments.
 * @returns {boolean} Whether or not the node has a `@this` tag in its comments.
 */
function hasJSDocThisTag(node, sourceCode) {
    const jsdocComment = sourceCode.getJSDocComment(node);

    if (jsdocComment && thisTagPattern.test(jsdocComment.value)) {
        return true;
    }

    // Checks `@this` in its leading comments for callbacks,
    // because callbacks don't have its JSDoc comment.
    // e.g.
    //     sinon.test(/* @this sinon.Sandbox */function() { this.spy(); });
    return sourceCode.getCommentsBefore(node).some(comment => thisTagPattern.test(comment.value));
}

/**
 * Determines if a node is surrounded by parentheses.
 * @param {SourceCode} sourceCode The ESLint source code object
 * @param {ASTNode} node The node to be checked.
 * @returns {boolean} True if the node is parenthesised.
 * @private
 */
function isParenthesised(sourceCode, node) {
    const previousToken = sourceCode.getTokenBefore(node),
        nextToken = sourceCode.getTokenAfter(node);

    return Boolean(previousToken && nextToken) &&
        previousToken.value === "(" && previousToken.range[1] <= node.range[0] &&
        nextToken.value === ")" && nextToken.range[0] >= node.range[1];
}

/**
 * Checks if the given token is a `=` token or not.
 * @param {Token} token The token to check.
 * @returns {boolean} `true` if the token is a `=` token.
 */
function isEqToken(token) {
    return token.value === "=" && token.type === "Punctuator";
}

/**
 * Checks if the given token is an arrow token or not.
 * @param {Token} token The token to check.
 * @returns {boolean} `true` if the token is an arrow token.
 */
function isArrowToken(token) {
    return token.value === "=>" && token.type === "Punctuator";
}

/**
 * Checks if the given token is a comma token or not.
 * @param {Token} token The token to check.
 * @returns {boolean} `true` if the token is a comma token.
 */
function isCommaToken(token) {
    return token.value === "," && token.type === "Punctuator";
}

/**
 * Checks if the given token is a dot token or not.
 * @param {Token} token The token to check.
 * @returns {boolean} `true` if the token is a dot token.
 */
function isDotToken(token) {
    return token.value === "." && token.type === "Punctuator";
}

/**
 * Checks if the given token is a `?.` token or not.
 * @param {Token} token The token to check.
 * @returns {boolean} `true` if the token is a `?.` token.
 */
function isQuestionDotToken(token) {
    return token.value === "?." && token.type === "Punctuator";
}

/**
 * Checks if the given token is a semicolon token or not.
 * @param {Token} token The token to check.
 * @returns {boolean} `true` if the token is a semicolon token.
 */
function isSemicolonToken(token) {
    return token.value === ";" && token.type === "Punctuator";
}

/**
 * Checks if the given token is a colon token or not.
 * @param {Token} token The token to check.
 * @returns {boolean} `true` if the token is a colon token.
 */
function isColonToken(token) {
    return token.value === ":" && token.type === "Punctuator";
}

/**
 * Checks if the given token is an opening parenthesis token or not.
 * @param {Token} token The token to check.
 * @returns {boolean} `true` if the token is an opening parenthesis token.
 */
function isOpeningParenToken(token) {
    return token.value === "(" && token.type === "Punctuator";
}

/**
 * Checks if the given token is a closing parenthesis token or not.
 * @param {Token} token The token to check.
 * @returns {boolean} `true` if the token is a closing parenthesis token.
 */
function isClosingParenToken(token) {
    return token.value === ")" && token.type === "Punctuator";
}

/**
 * Checks if the given token is an opening square bracket token or not.
 * @param {Token} token The token to check.
 * @returns {boolean} `true` if the token is an opening square bracket token.
 */
function isOpeningBracketToken(token) {
    return token.value === "[" && token.type === "Punctuator";
}

/**
 * Checks if the given token is a closing square bracket token or not.
 * @param {Token} token The token to check.
 * @returns {boolean} `true` if the token is a closing square bracket token.
 */
function isClosingBracketToken(token) {
    return token.value === "]" && token.type === "Punctuator";
}

/**
 * Checks if the given token is an opening brace token or not.
 * @param {Token} token The token to check.
 * @returns {boolean} `true` if the token is an opening brace token.
 */
function isOpeningBraceToken(token) {
    return token.value === "{" && token.type === "Punctuator";
}

/**
 * Checks if the given token is a closing brace token or not.
 * @param {Token} token The token to check.
 * @returns {boolean} `true` if the token is a closing brace token.
 */
function isClosingBraceToken(token) {
    return token.value === "}" && token.type === "Punctuator";
}

/**
 * Checks if the given token is a comment token or not.
 * @param {Token} token The token to check.
 * @returns {boolean} `true` if the token is a comment token.
 */
function isCommentToken(token) {
    return token.type === "Line" || token.type === "Block" || token.type === "Shebang";
}

/**
 * Checks if the given token is a keyword token or not.
 * @param {Token} token The token to check.
 * @returns {boolean} `true` if the token is a keyword token.
 */
function isKeywordToken(token) {
    return token.type === "Keyword";
}

/**
 * Gets the `(` token of the given function node.
 * @param {ASTNode} node The function node to get.
 * @param {SourceCode} sourceCode The source code object to get tokens.
 * @returns {Token} `(` token.
 */
function getOpeningParenOfParams(node, sourceCode) {

    // If the node is an arrow function and doesn't have parens, this returns the identifier of the first param.
    if (node.type === "ArrowFunctionExpression" && node.params.length === 1) {
        const argToken = sourceCode.getFirstToken(node.params[0]);
        const maybeParenToken = sourceCode.getTokenBefore(argToken);

        return isOpeningParenToken(maybeParenToken) ? maybeParenToken : argToken;
    }

    // Otherwise, returns paren.
    return node.id
        ? sourceCode.getTokenAfter(node.id, isOpeningParenToken)
        : sourceCode.getFirstToken(node, isOpeningParenToken);
}

/**
 * Checks whether or not the tokens of two given nodes are same.
 * @param {ASTNode} left A node 1 to compare.
 * @param {ASTNode} right A node 2 to compare.
 * @param {SourceCode} sourceCode The ESLint source code object.
 * @returns {boolean} the source code for the given node.
 */
function equalTokens(left, right, sourceCode) {
    const tokensL = sourceCode.getTokens(left);
    const tokensR = sourceCode.getTokens(right);

    if (tokensL.length !== tokensR.length) {
        return false;
    }
    for (let i = 0; i < tokensL.length; ++i) {
        if (tokensL[i].type !== tokensR[i].type ||
            tokensL[i].value !== tokensR[i].value
        ) {
            return false;
        }
    }

    return true;
}

/**
 * Check if the given node is a true logical expression or not.
 *
 * The three binary expressions logical-or (`||`), logical-and (`&&`), and
 * coalesce (`??`) are known as `ShortCircuitExpression`.
 * But ESTree represents those by `LogicalExpression` node.
 *
 * This function rejects coalesce expressions of `LogicalExpression` node.
 * @param {ASTNode} node The node to check.
 * @returns {boolean} `true` if the node is `&&` or `||`.
 * @see https://tc39.es/ecma262/#prod-ShortCircuitExpression
 */
function isLogicalExpression(node) {
    return (
        node.type === "LogicalExpression" &&
            (node.operator === "&&" || node.operator === "||")
    );
}

/**
 * Check if the given node is a nullish coalescing expression or not.
 *
 * The three binary expressions logical-or (`||`), logical-and (`&&`), and
 * coalesce (`??`) are known as `ShortCircuitExpression`.
 * But ESTree represents those by `LogicalExpression` node.
 *
 * This function finds only coalesce expressions of `LogicalExpression` node.
 * @param {ASTNode} node The node to check.
 * @returns {boolean} `true` if the node is `??`.
 */
function isCoalesceExpression(node) {
    return node.type === "LogicalExpression" && node.operator === "??";
}

/**
 * Check if given two nodes are the pair of a logical expression and a coalesce expression.
 * @param {ASTNode} left A node to check.
 * @param {ASTNode} right Another node to check.
 * @returns {boolean} `true` if the two nodes are the pair of a logical expression and a coalesce expression.
 */
function isMixedLogicalAndCoalesceExpressions(left, right) {
    return (
        (isLogicalExpression(left) && isCoalesceExpression(right)) ||
            (isCoalesceExpression(left) && isLogicalExpression(right))
    );
}

/**
 * Checks if the given operator is a logical assignment operator.
 * @param {string} operator The operator to check.
 * @returns {boolean} `true` if the operator is a logical assignment operator.
 */
function isLogicalAssignmentOperator(operator) {
    return LOGICAL_ASSIGNMENT_OPERATORS.has(operator);
}

/**
 * Get the colon token of the given SwitchCase node.
 * @param {ASTNode} node The SwitchCase node to get.
 * @param {SourceCode} sourceCode The source code object to get tokens.
 * @returns {Token} The colon token of the node.
 */
function getSwitchCaseColonToken(node, sourceCode) {
    if (node.test) {
        return sourceCode.getTokenAfter(node.test, isColonToken);
    }
    return sourceCode.getFirstToken(node, 1);
}

/**
 * Gets ESM module export name represented by the given node.
 * @param {ASTNode} node `Identifier` or string `Literal` node in a position
 * that represents a module export name:
 *   - `ImportSpecifier#imported`
 *   - `ExportSpecifier#local` (if it is a re-export from another module)
 *   - `ExportSpecifier#exported`
 *   - `ExportAllDeclaration#exported`
 * @returns {string} The module export name.
 */
function getModuleExportName(node) {
    if (node.type === "Identifier") {
        return node.name;
    }

    // string literal
    return node.value;
}

/**
 * Returns literal's value converted to the Boolean type
 * @param {ASTNode} node any `Literal` node
 * @returns {boolean | null} `true` when node is truthy, `false` when node is falsy,
 *  `null` when it cannot be determined.
 */
function getBooleanValue(node) {
    if (node.value === null) {

        /*
         * it might be a null literal or bigint/regex literal in unsupported environments .
         * https://github.com/estree/estree/blob/14df8a024956ea289bd55b9c2226a1d5b8a473ee/es5.md#regexpliteral
         * https://github.com/estree/estree/blob/14df8a024956ea289bd55b9c2226a1d5b8a473ee/es2020.md#bigintliteral
         */

        if (node.raw === "null") {
            return false;
        }

        // regex is always truthy
        if (typeof node.regex === "object") {
            return true;
        }

        return null;
    }

    return !!node.value;
}

/**
 * Checks if a branch node of LogicalExpression short circuits the whole condition
 * @param {ASTNode} node The branch of main condition which needs to be checked
 * @param {string} operator The operator of the main LogicalExpression.
 * @returns {boolean} true when condition short circuits whole condition
 */
function isLogicalIdentity(node, operator) {
    switch (node.type) {
        case "Literal":
            return (operator === "||" && getBooleanValue(node) === true) ||
                  (operator === "&&" && getBooleanValue(node) === false);

        case "UnaryExpression":
            return (operator === "&&" && node.operator === "void");

        case "LogicalExpression":

            /*
             * handles `a && false || b`
             * `false` is an identity element of `&&` but not `||`
             */
            return operator === node.operator &&
                    (
                        isLogicalIdentity(node.left, operator) ||
                        isLogicalIdentity(node.right, operator)
                    );

        case "AssignmentExpression":
            return ["||=", "&&="].includes(node.operator) &&
               operator === node.operator.slice(0, -1) &&
               isLogicalIdentity(node.right, operator);

       // no default
    }
    return false;
}

/**
 * Checks if an identifier is a reference to a global variable.
 * @param {Scope} scope The scope in which the identifier is referenced.
 * @param {ASTNode} node An identifier node to check.
 * @returns {boolean} `true` if the identifier is a reference to a global variable.
 */
function isReferenceToGl