'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/** @module query
 * Queries a data point in InfluxDB using the Javascript client library with Node.js.
**/
var influxdb_client_1 = require("@influxdata/influxdb-client");
var env_1 = require("../env/env");
/** Environment variables **/
var url = env_1.CONFIG_VARIABLES.INFLUX_URL;
var token = env_1.CONFIG_VARIABLES.INFLUX_TOKEN;
var org = env_1.CONFIG_VARIABLES.INFLUX_ORG;
/**
 * Instantiate the InfluxDB client
 * with a configuration object.
 *
 * Get a query client configured for your org.
 **/
var queryApi = new influxdb_client_1.InfluxDB({ url: url, token: token }).getQueryApi(org);
/** To avoid SQL injection, use a string literal for the query. */
var fluxQuery = 'from(bucket:"TEST") |> range(start: 0) |> filter(fn: (r) => r._measurement == "temperature")';
// Definir la función que se ejecutará cada 5 segundos
function miFuncion() {
    console.log('Esta función se ejecutará cada 5 segundos');
}
// Llamar a la función cada 5 segundos utilizando setInterval
setInterval(miFuncion, 5000); // 5000 milisegundos = 5 segundos
