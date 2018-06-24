import { expect }    from 'chai'
import flyRender from '../src/app.js'


describe('渲染测试', () => {
    it('无变量测试', () => {
        let template =  `<div id="test-1"><span>不带变量测试</span></div>`;
        let render = new flyRender({
            template,
            app: {}
        });

        let html = render.firstPaint({
            data: {}
        });
        console.log(`渲染输出：${html}`);
    });
    it('变量测试', () => {
        let template =  `<div id="test-1">hi, #{name}</div>`;
        let render = new flyRender({
            template,
            app: {}
        });
        let html = render.firstPaint({
            data: {
                name: 'ailin'
            }
        });
        console.log(`渲染输出：${html}`);
    });
    it('if测试', () => {
        let template =  `
            <if cond="#{isShow}">
                name is ailin
            </if>
        `;
        let render = new flyRender({
            template,
            app: {}
        });
        let html = render.firstPaint({
            data: {
                name: 'ailin',
                isShow: true
            }
        });
        console.log(`渲染输出：${html}`);
    });
    it('for测试', () => {
        let template =  `
            <for items="#{users}" item="#{user}">
                hi, #{user.name}
            </for>
        `;
        let render = new flyRender({
            template,
            app: {}
        });
        let html = render.firstPaint({
            data: {
                users: [
                    {name: 'bob'},
                    {name: 'alice'}
                ]
            }
        });
        console.log(`渲染输出：${html}`);
    });
})

