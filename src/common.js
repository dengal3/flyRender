const TOKENTYPE = {
    startTag: 1,
    endTag  : 2,
    text    : 3
};
const NODETYPE = {
    html : 1,
    logic: 2,
    text : 3
};
const DONTNEEDENDBABELTAGS = {
    img: true,
    input: true,

}

const LOGICCONTROLLKEYS = {
    cond: true,
    items: true
}
export {
    TOKENTYPE,
    NODETYPE,
    DONTNEEDENDBABELTAGS,
    LOGICCONTROLLKEYS
}