import { NativeErrors, ThrowError, VMError } from "../logger/logger"
import { CheckParameterCount, makeid } from "./builtinHelper"
import { ProcessManager } from "./processManager"
import { Atom, VMDatatype } from "./structs"

const proto = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('name', args.length, 2)
    if(err != undefined) {
        return err
    }

    /*
    * Function code
    */

    return []
}

const BuiltinPrint = (args: any[], processManager: ProcessManager): (any | VMError) => {
    // check for correct parameter count
    var err = CheckParameterCount('print', args.length, 1)
    if(err != undefined) {
        return err
    }
    // print value
    var value = args[0]
    var printedValue: any = value
    // compare types
    // if type = vmDatatype, print toString() representation
    if(value instanceof VMDatatype) {
        // value is a custom datatype
        printedValue = ':'+value.toString() // get string representation
    }
    // print value
    console.log(printedValue)
    // return :ok atom
    return value
}

const ArrayNew = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('array_new', args.length, 0)
    if(err != undefined) {
        return err
    }

    return []
}

// takes: array, element; returns: array
const ArrayPush = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('array_new', args.length, 2)
    if(err != undefined) {
        return err
    }

    var arr: any[] = args[0]
    var elem: any = args[1]

    arr.push(elem)

    return arr
}

// takes: array, index; returns: array
const ArrayGetDepr = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('array_new', args.length, 2)
    if(err != undefined) {
        return err
    }

    var arr: any[] | any = args[0]
    var index: number = Number(args[1])

    if(!Array.isArray(arr)) { // check if is array, if not, return the value
        return arr
    }

    //console.log(arr[index])

    return arr[index]
}

// takes: array, index; returns: array
const ArrayGet = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('array_new', args.length, 2)
    if(err != undefined) {
        return err
    }

    /*
        Overloading custom types
        - if index is not a number -> check if arr has a header with a specific name -> type description
        - if it is a typed array -> call head.get (list index) and return its value
        - if it is not a typed array -> throw error
    */

    var arr: any[] | any = args[0]
    var index: any = args[1]

    if(!Array.isArray(arr)) { // check if is array, if not return value
        return arr
    }

    if(arr.length == 0) { // check if array is empty
        return arr
    }

    if(isNaN(Number(index)) == false) {
        // index is number, return default index
        if(index >= arr.length) {
            return new Atom('none')
        }
        return arr[index]
    }

    if(arr[0] instanceof Atom) {
        // typed array
        return processManager.executeFunction(arr[0].getValue() + '.get', [arr, index])
    }

    ThrowError(NativeErrors.INTERNAL, `The index of a list has to be a number or a the list has to be typed`)
    return arr

}

// takes: array, start, end -> array
const ArraySplice = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('array_splice', args.length, 3)
    if(err != undefined) {
        return err
    }

    // splice 1, 5 -> start: 1, 5-1 -> 1 - 4
    // array[1:5] -> 1, 2, 3, 4
    // array[10:(86-10+1)] -> 10, ..., 

    var arr: any[] | any = args[0]
    var start: number = args[1]
    var end: number = args[2]

    if(!Array.isArray(arr)) { // check if it is array
        // not an array
        return arr
    }

    if(end >= arr.length) {
        end = arr.length
    } else if(end == -1) {
        end = arr.length
    }

    //return arr.splice(start, end - start)
    return arr.slice(start, end)
}

// takes: array -> array
const ArrayClean = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('array_clean', args.length, 1)
    if(err != undefined) {
        return err
    }

    var arr: any[] | any = args[0]

    if(!Array.isArray(arr)) {
        return arr
    }

    if(arr.length == 1) {
        return arr[0]
    }

    return arr
}

// takes: array -> array
const ArrayShuffle = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('shuffle', args.length, 1)
    if(err != undefined) {
        return err
    }

    var arr: any[] | any = args[0]

    if(!Array.isArray(arr)) {
        return arr
    }

    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    return arr
}

