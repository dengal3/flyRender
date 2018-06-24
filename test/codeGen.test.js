import { expect }    from 'chai'
import Parser        from '../src/parser.js'
import CodeGenerator from '../src/codeGen.js'



describe('模板纯div的代码生成', () => {
    it('双闭合和自闭合标签混杂', () => {
        let tree = new Parser(`
            <div id="123">
                <if cond="#{first == 123}">
                    wasai
                </if>
                <for items="#{books}" item="#{book}">
                    <div> #{book.name} </div>
                    <if cond="#{first == 234}">
                        show
                    </if>
                </for>
            </div>
            
        `).getTree()
        console.log(tree)
            let gen = new CodeGenerator({tree})
            let data = {
                first: '234',
                second: '321',
                books: [
                    {
                        name: 'googd'
                    }, {
                        name: 'fake'
                    }]
            }
            console.log(gen.render(data))
            console.log(gen.getTree())
            //expect(test()).to.be.equal('')

    });
})