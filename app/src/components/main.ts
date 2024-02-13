'use strict'
/** @module query 
 * Queries a data point in InfluxDB using the Javascript client library with Node.js.
**/

import { InfluxDB, Point } from '@influxdata/influxdb-client'
import { CONFIG_VARIABLES } from '../env/env'

/** Environment variables **/
const url = CONFIG_VARIABLES.INFLUX_URL
const token = CONFIG_VARIABLES.INFLUX_TOKEN
const org = CONFIG_VARIABLES.INFLUX_ORG

/**
 * Instantiate the InfluxDB client
 * with a configuration object.
 *
 * Get a query client configured for your org.
 **/
const queryApi = new InfluxDB({url, token}).getQueryApi(org)

/** To avoid SQL injection, use a string literal for the query. */
const fluxQuery = 'from(bucket:"TEST") |> range(start: 0) |> filter(fn: (r) => r._measurement == "temperature")'

// Definir la función que se ejecutará cada 5 segundos
function miFuncion() {
  console.log('Esta función se ejecutará cada 5 segundos');
}

// Llamar a la función cada 5 segundos utilizando setInterval
setInterval(miFuncion, 5000); // 5000 milisegundos = 5 segundos


/*const myQuery = async () => {
  for await (const {values, tableMeta} of queryApi.iterateRows(fluxQuery)) {
    const o = tableMeta.toObject(values)
    console.log(
      `${o._time} ${o._measurement}`
    )
  }
}
myQuery()*/