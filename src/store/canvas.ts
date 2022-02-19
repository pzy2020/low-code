import { defineStore } from 'pinia'
import {getOnlyKey} from "../utils";
const defaultCanvas = {
    style: {
        width: 320,
        height: 568,
        backgroundColor: "#fff",
        backgroundImage: "",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        boxSizing: "content-box",
    },
    cmps: [],
};
export const useStore = defineStore('canvas', {
    state: () => {
        return {
            canvas: {
                ...defaultCanvas,
            },
            canvasChangeHistory: [],
            canvasIndex: -1,
            selectedCmp: {},
        }
    },

    getters: {
        canvasData: (state) => {
            return { ...state.canvas }
        },
        canvasStyle: (state) => {
            return { ...state.canvas.style };
        },
        getCmps: (state) => {
            return [...state.canvas.cmps];
        },
        /** 选中组件的操作 **/
        // 获取选中的组件
        getSelectedCmp: (state) => {
            return state.selectedCmp;
        },
    },
    actions: {
        goPrevCanvasHistory() {
            const index = this.canvasIndex - 1 < 0 ? 0 : this.canvasIndex - 1;

            if (index !== this.canvasIndex && this.canvasChangeHistory[index]) {
                this.canvasIndex = index;
                const lastCanvasHistorry = this.canvasChangeHistory[index];

                this.canvas = lastCanvasHistorry;

                this.runListeners();
            }
        },
        goNextCanvasHistory() {
            const index =
                this.canvasIndex + 1 > this.canvasChangeHistory.length - 1
                    ? this.canvasChangeHistory.length - 1
                    : this.canvasIndex + 1;

            if (index !== this.canvasIndex && this.canvasChangeHistory[index]) {
                this.canvasIndex = index;
                const lastCanvasHistorry = this.canvasChangeHistory[index];

                this.canvas = lastCanvasHistorry;

                this.runListeners();
            }
        },
        recordCanvasChangeHistory() {
            this.canvasChangeHistory.push(this.canvas);
            this.canvasIndex = this.canvasChangeHistory.length - 1; //2;
        },
        // 更新整个画布
        // 记得把选中的组件设置为null，因为画布都更新了，意味着原先选中的组件也已经没有了
        updateCanvas(canvas) {
            this.selectedCmp = null;
            this.canvas = { ...canvas };
            this.runListeners();
            this.recordCanvasChangeHistory();
        },

        emptyCanvas() {
            this.canvas = { ...this.defaultCanvas };
            this.runListeners();
            this.recordCanvasChangeHistory();
        },
        updateCanvasStyle(data) {
            console.log("hahah", this.canvasChangeHistory); //sy-log

            const newCanvas = {
                ...this.canvas,
                style: {
                    ...this.getCanvasStyle(),
                    ...data,
                },
            };

            if (JSON.stringify(newCanvas) === JSON.stringify(this.canvas)) {
                return;
            }

            this.canvas = newCanvas;
            // 更新Content层级
            this.runListeners();
            this.recordCanvasChangeHistory();
        },
        registerStoreChangeCmps(_cmp) {
            this.storeChangeCmps.push(_cmp);
            return () => {
                this.storeChangeCmps = this.storeChangeCmps.filter(
                    (cmp) => _cmp.onlyKey !== cmp.onlyKey
                );
            };
        },

        registerCmpsEntity(key, entity) {
            this.cmpsEntity.set(key, entity);
            return () => this.cmpsEntity.delete(key);
        },

        forceCmpsUpdate(..._cmps) {
            // 更新画布组件
            _cmps.forEach((_cmp) => {
                this.cmpsEntity.get(_cmp.onlyKey).onStoreChange();
            });

            // 更新和画布组件相关的组件，如编辑区域
            this.storeChangeCmps.forEach(({ onStoreChange }) => onStoreChange());
        },
        getCmp(index) {
            const cmps = this.getCmps;
            return { ...cmps[index] };
        },
        setCmps(_cmps) {
            this.canvas = {
                ...this.canvas,
                cmps: _cmps,
            };
        },

        // 设置cmps数据，并更新App
        updateCmps(_cmps) {
            this.setCmps(_cmps);
            this.runListeners();
            this.recordCanvasChangeHistory();
        },
        addCmp(_cmp) {
            this.selectedCmp = {
                ..._cmp,
                onlyKey: getOnlyKey(),
            };
            const cmps = this.getCmps;
            this.updateCmps([...cmps, this.selectedCmp]);
            //this.recordCanvasChangeHistory();
        },
        updateCmp(_cmp) {
            const cmps = this.getCmps;

            for (let i = 0; i < cmps.length; i++) {
                if (cmps[i].onlyKey === _cmp.onlyKey) {
                    cmps[i] = _cmp;
                    break;
                }
            }
            this.setCmps(cmps);
            this.forceCmpsUpdate(_cmp);
        },
        setSelectedCmp(_cmp) {
            if (this.selectedCmp === _cmp) {
                return;
            }

            let needForceUpdateCmps = [];

            if (this.selectedCmp) {
                needForceUpdateCmps.push(this.selectedCmp);
            }

            this.selectedCmp = _cmp;

            // 如果selectedCmp为null，证明为取消选中，则这个时候只更新取消选中的组件就行了
            // 否则，下个要选中的组件也要更新

            if (this.selectedCmp) {
                needForceUpdateCmps.push(this.selectedCmp);
            }

            // 更新上个选中的和下个选中的组件
            this.forceCmpsUpdate(...needForceUpdateCmps);
        },
        // 在编辑区域更新组价style、拖拽组件更新组件style
        updateSelectedCmpStyle(_style, frequently) {
            let _cmp = this.getSelectedCmp();
            let cmp = {
                ..._cmp,
                data: { ..._cmp.data, style: { ..._cmp.data.style, ..._style } },
            };
            if (JSON.stringify(cmp) !== JSON.stringify(this.selectedCmp)) {
                this.selectedCmp = cmp;
                this.updateCmp(cmp);

                if (!frequently) {
                    this.recordCanvasChangeHistory();
                }
            }
        },
        // 在编辑区域更新组件value
        updateSelectedCmpValue(value) {
            let _cmp = this.getSelectedCmp();
            let cmp = {
                ..._cmp,
                data: {
                    ..._cmp.data,
                    value,
                },
            };

            this.selectedCmp = cmp;
            this.updateCmp(cmp);
            this.recordCanvasChangeHistory();
        },

        // 点击组件，右键删除组件
        deleteSelectedCmp(_cmp) {
            this.setSelectedCmp(null);

            const cmps = this.getCmps;
            this.updateCmps(cmps.filter((cmp) => cmp.onlyKey !== _cmp.onlyKey));
        },
        // 交换i、j位置的元素，置顶置底
        changeCmpIndex(i, j = this.getCmps().length - 1) {
            if (i === j) {
                return;
            }

            let newCmps = this.getCmps();
            let tem = newCmps[i];
            newCmps[i] = newCmps[j];
            newCmps[j] = tem;
            this.updateCmps(newCmps);
        },
        //现在只用到了更新整个App组件
        runListeners() {
            this.listeners.forEach((listener) => listener());
        },

        // 订阅 组件更新
        subscribe(listener) {
            this.listeners.push(listener);
            return () => {
                this.listeners = this.listeners.filter((lis) => lis !== listener);
            };
        }
    }
})