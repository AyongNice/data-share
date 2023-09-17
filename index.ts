import RelationalIndexDB from "relational-indexdb";
import {Vue, isVue2, reactive} from 'vue-demi';


class MessageService {
    params = {
        snapshot: false
    };
    dataStore = {}
    indexDB = {}
    subscribers = {};
    static instance = null;


    constructor(params) {
        if (!MessageService.instance) {
            const tableData = [
                {name: 'id', keyPath: 'id', unique: true},
                {name: 'data', keyPath: 'data', unique: false}
            ];
            const createTableConfig = [
                {
                    tableName: 'tableData',
                    keyPath: 'id',
                    autoIncrement: true,
                    keyConfig: tableData
                }
            ];
            this.indexDB = RelationalIndexDB.getInstance('ayong', 1, createTableConfig);
            MessageService.instance = this;
        }

        /**
         * 参数配置
         */
        if (params) {
            this.params = {...this.params, ...params};
            if (this.params.snapshot && this.indexDB) {
                this.indexDB.queryRecord('tableData', 1).then(res => {
                    if (res && res.data) {
                        const cacheData = JSON.parse(res.data)
                        Object.assign(this.dataStore, cacheData)
                        if (isVue2) {
                            this.dataStore = Vue?.observable(this.dataStore);
                        } else {
                            this.dataStore = reactive(this.dataStore);
                        }

                    }
                })
            }
        }
        return MessageService.instance
    }

    /**
     * 原始数据设置
     * @param initialData {Object}
     */
    setInitialData(initialData) {
        if (isVue2) {
            this.dataStore = Vue?.observable(initialData);

        } else {
            this.dataStore = reactive(initialData);
        }
    }

    /**
     * 获取数据
     * @param key {string}
     */
    get(key) {
        return this.dataStore[key];
    }

    /**
     * 设置数据
     * @param props {Object}
     */
    set(props) {
        for (let key in props) {
            this.dataStore[key] = props[key];
        }
        if (this.params.snapshot) {
            this.takeSnapshot();
        }
    }


    /**
     * 删除缓存记录
     */
    deleteSnapshot() {
        return this.indexDB.deleteRecord('tableData', 1)
    }


    /**
     * 缓存数据
     */
    async takeSnapshot() {
        const dataStore = JSON.stringify(this.dataStore);
        const res = await this.indexDB.queryRecord('tableData', 1)
        if (res) {
            this.indexDB.updateRecord('tableData', 1, {id: 1, data: dataStore});
        } else {
            this.indexDB.addRecord('tableData', {id: 1, data: dataStore});
        }
    }


    /**
     * 调用公共方法
     * @param key {string}
     * @param args {args}
     */
    callFunction(key, ...args) {
        if (typeof this.dataStore[key] === "function") {
            return this.dataStore[key](...args);
        } else {
            throw new Error(`${key} is not a function`);
        }
    }

    /**
     * 消息订阅
     * @param eventName {string} 事件名
     * @param callback {Function} 事件
     */
    register(eventName, callback) {
        if (!this.subscribers[eventName]) {
            this.subscribers[eventName] = [];
        }
        this.subscribers[eventName].push(callback);
    }

    /**
     * 消息发布
     * @param eventName eventName {string} 事件名 与消息订阅相匹配
     * @param data {args} 参数
     */
    publish(eventName, data) {
        if (this.subscribers[eventName]) {
            this.subscribers[eventName].forEach(callback => {
                callback(data);
            });
        }
    }
}

export default MessageService;
