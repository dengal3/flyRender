let i = 0;
export function guid() {
    // return 'xxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    //     var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    //     return v.toString(16);
    // }).toUpperCase();
    i++;
    return i;
};

export function gLastuid(){
    return i;
}

export function isSame(a, b) {
    if (typeof a === typeof b) {
        let type = typeof a
        if (type == 'string' || type == 'number') {
            return a === b
        } else if (type == 'object') {
            return JSON.stringify(a) === JSON.stringify(b)
        } else {
            return a === b
        }
    }
    return false
}