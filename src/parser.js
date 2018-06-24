import { guid, gLastuid } from './util'
import {NODETYPE, TOKENTYPE} from './common'
import CodeGenerator from './codeGen.js'
import {LOGICCONTROLLKEYS} from './common.js'


class Token {
    constructor(type, content, startIndex) {
        /*
            type:
                1: startTag,
                2: endTag,
                3: text
         */
        this.type = type
        this.content = content
        this.startIndex = startIndex
        this.endIndex = startIndex + content.length
    }
}

class Tree {
    constructor() {
        this.tree = []
        this.idMap = {}
    }

    addNode(node) {
        this.tree.push(node);
        this.idMap[node.getNodeId()] = this.tree.length-1
    }

    getNode(nodeId) {
        return this.tree[this.idMap[nodeId]]
    }

    getRoot() {
        return this.tree[0]
    }
}

class Node {
    constructor({type, tagName, parentId, token}) {
        /*
            节点类型
            1：DIV（HTML节点型）
            2：Logic (逻辑型：for，if等等) 
            3. 文本型（感觉也可以归类到DIV中？）
        */
        this.type       = type
        this.tagName    = tagName
        this.parentId   = parentId
        this.nodeId     = guid()
        this.domId      = 0
        this.childNodes = []
        //this.token      = token
        if (token) {
            let {props, attrs}  = Node.retrieveProps(token.content)
            //this.props = props
            //this.attrs = attrs
            this.props = Object.assign(props, attrs);
        }
        if (type == NODETYPE.text) {
            this.props.innerHTML   = token.content
        }
    }

    static retrieveProps(content) {
        let props = {},
            attrs = {};
        //console.log(content)
        content.replace(/\s+([^\s><]+)=\"([^"]+)\"/g, (item, key, value)=>{

            // eg, value="123"/
            if (value.slice(value.length - 1) == '/') {
                value = value.slice(0, value.length-1);
            }


            if (key[0] === ':') {
                props[key.slice(1)] = value
            } else {
                attrs[key] = value.replace(/['"]/g, '')
            }

        })
        return {props, attrs};
    }

    setParentId(pid) { 
        this.parentId = pid
    }

    getChildNodes() {
        return this.childNodes
    }

    getNodeId() {
        return this.nodeId;
    }

    addChild(childNode) {
        this.childNodes.push(childNode)
    }

    setDOMId(trueDOMId) {
        this.domId = trueDOMId
    }

    getDOMId() {
        return this.domId
    }

    refresh(prop, text) {
        let that = this;

        function $$(selector) {
            return document.querySelectorAll(selector)[0];
        }
        console.log('更新字段:', prop)
        let dom = $$(`*[data-domid="${that.domId}"]`);
        if (prop in LOGICCONTROLLKEYS) {
            dom.innerHTML = text
        } else {
            dom[prop] = text;
        }
    }

    getValueOfProp(prop) {
        if (this.props[prop] != undefined) {
            return this.props[prop]
        }
    }
}

class Parser {
    constructor(text) {
        this.content   = text
        this.tokenList = []
        this.tree      = new Tree();
    }

    getTree(text) {
        let that = this;

        this._tokenize();
        this._buildTree();
        
        return this.tree;
    }

    _tokenize() {
        let that = this,
            text = that.content

        text.replace(/(?:<)(\/[^<>]+)(?=>)|(?:<)([^<>]+)\/?(?=>)|(?:>)([^><]+)(?=<)/g, 
                        (match, endTag, startTag, text, index) => {
                            if (startTag) {
                                that.tokenList.push(
                                    new Token(TOKENTYPE.startTag, startTag.replace(/\n/, ''), index)
                                )
                                // 如果单元式节点 img，input之类的,用 结尾是否是/ 来判断
                                // 开始，结束节点都是它
                                if (startTag.replace(/\s/g, '').endsWith('/')) {
                                    that.tokenList.push(
                                        new Token(TOKENTYPE.endTag, startTag.replace(/\n/, ''), index)
                                    )
                                }

                            } else if (endTag) {
                                that.tokenList.push(
                                    new Token(TOKENTYPE.endTag, endTag, index)
                                )
                            } else if (text) {
                                if (text.replace(/\s/g, '').length > 0) {
                                    that.tokenList.push(
                                        // 去除开头和结尾的空格符
                                        new Token(TOKENTYPE.text, text.replace(/(^\s*)|(\s*$)/g, ''), index)
                                    ) 
                                }
                                
                            }
                        })
    }

    _buildTree() {
        let that   = this,
            tokens = that.tokenList,
            starts = [],
            allNodeMap  = [], 
            childrenMap = {},
            i, len, cur,
            tree = that.tree;

        for (i = 0, len = tokens.length; i < len; i++) {
            cur = tokens[i]
            // 如果不是终止token
            // 生成对应的节点，推入到树中
            if (cur.type != TOKENTYPE.endTag) {
                let genNode = that._genNodeFromToken(cur),
                    nearestStart =  starts.slice(starts.length-1);

                // 设置父节点信息
                genNode.setParentId(nearestStart);
                // 为父节点保留子节点信息
                if ( allNodeMap[nearestStart] 
                     && allNodeMap[nearestStart].constructor ===  Node) {
                    allNodeMap[nearestStart].addChild(genNode);
                }
                
                // 如果是文本单节点，不推入starts
                if (cur.type != TOKENTYPE.text) {
                    starts.push(genNode.getNodeId());
                }
                tree.addNode(genNode);
                allNodeMap[genNode.getNodeId()] = genNode
            } else {
                starts.pop();
            }
        }
    }

    _genNodeFromToken(token) {
        const LOGICTAGS = ['for', 'if'];
        let {content, type} = token;
            
        if (type == TOKENTYPE.startTag) {
            let retrieveTag = content.match(/^\s*(\w)+\s*/g)[0].replace(/\s/g, '')
            // 逻辑型节点
            for(let i = 0, len = LOGICTAGS.length; i < len; i++) {
                let tag = LOGICTAGS[i]
                if (tag == retrieveTag) {
                    return new Node({
                        type: NODETYPE.logic,
                        tagName: retrieveTag,
                        token: token
                    })
                }
            }
            // html型节点
            return new Node({
                type: NODETYPE.html,
                tagName: content.split(' ')[0],
                token: token
            })
        } else {
            // 文本类型节点
            return new Node({
                type: NODETYPE.text,
                tagName: 'text',
                token: token
            })
        }
    }
}

//test

export default Parser