// takes: function, array -> any
const Call = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('call', args.length, 2)
    if(err != undefined) {
        return err
    }
    
    return processManager.executeFunction(args[0], args[1])
}

// redefines result
// takes: array, function(elem, index, array, result) -> value
const ForEach = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('foreach', args.length, 2)
    if(err != undefined) {
        return err
    }
    
    var result: any = new Atom('none')
    var array: any[] = args[0]
    var fun: Atom = args[1]
    var funName: string = fun.getValue()

    var index = 0
    for(var elem of array) {
        result = processManager.executeFunction(funName, [elem, index, array, result])
        index++
    }

    return result
}

// redefines result
// takes: array, function(elem, index, array, result), firstResult -> value
const ForEachSpec = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('foreach', args.length, 3)
    if(err != undefined) {
        return err
    }
    
    var result: any = args[2]
    var array: any[] = args[0]
    var fun: Atom = args[1]
    var funName: string = fun.getValue()

    var index = 0
    for(var elem of array) {
        result = processManager.executeFunction(funName, [elem, index, array, result])
        index++
    }

    return result
}

// pushes result into list
// takes: array, function(elem, index, array) -> array
const ForEachLs = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('foreachls', args.length, 2)
    if(err != undefined) {
        return err
    }
    
    var result: any[] = []
    var array: any[] = args[0]
    var fun: Atom = args[1]
    var funName: string = fun.getValue()

    var index = 0
    for(var elem of array) {
        //result.push(processManager.executeFunction(funName, [elem, index, array]))
        var res = processManager.executeFunction(funName, [elem, index, array, result])
        if((res instanceof Atom && res.getValue() == 'none') == false) {
            result.push(res)
        }
        index++
    }

    return result
}

// TODO: implement native range operator (min ... max)
// standard integer range from min to max
// takes: min, max -> array
const Range = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('range', args.length, 2)
    if(err != undefined) {
        return err
    }

    var min: number = args[0]
    var max: number = args[1]
    
    if(min >= max) {
        return ThrowError(NativeErrors.RANGE, `Range function requires: min < max. ${min} >= ${max}`)
    }

    var result: number[] = []
    for(var i = min; i < max; i++) result.push(i)

    return result
}

const Len = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('len', args.length, 1)
    if(err != undefined) {
        return err
    }

    if(Array.isArray(args[0]) == false) {
        // no array
        return new Atom('false')
    }

    var arr: any[] = args[0]
    return arr.length
}

// takes: array -> boolean
// also: by doing (:true ++ array), you can check if all elements are equal to this specific value
const Identical = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('identical', args.length, 1)
    if(err != undefined) {
        return err
    }

    var arr: any[] = args[0]
    var result: boolean = true
    var last: any = undefined

    var index = 0
    for(var elem of arr) {
        if(index == 0) {
            last = elem
            index++
            continue
        }
        if(elem instanceof VMDatatype && last instanceof VMDatatype) {
            if(elem.getValue() != last.getValue()) {
                result = false
                break
            } else {
                last = elem
                index++
                continue
            }
        }

        if(elem != last) {
            result = false
            break
        }

        last = elem
        index++
    }

    switch(result){
        case true:
            return new Atom('true')
        case false:
            return new Atom('false')
    }
    return result
}

// takes: string, function -> function(url, args)
const route = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('route', args.length, 2)
    if(err != undefined) {
        return err
    }

    var url: string = args[0]
    var f: Atom = args[1]

    return processManager.executeFunction(f.getValue(), [url, url.split('/')])
}

// takes: function (args) array -> array
const Performance = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('performance', args.length, 2)
    if(err != undefined) {
        return err
    }

    var fun: Atom = args[0]
    var arr: any[] = args[1]

    var id = fun.getValue()
    console.time(id)

    processManager.executeFunction(fun.getValue(), arr)

    console.timeEnd(id)

    return []
}

