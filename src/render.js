import CodeGenerator from './codeGen.js'
import {LOGICCONTROLLKEYS} from './common'
import {isSame} from './util.js'

class Render {
    constructor({tree}) {
        this.tree = tree;
        this.data2VNodeMap = {};
        this.codeGenerator = new CodeGenerator();
    }

    firstPaint({app, data}){
        let that = this,
            codeGenerator = that.codeGenerator,
            tree = that.tree,
            html;
        
        function render(data) {
            let code = codeGenerator.dsfTree2Code(tree.getRoot());
            //console.log(code)
            var _r = new Function('data', code);
            //console.log(_r.toString())
            //console.log(_r.toString())
            return _r(data)
        }
        html = render(data);
        app.innerHTML = html;
        //console.log(app.innerHTML)
        that.data2VNodeMap = codeGenerator.getData2VNodeMap();
        that.app      = app;
        that.data = JSON.parse(JSON.stringify(data))
        return html
        //console.log(app.innerHTML)
    }

    patchPaint({data}) {
        let that = this,
            oldData = that.data,
            needUpdateVNodeInfoMap = {},
            tree = that.tree,
            codeGenerator = that.codeGenerator;
        //console.log(oldData, data)
        patch({
            before: oldData,
            now: data
        });
        that.oldData = data

        function patch({before, now}) {
            //console.log(before)
            diffData({before, now});   // 收集更新了data，以及搜集对应的虚拟DOM
            patchDom(now);             // 按照现在的data更新所有虚拟DOM和对应的DOM
        }

        function diffData({before, now}) {
            let variableName;
            for (variableName in  that.data2VNodeMap) {
                if (!isSame(before[variableName], now[variableName])) {
                    // 3-cond -> 3: cond  (vnodeId: needUpdateKey)
                    
                    let vNodeIdAndkeys = that.data2VNodeMap[variableName]
                                            .map((vNodeIdAndkey) => {
                                                let [nodeId, key] = vNodeIdAndkey.split('-');
                                                return {nodeId, key}
                                            });
                    
                    vNodeIdAndkeys.forEach(({nodeId, key}) => {
                        if (!needUpdateVNodeInfoMap[nodeId]) {
                            needUpdateVNodeInfoMap[nodeId] = []
                        }
                        needUpdateVNodeInfoMap[nodeId].push(key)
                    })                   
                }
            }
        }

        function renderText(text, data) {
            let code = that.codeGenerator.text2Code(text);
            let _r   = new Function('data', code);
            
            return _r(data);
        }
        function renderNode(node, data) {
            let code = that.codeGenerator.node2Code(node);
            let _r = new Function('data', code);

            return _r(data);
        }

        function patchDom(nowdata) {
            for (let needUpdateVNodeId in needUpdateVNodeInfoMap) {
                let needUpdateKeys = needUpdateVNodeInfoMap[needUpdateVNodeId],
                    vNode = tree.getNode(needUpdateVNodeId);


                needUpdateKeys.forEach((key)=> {
                    let newCode = '',
                        content = vNode.getValueOfProp(key);
                    if(!(key in LOGICCONTROLLKEYS)) {
                        vNode.refresh(key, renderText(content, nowdata))
                    } else {
                        vNode.refresh(key, renderNode(vNode, nowdata))
                    }
                })
            }
        }
    }
}

export default Render;