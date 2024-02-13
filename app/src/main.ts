'use strict'
/** @module query 
 * Queries a data point in InfluxDB using the Javascript client library with Node.js.
**/

import { InfluxDB, Point } from '@influxdata/influxdb-client'
import { CONFIG_VARIABLES } from './env/env'

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

const myQuery = async () => {
  for await (const {values, tableMeta} of queryApi.iterateRows(fluxQuery)) {
    const o = tableMeta.toObject(values)
    console.log(
      `${o._time} ${o._measurement} in '${o.location}' (${o.sensor_id}): ${o._field}=${o._value}`
    )
  }
}

/** Execute a query and receive line table metadata and rows. */
myQuery()