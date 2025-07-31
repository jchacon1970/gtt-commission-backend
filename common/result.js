export class Result{
    constructor(value, error){
        this.value = value
        this.error = error
    }

    static ok(value){
        return new Result(value, null)
    }

    static fail(error){
        return new Result(null, error)
    }

    hasValue(){
        return this.value != undefined;
    }
}