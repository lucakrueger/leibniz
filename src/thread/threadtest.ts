import { threadId } from "worker_threads";
import { NativeErrors, ThrowError } from "../logger/logger";
import { Atom } from "../vm/structs";

export class ThreadManager {
    constructor() {}

    public start(f: (arg: any) => any, values: any[], threads: number) {

        if(threads == -1) {
            // dynamically choose threads
            if(values.length % 2 != 0) {
                // odd number of values -> adding :thread_ignore
                values.push(new Atom('thread_ignore'))
            }

            // even number of values
            // chunk size ≈ 8
            // values.length / threads ≈ 8
            // threads ≈ values.length / 8
            threads = Math.ceil(values.length / 8)
            if(threads > values.length) {
                threads = values.length
            }
        } else if(threads > values.length) {
            threads = values.length
        }

        //console.log(this.sliceIntoChunks(values, values.length/threads))
        // create chunks
        var chunks = this.sliceIntoChunks(values, values.length/threads)

        
    }

    private processChunk(f: (arg: any) => any, chunk: any[]) {
        var results: any[] = []
        for(var elem of chunk) {
            results.push(f(elem))
        }
        return results
    }

    private sliceIntoChunks(arr: any[], chunkSize: number): any[][] {
        const res = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            const chunk = arr.slice(i, i + chunkSize);
            res.push(chunk);
        }
        return res;
    }
    
}