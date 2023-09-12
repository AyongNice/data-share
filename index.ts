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
            const tableModule = [
                {name: 'id', keyPath: 'id', unique: true},
                {name: 'data', keyPath: 'data', unique: false}
            ];
            const tableData = [
                {name: 'id', keyPath: 'id', unique: true},
                {name: 'data', keyPath: 'data', unique: false}
            ];
            const createTableConfig = [
                {
                    tableName: 'tableModule',
                    keyPath: 'id',
                    autoIncrement: true,
                    keyConfig: tableModule
                },
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

    setInitialData(initialData) {
        if (isVue2) {
            this.dataStore = Vue?.observable(initialData);

        } else {
            this.dataStore = reactive(initialData);
        }
    }

    get(key) {
        return this.dataStore[key];
    }

    set(props) {
        for (let key in props) {
            this.dataStore[key] = props[key];
        }
        if (this.params.snapshot) {
            this.takeSnapshot();
        }
    }

    async takeSnapshot() {
        const dataStore = JSON.stringify(this.dataStore);
        const res = await this.indexDB.queryRecord('tableData', 1)
        if (res) {
            this.indexDB.updateRecord('tableData', 1, {id: 1, data: dataStore});
        } else {
            this.indexDB.addRecord('tableData', {id: 1, data: dataStore});
        }
    }

    callFunction(key, ...args) {
        if (typeof this.dataStore[key] === "function") {
            return this.dataStore[key](...args);
        } else {
            throw new Error(`${key} is not a function`);
        }
    }

    register(eventName, callback) {
        if (!this.subscribers[eventName]) {
            this.subscribers[eventName] = [];
        }
        this.subscribers[eventName].push(callback);
    }

    publish(eventName, data) {
        if (this.subscribers[eventName]) {
            this.subscribers[eventName].forEach(callback => {
                callback(data);
            });
        }
    }
}

export default MessageService;