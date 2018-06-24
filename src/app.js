import Parser from './parser.js'
import Render from './render.js'

class flyRender {
    constructor({template = '', app = document.body}) {
        let startT = +new Date();
        this.parser = new Parser(template)
        this.render = new Render({
            tree: this.parser.getTree()
        })
        let endT = +new Date();
        //console.log('解析耗时：', endT - startT)
        this.app = app
    }

    firstPaint({data}) {
        let startT = +new Date();
        return this.render.firstPaint({app: this.app, data})
        //let endT = +new Date();
        //console.log('首次渲染耗时:', endT - startT)
    }

    patchPaint({data}) {
        let startT = +new Date();
        this.render.patchPaint({data})
        let endT = +new Date();
        //console.log('二次渲染耗时:', endT - startT)
    }
}
export default flyRender;


window.FlyRender = flyRender;

//     (function (root, factory) {
//         if (typeof define === 'function' && define.amd) {
//             // AMD. Register as an anonymous module.
//             define(['exports'], function (exports) {
//                 factory((root.FlyRender = exports));
//             });
//         } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
//             // CommonJS
//             factory(exports);
//         } else {
//             // Browser globals
//             factory((root.FlyRender = {}));
//         }
//     }(this, function (exports) {
//         //use b in some fashion.

//         // attach properties to the exports object to define
//         // the exported module properties.
//         console.log(exports)
//         exports.FlyRender = flyRender;
//     }));
// }

