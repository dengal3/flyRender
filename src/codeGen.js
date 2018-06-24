import {NODETYPE, TOKENTYPE, DONTNEEDENDBABELTAGS} from './common'
import {guid, gLastuid}                from './util'

let outVariReg = new RegExp('(#{[^}]+})', 'g'),
    inVariReg  = new RegExp('#{([^}]+)}', 'g');

class CodeGenerator{
    constructor() {
        this.data2VNodeMap = {}
    }

    getTree(){
        return this.tree;
    }

    getData2VNodeMap() {
        return this.data2VNodeMap;
    }

    // 遍历node时，node会被绑定上新的domId
    // 会生成一张变量和虚拟DOM的关系表
    dsfTree2Code(root) {
        let {declareCode, htmlJointCode} = this._node2Code(root, {isCollect: true});
        declareCode = "var data = data; var $out = '';" + declareCode;
        htmlJointCode = htmlJointCode +  'return $out;';
            
        return declareCode + htmlJointCode;
    }

    node2Code(node) {
        let {declareCode, htmlJointCode} = this._node2Code(node, {isCollect: false});
        declareCode = "var data = data; var $out = '';" + declareCode;
        htmlJointCode = htmlJointCode +  'return $out;';
            
        return declareCode + htmlJointCode;
    }

    text2Code(text) {
        let htmlJointCode = this._text2Code(text),
            declareCode = this.getDeclaration(text);
        declareCode = "var data = data; var $out = '';" + declareCode;
        htmlJointCode = `$out += ${htmlJointCode}; return $out`;
        return declareCode + htmlJointCode;
    }

    getDeclaration(text) {
        let variables = [],
            variExp;    // 一个表达式
        while ( (variExp = inVariReg.exec(text)) != null ) {
            let exp = variExp[1];
            let splitReg = new RegExp('[? =:]+', 'g'), // test ? 'ok' : tips --> ['test', 'ok', tips']
                mayBeVariArr = exp.split(splitReg); 

            mayBeVariArr.forEach((mayBeVari) => {
                let notVariReg = new RegExp("('[^']+')|(\\d+)",'g'),
                    variWord;
                if ( mayBeVari.match(notVariReg) === null) {
                        // 加入声明
                    if (mayBeVari.indexOf('.') == -1) {
                        variables.push(mayBeVari)
                    }      
                }
            })
        }
        let declarations = variables.map((variable) => {return `var ${variable}=data.${variable};`});
        return declarations.join('');
    }

    exp2Code(exp) {
        let declareCode = "var data = data; var $out = '';"
        let htmlJointCode = `$out += ${_Exp2Code(exp)}; return $out`;
        return declareCode + htmlJointCode;
    }

