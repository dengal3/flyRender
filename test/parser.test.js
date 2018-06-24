import { expect } from 'chai'
import Parser     from '../src/parser.js'


describe('解析纯html的测试', () => {
    it('全部都是双闭合标签', () => {
        let tree = new Parser(`
            <div>
                123
                <span>345</span>
                <article>456</article>
                789
            </div>
        `).getTree();
        //console.log(tree);
        expect(tree.length).to.be.equal(7)
    });

    it('双闭合和自闭合标签混杂', () => {
        let tree = new Parser(`
            <div>
                123,12344
                <img src="http://baidu.com" />
                <input type="text" value="123"/>
                <button>345</button>
                <for :items="#{ items }" :item="item">
                    #{ item.content }
                </for>
            </div>
        `).getTree();
        console.log(tree);
        expect(tree.length).to.be.equal(8)
    });
})