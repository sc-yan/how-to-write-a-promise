class MyPromise{
    constructor(executor) {
        this.status = "pending";
        this.value = undefined;
        // This array is used to store all the onResolve functions in the chain call
        this.resolveArr = [];
        // // This array is used to store all the onReject functions in the chain call
        this.rejectArr = [];
        // Because the resolve function and the reject function share a lot of common code logic,
        //   the common logic is written as a separate change function
        let change = (status, value) => {
            if(this.status !== "pending") return;
            this.status = status;
            this.value = value;
            // The handlers are selected based on the current state of the Promise.
            let fnArr = status === "resolved" ? this.resolveArr : this.rejectArr;
            // Call functions of fnArr
            fnArr.forEach(item => {
                if(typeof item !== "function") return;
                item(this. value);
            })
        }
        let resolve = result => {
            change("resolved", result)
        }
        let reject = reason => {
            change("rejected", reason);
        }
        try {
            executor(resolve, reject)
        } catch(err) {
            reject(err)
        }
    }
    catch(rejectFn) {
        return this.then(null, rejectFn)
    }
    then(resolveFn, rejectFn) {
        // If the two arguments passed in are not functions, the result is returned directly
        if(typeof resolveFn !== "function") {
            resolveFn = result => {
                return result;
            }
        }
        if(typeof rejectFn !== "function") {
            rejectFn = reason => {
                return MyPromise.reject(reason);
            }
        }
        return new MyPromise((resolve, reject) => {
            this.resolveArr.push(result => {
                try {
                    // Get result after the promise is successed.
                    let x = resolveFn(result);

                    // If x is an instance of a promise, continue to call the `.then` method
                    if(x instanceof MyPromise) {
                        x.then(resolve, reject)
                        return;
                    }

                    resolve(x);
                } catch(err) {
                    reject(err)
                }
            })
            this.rejectArr.push(reason => {
                try {
                    let x = rejectFn(reason);

                    if(x instanceof MyPromise) {
                        x.then(resolve, reject)
                        return;
                    }

                    resolve(x);
                } catch(err) {
                    reject(err)
                }
            })
        })
    }
    finally(finallyFn) {
        let P = this.constructor;
        return this.then(
            value => P.resolve(finallyFn()).then(() => value),
            reason => P.reject(finallyFn()).then(() => reason)
        )
    }

    static resolve(result) {
        return new MyPromise(resolve => {
            resolve(result)
        })
    }

    static reject(reason) {
        return new MyPromise((_, reject) => {
            reject(reason);
        })
    }

    // Receive array parameter
    static all(promiseList) {
        // Returns a new instance
        return new MyPromise((resolve, reject) => {
            let index = 0,
                results = [];
            for(let i = 0; i < promiseList.length; i++) {
                let item = promiseList[i];
                if(!(item instanceof MyPromise)) return;
                item.then(result => {
                    index++;
                    results[i] = result;
                    if(index === promiseList.length) {
                        resolve(results);
                    }
                }).catch(reason => {
                    reject(reason);
                })
            }
        })
    }
}


let p1 = new MyPromise((resolve, reject) => {
    resolve(1);
})
let p2 = new MyPromise((resolve, reject) => {
    reject(2);
})
console.log(p1);
console.log(p2);
