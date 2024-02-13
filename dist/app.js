"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const influxdb_client_1 = require("@influxdata/influxdb-client");
const env_1 = require("./env/env");
const node_cron_1 = __importDefault(require("node-cron"));
/** Environment variables **/
const url = env_1.CONFIG_VARIABLES.INFLUX_URL;
const token = env_1.CONFIG_VARIABLES.INFLUX_TOKEN;
const org = env_1.CONFIG_VARIABLES.INFLUX_ORG;
/**
 * Instantiate the InfluxDB client
 * with a configuration object.
 *
 * Get a query client configured for your org.
 **/
const queryApi = new influxdb_client_1.InfluxDB({ url, token }).getQueryApi(org);
const myQuery = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    const fluxQuery = `
    from(bucket: "EPN")
  |> range(start: -6h)
  |> filter(fn: (r) => r["_measurement"] == "Flow_Sensor")
  |> filter(fn: (r) => r["_field"] == "datos00" or r["_field"] == "datos22" or r["_field"] == "datos11" or r["_field"] == "datos33")
  |> last()`;
    let data = [];
    try {
        for (var _d = true, _e = __asyncValues(queryApi.iterateRows(fluxQuery)), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
            _c = _f.value;
            _d = false;
            const { values, tableMeta } = _c;
            const o = tableMeta.toObject(values);
            data.push({ value: o._value, id: o._field });
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return data;
});
let data; // Variable para almacenar los datos actualizados
// Programar la tarea cron para actualizar los datos cada 5 segundos
node_cron_1.default.schedule('*/5 * * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        data = yield myQuery();
    }
    catch (error) {
        console.error('Error en la tarea cron:', error);
    }
}));
const port = 8000;
const host = "0.0.0.0"; // Establece la dirección IP que deseas escuchar
const app = (0, express_1.default)();
// Configurar Express para servir archivos estáticos desde la carpeta 'public'
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Configure Express to use EJS
app.set("views", path_1.default.join(__dirname, "views"));
app.set("view engine", "ejs");
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.render('index', { data }); // Pasar los datos a la vista EJS
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error interno del servidor');
    }
}));
app.use(express_1.default.static("public"));
app.listen(port, host, () => {
    console.log("now listen port: " + port);
});