    _node2Code(node, { htmlJointCode = '', isCollect = false, declareCode = ''}) {
        // 到达叶子节点
        if (!node) {
            return '';
        }

        let that = this,
            domID = node.getDOMId() || guid();

        // 将真实DOMid绑定到虚拟DOM上
        node.setDOMId(domID)
        //console.log(node.nodeId, node.tagName,domID)
        if (node.type === NODETYPE.html) {
            htmlJointCode += `$out += '<${node.tagName} data-domID=${domID} ';`;
            for (let p in node.props) {
                let value = node.props[p].replace(/\s/g, ''),
                    variWord;
                
                // 将属性值中含有的变量提取出来
                if (isCollect) {
                    that._collectRelationInText({
                        text: value,
                        nodeId: node.nodeId,
                        propName: p
                    })
                }
                declareCode += that.getDeclaration(value);
                // 从表达式到代码 a="#{variable}"" / b="#{variable ? '123' : '345'}"
                htmlJointCode += `$out += ${that._text2Code(''+p+'='+value+' ')};`
            }
            htmlJointCode += `$out += '>';`;
        } else if (node.type === NODETYPE.text) {
            htmlJointCode += `$out += '<span data-domID=${domID}>';`;
            let content = node.props.innerHTML,
                variWord;

            // 将innerHTML中含有的变量提取出来
            if (isCollect) {
                that._collectRelationInText({
                    text: content,
                    nodeId: node.nodeId,
                    propName: 'innerHTML'
                })
            }
            declareCode += that.getDeclaration(content)
            // #{first} is #{second}
            htmlJointCode += `$out += ${that._text2Code(content)};`;
        } else if (node.type === NODETYPE.logic){
            htmlJointCode += `$out += '<div data-domID=${domID}>';`

            if (node.tagName === 'if') {
                // condition
                // <if cond="#{books.length > 0}">
                let cond = node.props['cond'],
                    variWord;
                
                if (isCollect) {
                    that._collectRelationInText({
                        text: cond,
                        nodeId: node.nodeId,
                        propName: 'cond'
                    })
                }
                declareCode += that.getDeclaration(cond)
                htmlJointCode += `${that._Exp2Code('if('+cond+'){')}`
            } else if (node.tagName === 'for') {
                // <for items="#{books}" item="#{book}">
                let itemsText    = node.props['items'],
                    eachName = node.props['item'],
                    variWord;
                
                if (isCollect) {
                    that._collectRelationInText({
                        text: itemsText,
                        nodeId: node.nodeId,
                        propName: 'items'
                    })
                }
                declareCode += that.getDeclaration(itemsText)
                htmlJointCode += `for(var i = 0; i < ${that._Exp2Code(itemsText)}.length; i++){\
                                    var ${that._Exp2Code(eachName)} = ${that._Exp2Code(itemsText)}[i];`
                                 .trim().replace(/\s+/g, ' ');
            }

        }

        node.getChildNodes().forEach( (nextNode, i) => {
            let nextCode = that._node2Code(nextNode, {
                isCollect
            });
            htmlJointCode += nextCode.htmlJointCode;
            declareCode += nextCode.declareCode;
        })

        if ( node.type === NODETYPE.html && !DONTNEEDENDBABELTAGS[node.tagName] ) {
            htmlJointCode += `$out += '</${node.tagName}>';`;
        } else if ( node.type === NODETYPE.logic ) {
            htmlJointCode += '}';
            htmlJointCode += `$out += '</div>';`
        } else if ( node.type === NODETYPE.text) {
            htmlJointCode += `$out += '</span>';`;
        }
        
        return  {htmlJointCode,declareCode};
    }

    _text2Code(text) {
        let textFrags = text.split(outVariReg),
            out       = '',
            pieces    = [],
            that      = this;

        textFrags.forEach((frag, i) => {
            //out += that._Exp2Code(frag);
            out = that._Exp2Code(frag);
            pieces.push(out)
        })
        return pieces.join('+')
    }

    _Exp2Code(expression) {
        let variReg  = new RegExp('#{([^}]+)}', 'g'),
            vari,
            that = this;
        if (expression.search(inVariReg) != -1) {
            return `${expression.replace(inVariReg, '$1')}`
        }
        return `'${expression}'`
    }
    // #{first} of #{second} 一个带有多个表达式的语句
    // 提取出其中的data和虚拟dom之间的关系
    _collectRelationInText({text, nodeId, propName}) {
        let that = this,
            variExp;    // 一个表达式
        while ( (variExp = inVariReg.exec(text)) != null ) {
            variExp = variExp[1];
            that._collectRelationInExp({
                exp: variExp,
                nodeId: nodeId,
                propName: propName
            })
        }
    }
    // #{first ? second ? 'ok'} 对一个表达式内的变量和虚拟dom之间的关系
    _collectRelationInExp({exp, nodeId, propName = ''}) {
        let that = this,
            nodeInfo = `${nodeId}-${propName}`,
            splitReg = new RegExp('[? =:]+', 'g'), // test ? 'ok' : tips --> ['test', 'ok', tips']
            mayBeVariArr = exp.split(splitReg); 

        mayBeVariArr.forEach((mayBeVari) => {
            let notVariReg = new RegExp("('[^']+')|(\\d+)",'g'),
                variWord;
            if ( mayBeVari.match(notVariReg) === null) {
                if (mayBeVari.indexOf('.') != -1) {
                    mayBeVari = mayBeVari.split('.')[0]
                }       
                if (!that.data2VNodeMap[mayBeVari]) {
                    that.data2VNodeMap[mayBeVari] = []
                    // 加入声明
                    // if (mayBeVari.indexOf('.') == -1) {
                    //     that.declareCode += `var ${mayBeVari} = data.${mayBeVari};`
                    // }
                }
                that.data2VNodeMap[mayBeVari].push(nodeInfo);
            }
        })
    }
}



export default CodeGenerator;