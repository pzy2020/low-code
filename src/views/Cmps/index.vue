<script lang="tsx">
import { defineComponent,ref } from 'vue'
import {
  isImgComponent,
  isTextComponent,
  isButtonComponent,
  menus,
} from "./menus.ts";
import classnames from "classnames";
import { useStore } from '@/store/canvas.ts'
export default defineComponent({
    setup(props) {
        const store = useStore()
        let list = ref(null)
        const handleDragStart = (e, cmp) => {
            if (cmp.data.type === isImgComponent) {
                return;
            }
            e.dataTransfer.setData("add-component", JSON.stringify(cmp));
        };

        const handleClick = (e, cmp) => {
            e.preventDefault();
            e.stopPropagation();
            if (
                cmp.data.type === isTextComponent ||
                cmp.data.type === isButtonComponent
            ) {
                store.addCmp(cmp);
                return;
            }
            // 图片组件
            if (list.value) {
                // setList(null);
                list.value = null
            } else {
                let l = null;
                switch (cmp.data.type) {
                    case isImgComponent:
                    l = <Img baseCmp={cmp} />;
                    break;
                    default:
                    l = null;
                }
                // setList(l);
                list.value = l
            }
        };
        return () => (
            <div id="cmps" className="main">
                <div className="cmpTop">low code</div>
                <div className="cmpList">
                    {menus.map((item) => (
                    <div
                        key={item.desc}
                        className="cmp"
                        draggable={item.data.type !== isImgComponent}
                        onDragStart={(e) => handleDragStart(e, item)}
                        onClick={(e) => handleClick(e, item)}
                    >
                        <span className={`${item.data.iconfont} cmpIcon`} > </span>

                        <span className ="cmpText" > {item.desc} </span>
                    </div>
                    ))}
                </div>
                {list.value && (
                    <button
                    className={classnames("iconfont icon-close", 'close')}
                    onClick={() => list.value = null}
                    ></button>
                )}
                {list.value && <ul className="detailList"> {list}</ul>}
            </div>
        )
    },
})
</script>
<style lang="less" scoped>
.main {
  position: absolute;
  top: 0px;
  left: 0;
  width: 100px;
  min-height: 100%;
  background-color: white;
  font-size: 12px;
  .cmp {
    display: flex;
    background-color: white;
    padding: 6px;
    width: 100%;
    height: 65px;
    margin-top: 30px;
    text-align: center;
    cursor: pointer;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    // icon
    .cmpIcon{
      display: inline-block;
      width: 30px;
      height: 30px;
      line-height: 24px;
      color: #181819;
      font-size: 25px;
    }
    .cmpIcon:hover{
      color:#0057ff;
    }
    // 文字
    .cmpText{
      color:#666
    }
    .cmpText:hover{
      color:#0057ff;
    }
  }
  .cmp:hover{
    box-sizing: border-box;
    border-left: solid 3px #0057ff;
  }
  .close {
    z-index: 999999;
    position: absolute;
    top: 4px;
    left: 274px;
    background-color: transparent;
    font-size: 24px;
  }
  .cmpTop{
    width:130px;
    height: 60px;
    line-height: 60px;
    text-align: center;
    color: #fff;
    font-size: 20px;
    font-style: italic;
    background-color: #000;
  }
  .cmpList {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    color: rgba(195,195,195,1);
  }

  .detailList {
    z-index: 99999;
    position: absolute;
    top: 0;
    left: 72px;
    width: 250px;
    height: 100%;
    overflow: scroll;
    padding: 22px 4px;
    border-right: solid 1px #dddddd;
    background-color: white;
  }
}
</style>
