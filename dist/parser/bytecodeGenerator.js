"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BytecodeGenerator = void 0;
const logger_1 = require("../logger/logger");
const parser_1 = require("../bytecodes/parser");
const builtinHelper_1 = require("../vm/builtinHelper");
const parserExtension_1 = require("./parserExtension");
const autodoc_1 = require("../autodoc/autodoc");
const groupBy = require('group-by');
class BytecodeGenerator {
    /*
        Process Functions change the classes fields, no return
        Handle Functions return bytecode
        Get Functions return values or structs
    */
    constructor(ast) {
        this.ast = ast;
        this.module = "";
        this.imports = [];
        this.helperFunctions = [];
        this.parserExtensionManager = new parserExtension_1.ParserExtensionManager('');
        this.parserExtensionManager.register(new autodoc_1.Autodoc());
    }
    generateBytecode() {
        var funs = [];
        this.ast.tree.forEach((element) => {
            element.forEach(element => {
                var temp = this.walk(element);
                if (temp != undefined) {
                    funs.push(temp);
                }
            });
        });
        // add helper functions
        funs.push(...this.helperFunctions);
        this.parserExtensionManager.end();
        // return funs
        return this.convertIntermediate(funs);
    }
    convertIntermediate(funs) {
        var bytecode = new parser_1.ParserBytecode(this.module, this.imports);
        /*
            Group and sort all functions by name
            Go over all functions -> create their own description
            Add description to bytecode
        */
        var groups = groupBy(funs, 'name'); // grouped functions by name [{GroupName, Functions[]}]
        Object.entries(groups).forEach(([key, value]) => {
            var entry = groups[key]; // group, all implementations for a function
            var generatedFunctionData = this.generateFunction(entry);
            var newFunction = {
                name: key,
                definitions: generatedFunctionData[0],
                implementations: generatedFunctionData[1]
            };
            bytecode.addDescription(newFunction);
        });
        return bytecode;
    }
    generateFunction(funs) {
        var definitions = [];
        var implementations = [];
        for (var fun of funs) {
            if (fun.typedef == true) {
                // add new definition
                var argNames = [];
                fun.args.forEach((value) => {
                    if (value[0] != undefined) {
                        argNames.push(value[0]); // add value to names
                    }
                });
                definitions.push({
                    args: argNames,
                    arglength: argNames.length,
                    similar: this.determineSimilar(argNames),
                    rules: []
                });
            }
            else {
                // No type definition, normal function
                // every function has own implementation and rules, they get insered into rules
                // find correct implementation, if not found create new one
                var argNames = [];
                var argRules = [];
                fun.args.forEach((value) => {
                    if (value[0] != undefined) {
                        argNames.push(value[0]); // add value to names
                    }
                    argRules.push(value[1]);
                });
                var definitionIndex = -1; // index of correspodning definition
                // find definition based on arg length
                var index = 0;
                for (var def of definitions) {
                    if (def.arglength == argNames.length) {
                        // found correct definition
                        definitionIndex = index;
                        break;
                    }
                    index++;
                }
                // no definition
                if (definitionIndex == -1) {
                    // no definition found, create new one
                    definitions.push({
                        args: argNames,
                        arglength: argNames.length,
                        similar: this.determineSimilar(argNames),
                        rules: []
                    });
                    // set index
                    definitionIndex = definitions.length - 1;
                }
                // process function, create implementations
                var implementationID = implementations.length;
                var argRule = {
                    implementation: implementationID,
                    args: []
                };
                // go over args, add their corresponding rule
                var i = 0;
                for (var arg of argNames) {
                    argRule.args.push({
                        index: i,
                        name: arg,
                        rule: argRules[i].rule,
                        value: argRules[i].value
                    });
                    i++;
                }
                // change definition names, to match with real arg names
                definitions[definitionIndex].args = argNames;
                definitions[definitionIndex].rules.push(argRule); // add rule
                // add implementation
                implementations.push({
                    index: implementationID,
                    bytecode: fun.bytecode
                });
            }
        }
        return [definitions, implementations];
    }
    testSimilar(s) {
        console.log(this.determineSimilar(s));
    }
    determineSimilar(names) {
        var result = [];
        var cached = [];
        names.forEach((value, index) => {
            // check if same char is already cached
            var succ = false;
            cached.forEach((block, i) => {
                if (succ == true) {
                    return;
                }
                if (block[0] == value) {
                    // already cached
                    result[block[1]].push(index);
                    succ = true;
                }
            });
            if (succ == false) {
                // not cached
                var cachedIndex = result.length;
                result.push([index]); // push index to result
                cached.push([value, cachedIndex]); // cache result
            }
        });
        return result;
    }
    walk(expr) {
        if (expr == null || expr == undefined) {
            return undefined;
        }
        var fun = undefined;
        switch (expr.ident) {
            case 'definition':
                this.processDefinition(expr);
                break;
            case 'function_def':
                fun = this.processFunction(expr);
                break;
            case 'function_def_empty':
                fun = this.processFunction(expr);
                break;
            case 'function_def_chained':
                fun = this.processFunctionChained(expr);
                break;
            case 'function_def_empty_chained':
                fun = this.processFunctionChained(expr);
                break;
            case 'function_type':
                fun = this.processFunctionType(expr);
                break;
            case 'comment':
                this.parserExtensionManager.invoke(expr.value.split(',').join(''));
                break;
        }
        return fun;
    }
    // collect all bytecode for function
    handleExpr(expr) {
        var bytecode = [];
        switch (expr.ident) {
            case 'name':
                bytecode.push(...this.handleName(expr));
                break;
            case 'number':
                bytecode.push(...this.handleNumber(expr));
                break;
            case 'string':
                bytecode.push(...this.handleString(expr));
                break;
            case 'atom':
                bytecode.push(...this.handleAtom(expr));
                break;
            case 'array':
                bytecode.push(...this.handleArray(expr));
                break;
            case 'array_index':
                bytecode.push(...this.handleArrayIndex(expr));
                break;
            case 'call':
                bytecode.push(...this.handleCall(expr));
                break;
            case 'call_empty':
                bytecode.push(...this.handleCall(expr));
                break;
            case 'operation':
                bytecode.push(...this.handleOperation(expr));
                break;
            case 'operation_chained':
                bytecode.push(...this.handleOperationChained(expr));
                break;
            case 'set':
                bytecode.push(...this.handleSet(expr));
                break;
            case 'special_op':
                bytecode.push(...this.handleSpecialOperation(expr));
                break;
        }
        return bytecode;
    }
    /*
        Handle
    */
    // returns bytecode
    handleName(expr) {
        return [`push ${expr.value}`];
    }
    handleNumber(expr) {
        return [`pushl ${expr.value}`];
    }
    handleString(expr) {
        return [`pushl ${expr.value}`];
    }
    handleAtom(expr) {
        return [`pushl :${expr.value.value}`];
    }
    handleArrayIndex(expr) {
        return [
            `push ${this.getName(expr.array)}`,
            ...this.handleExpr(expr.value),
            `call array_get 2` // internal function to get value from array
        ];
    }
    handleArray(expr) {
        var empty = (expr.value[0] == null);
        if (empty) {
            return [
                'call array_new 0' // internal function
            ];
        }
        // not empty
        var lines = [];
        lines.push('call array_new 0');
        lines.push(...this.handleExpr(expr.value[0]));
        lines.push('call array_push 2');
        for (var child of expr.value[1][1]) {
            lines.push(...this.handleExpr(child[2]));
            lines.push('call array_push 2');
        }
        return lines;
    }
    handleOperation(expr) {
        var op = expr.op;
        var lines = [];
        lines.push(...this.handleExpr(expr.value[0]));
        lines.push(...this.handleExpr(expr.value[1]));
        lines.push(`operation ${op}`);
        return lines;
    }
    handleOperationChained(expr) {
        var lines = [];
        // process first
        lines.push(...this.handleExpr(expr.values[0]));
        // process following
        for (var elem of expr.values[1]) {
            // handle each individual op
            // handle value
            lines.push(...this.handleExpr(elem[2]));
            // call operation
            lines.push(`operation ${elem[0]}`);
        }
        return lines;
    }
    handleSpecialOperation(expr) {
        var lines = [];
        // get arg names
        var args = this.getNames(expr.result);
        //lines.push(...this.handleExpr(expr.value)) // get value
        var value = this.handleExpr(expr.value); // lines of value data
        // go over args -> initialize, set their values => value[i]
        var index = 0;
        for (var arg of args) {
            if (index == (args.length - 1)) {
                // last element
                lines.push(...[
                    `local ${arg}`,
                    ...value,
                    `pushl ${index}`,
                    `pushl -1`,
                    `call splice 3`,
                    `call array_clean 1`,
                    `pull ${arg}`
                ]);
                continue;
            }
            lines.push(...[
                `local ${arg}`,
                ...value,
                `pushl ${index}`,
                `call array_get 2`,
                `pull ${arg}`
            ]);
            index++;
        }
        lines.push(...value); // push value
        return lines;
    }
    handleSet(expr) {
        var lines = [];
        var args = []; // collect all arg names
        for (var elem of expr.args) {
            args.push(this.getValue(elem[0]));
        }
        var ops = []; // operations
        var transferred = [];
        // get ops
        var index = 0;
        for (var elem of expr.ops) {
            var op = elem[4];
            if ((index > 0 && op == '<-') || (index == 0 && op != '<-')) {
                (0, logger_1.ThrowError)(logger_1.NativeErrors.INTERNAL, 'Iteration operator has to be first');
                process.exit(1);
            }
            // check if value is name, if it is, check if its an arg, if not, add it to transfered args
            if (elem[6].ident == 'name') {
                var val = this.getValue(elem[6]);
                var found = false;
                for (var el of args) {
                    if (el == val)
                        found = true; // if found in args
                }
                if (found == false) {
                    transferred.push(val);
                    ops.push({
                        arg: this.getValue(elem[2]),
                        value: this.handleExpr(elem[6]),
                        op: `ext=>:${transferred.length - 1}` // external assignment, important
                    });
                    index++;
                    continue;
                }
            }
            ops.push({
                arg: this.getValue(elem[2]),
                value: this.handleExpr(elem[6]),
                op: elem[4]
            });
            index++;
        }
        // we have ops, transferred
        if (ops.length == 0) {
            return lines;
        }
        lines.push('call array_new 0');
        // get transferred values
        lines.push('call array_new 0'); // create new array
        for (var trans of transferred) { // fill array with values that should be transferred
            lines.push(`push ${trans}`);
            lines.push('call array_push 2');
        }
        lines.push('call array_push 2');
        // add this array to iterator array
        lines.push(...ops[0].value);
        //lines.push('call array_push 2')
        lines.push('operation ++');
        // generate helper function name
        var helperid = (0, builtinHelper_1.makeid)(8);
        // push helper function name
        lines.push(`pushl :${helperid}`);
        lines.push(`call foreachls 2`);
        // Helper functions //
        // create helper function
        var helperfun = {
            name: helperid,
            typedef: false,
            args: [
                ['elem', { rule: '', value: '' }],
                ['index', { rule: '', value: '' }],
                ['list', { rule: '', value: '' }],
                ['result', { rule: '', value: '' }]
            ],
            bytecode: []
        };
        var bytecode = [];
        // bytecode
        // initialize args
        // if -> identical | elem/:none
        // init iterator
        bytecode.push(...[
            `local ${ops[0].arg}`,
            `push elem`,
            `pull ${ops[0].arg}`
        ]);
        // decrement index
        bytecode.push(...[
            `push index`,
            `pushl 1`,
            `operation -`,
            `pull index`
        ]);
        // initialize args
        for (var i = 1; i < ops.length; i++) {
            var o = ops[i]; //op
            var b = o.op.split(':');
            if (b.length > 1) {
                // external
                bytecode.push(`local ${o.arg}`);
                bytecode.push(...[
                    `push list`,
                    `call Head 1`,
                    `pushl ${b[1]}`,
                    `call array_get 2`,
                    `pull ${o.arg}`
                ]);
            }
            else {
                // normal
                bytecode.push(`local ${o.arg}`);
                bytecode.push(...o.value),
                    bytecode.push(`pull ${o.arg}`);
            }
        }
        // if -> identical
        // create array -> fill: :true, ...rules
        // call identical 1
        // push elem
        // call if 2
        bytecode.push(...[
            `call array_new 0`,
            `pushl :true`,
            `call array_push 2`
        ]);
        // go over rules, push them
        for (var rule of expr.rules) {
            var bc = this.handleExpr(rule[2]); // get specific bytecode
            bytecode.push(...bc);
            bytecode.push(`call array_push 2`); // push onto array
        }
        if (expr.result == null) {
            bytecode.push(...[
                `call identical 1`,
                `push elem`,
                `call if 2`
            ]);
        }
        else {
            bytecode.push(...[
                `call identical 1`,
                ...this.handleExpr(expr.result[2]),
                `call if 2`
            ]);
        }
        /*bytecode.push(...[
            `call identical 1`,
            `push elem`,
            `call if 2`
        ])*/
        // add function specific bytecode (done)
        // add bytecode to helperfun
        helperfun.bytecode = bytecode;
        // create second helper function, index = 0 => :none
        var helperfun2 = {
            name: helperid,
            typedef: false,
            args: [
                ['elem', { rule: '', value: '' }],
                ['index', { rule: '=', value: '0' }],
                ['list', { rule: '', value: '' }],
                ['result', { rule: '', value: '' }]
            ],
            bytecode: [
                `pushl :none`
            ]
        };
        // add helperfun and helperfun' to helpers
        this.helperFunctions.push(helperfun);
        this.helperFunctions.push(helperfun2);
        return lines;
    }
    handleCall(expr) {
        var callName = this.getName(expr.name);
        if (callName == undefined) {
            (0, logger_1.ThrowError)(logger_1.NativeErrors.REFERENCE, `Function ${callName} not found`);
            return [];
        }
        var lines = [];
        // process args
        var callArgs = this.handleCallArgs(expr.args);
        lines.push(...callArgs[0]);
        lines.push(`call ${callName} ${callArgs[1]}`); // call function
        return lines;
    }
    handleCallArgs(expr) {
        var length = 0;
        if (expr.length == 0) {
            return [[], 0];
        }
        if (expr[0].length == 1) {
            length = 1;
        }
        else if (expr[0].length > 1) {
            length = expr[0][1].length + 1;
        }
        var lines = [];
        // handle first expr
        lines.push(...this.handleExpr(expr[0][0][2]));
        if (expr[0].length >= 2) {
            for (var ex of expr[0][1]) {
                lines.push(...this.handleExpr(ex[2]));
            }
        }
        return [lines, length];
    }
    handleFollowing(expr, varname) {
        var lines = [];
        lines.push(`pull ${varname}`);
        lines.push(...this.handleExpr(expr[2]));
        return lines;
    }
    /*
        Process
    */
    processFunctionType(expr) {
        var im = {
            name: this.getName(expr.name),
            typedef: true,
            args: [],
            bytecode: []
        };
        for (var type of expr.types) {
            var temp = [undefined, { rule: "", value: "" }];
            temp[0] = this.getType(type[1]);
            im.args.push(temp);
        }
        return im;
    }
    processFunction(expr) {
        var im = {
            name: this.getName(expr.name),
            typedef: false,
            args: [],
            bytecode: []
        };
        // define args
        for (var arg of expr.args) {
            var temp = [undefined, { rule: "", value: "" }];
            temp[0] = this.getName(arg[1]);
            if (arg[3] != null) {
                // rule exists
                temp[1] = this.getRule(arg[3]);
            }
            im.args.push(temp);
        }
        // define bytecode
        im.bytecode = this.handleExpr(expr.result);
        return im;
    }
    processFunctionChained(expr) {
        var im = {
            name: this.getName(expr.name),
            typedef: false,
            args: [],
            bytecode: []
        };
        // define args
        for (var arg of expr.args) {
            var temp = [undefined, { rule: "", value: "" }];
            temp[0] = this.getName(arg[1]);
            if (arg[3] != null) {
                // rule exists
                temp[1] = this.getRule(arg[3]);
            }
            im.args.push(temp);
        }
        var followup = this.getName(expr.followup);
        if (followup == undefined) {
            (0, logger_1.ThrowError)(logger_1.NativeErrors.INTERNAL, 'An unexpected error occurred');
            process.exit(1);
        }
        // define bytecode
        im.bytecode = this.handleExpr(expr.result);
        for (var elem of expr.following) {
            im.bytecode.push(...this.handleFollowing(elem, followup));
        }
        return im;
    }
    processDefinition(expr) {
        switch (this.getName(expr.value[0])) {
            case 'module':
                var value = this.getName(expr.value[1]);
                if (value !== undefined) {
                    this.module = value;
                    this.parserExtensionManager.module = this.module;
                }
                break;
            case 'import':
                /*
                    Either array or name
                    Name -> search in libs
                    [Name, Name, ...] -> search in libs
                    [Path, Name, Name, ...] -> search in path
                */
                if (expr.value[1].ident == 'array') {
                    var arr = this.getArray(expr.value[1]);
                    // format path
                    var prefix = '';
                    var start = 0;
                    if (arr[0][0] == '.' || arr[0][0] == '/') {
                        // path is first
                        start = 1;
                        var path = arr[0];
                        prefix = path;
                        if (path[path.length - 1] != '/') {
                            prefix += '/';
                        }
                    }
                    else {
                        // standard path for libs
                        prefix = './lib/';
                    }
                    for (var i = start; i < arr.length; i++) {
                        this.imports.push(prefix + arr[i] + '.lang');
                    }
                }
                else {
                    this.imports.push('./lib/' + this.getValue(expr.value[1]) + '.lang');
                }
                break;
        }
    }
    /*
        Get
    */
    getRule(expr) {
        return { rule: expr.rule, value: this.getValue(expr.value) };
    }
    getValue(expr) {
        if (expr.ident == 'atom') {
            return `:${expr.value.value}`;
        }
        else if (expr.ident == 'array') {
            return this.getArray(expr);
        }
        return `${expr.value}`;
    }
    getName(expr) {
        if (expr.ident != 'name') {
            return undefined;
        }
        return expr.value;
    }
    getNames(expr) {
        var names = [];
        switch (expr.ident) { // collect names
            case 'name':
                names.push(this.getValue(expr));
                break;
            case 'array_split':
                names.push(this.getValue(expr.values[0]));
                // get additional names
                for (var elem of expr.values[1]) {
                    names.push(this.getValue(elem[3])); // get name
                }
                break;
        }
        return names;
    }
    getType(expr) {
        switch (expr.ident) {
            case 'atom':
                return `${expr.value.value}`;
        }
        return this.getValue(expr);
    }
    getArray(expr) {
        var result = [];
        var empty = (expr.value[0] == null);
        if (empty) {
            return [];
        }
        // not empty
        result.push(this.getValue(expr.value[0]));
        for (var child of expr.value[1][1]) {
            result.push(this.getValue(child[2]));
        }
        return result;
    }
}
exports.BytecodeGenerator = BytecodeGenerator;
