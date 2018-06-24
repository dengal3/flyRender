import { expect }    from 'chai'
import Parser        from '../src/parser.js'
import Render       from '../src/render.js'


describe('渲染测试', () => {
    it('测试一', () => {
        let tree = new Parser(`
            <div id="123">
                #{first}-#{second}
                <for items="#{books}" item="#{book}">
                    <span>第#{(i+1)}本书名是#{book.name}</span>
                </for>
            </div>
            
        `).getTree()
            let olddata = {
                first :'123',
                second: '321',
                books: [
                    {
                        name: 'one'
                    },
                    {
                        name: 'two'
                    }
                ]
            }
            let render = new Render({tree})
            render.firstPaint({
                app: {}, 
                data: olddata
            })
            let newdata = {
                first: '234',
                second: '321',
                books: [
                    {
                        name: 'new one'
                    },
                    {
                        name: 'new two'
                    }
                ]
            }
            render.patchPaint({
                data: newdata
            })

    });
})