// takes: min, max -> number
const Random = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('random', args.length, 2)
    if(err != undefined) {
        return err
    }

    var min: number = Math.floor(args[0])
    var max: number = Math.ceil(args[1])

    return Math.floor(Math.random() * (max - min) + min)
}

// takes: array (2d) -> [array, array]
const separate = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('separate', args.length, 1)
    if(err != undefined) {
        return err
    }

    var arr: any[] = args[0]

    // go over arr
    // check if 2 dimensional, if not, second value is :none
    // split into two seperate arrays
    // return new array containing both

    var arr0: any[] = []
    var arr1: any[] = []

    for(var elem of arr) {
        var first: any = ''
        var second: any = ''
        if(Array.isArray(elem) && elem.length > 2) {
            // length is at least two
            first = elem[0]
            second = elem.slice(1)
            arr0.push(first)
            arr1.push(second)
            continue
        } else if(Array.isArray(elem) && elem.length == 2) {
            // length is at least two
            first = elem[0]
            second = elem[1]
            arr0.push(first)
            arr1.push(second)
            continue
        } else if(Array.isArray(elem) && elem.length == 1) {
            // length is one
            first = elem[0]
            second = new Atom('none')
            arr0.push(first)
            arr1.push(second)
            continue
        } else {
            first = elem
            second = new Atom('none')
            arr0.push(first)
            arr1.push(second)
            continue
        }
    }

    return [arr0, arr1]
}

const arctan = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('arctan', args.length, 1)
    if(err != undefined) {
        return err
    }

    var a: number = args[0]
    return Math.atan(a)
}

// takes: target, any -> any
const Assign = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('assign', args.length, 2)
    if(err != undefined) {
        return err
    }

    var target: any = args[0]
    var source: any = args[1]
    return Object.assign(target, source)
}

// API Framework //
// takes: port, listen_function (port), http_request_function (method, url) -> :ok | :err
const APIListen = (args: any[], processManager: ProcessManager): (any | VMError) => {
    var err = CheckParameterCount('api_listen', args.length, 3)
    if(err != undefined) {
        return err
    }

    const express = require('express')
    var port: number = args[0]
    var fun: Atom = args[1]
    var requestFun: Atom = args[2]
    
    var app = express()

    app.get('*', (req: any, res: any) => {
        res.send(processManager.executeFunction(requestFun.getValue(), [new Atom('get'), req.originalUrl]))
    })

    app.post('*', (req: any, res: any) => {
        res.send(processManager.executeFunction(requestFun.getValue(), [new Atom('post'), req.originalUrl]))
    })

    app.put('*', (req: any, res: any) => {
        res.send(processManager.executeFunction(requestFun.getValue(), [new Atom('put'), req.originalUrl]))
    })

    app.delete('*', (req: any, res: any) => {
        res.send(processManager.executeFunction(requestFun.getValue(), [new Atom('delete'), req.originalUrl]))
    })

    app.listen(port, () => {
        processManager.executeFunction(fun.getValue(), [port])
    })

    return new Atom('ok')
}

export const Builtin = new Map<string, (args: any[], processManager: ProcessManager) => any>([
    ['print', BuiltinPrint],
    ['array_new', ArrayNew],
    ['array_push', ArrayPush],
    ['array_get', ArrayGet],
    ['array_clean', ArrayClean],    
    ['splice', ArraySplice],
    ['shuffle', ArrayShuffle],
    ['call', Call],
    ['foreach', ForEach],
    ['foreachls', ForEachLs],
    ['foreachspec', ForEachSpec],
    ['range', Range],
    ['len', Len],
    ['identical', Identical],
    ['route', route],
    ['performance', Performance],
    ['random', Random],
    ['separate', separate],
    ['arctan', arctan],
    ['assign', Assign],
    ['apilisten', APIListen]
])