import express, { Express, Request, Response } from "express";
import path from "path";
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { CONFIG_VARIABLES } from './env/env';
import cron from 'node-cron';


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
const queryApi = new InfluxDB({ url, token }).getQueryApi(org)


const myQuery = async () => {
    const fluxQuery = `
    from(bucket: "EPN")
  |> range(start: -6h)
  |> filter(fn: (r) => r["_measurement"] == "Flow_Sensor")
  |> filter(fn: (r) => r["_field"] == "datos00" or r["_field"] == "datos22" or r["_field"] == "datos11" or r["_field"] == "datos33")
  |> last()`

    let data = [];
    for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
        const o = tableMeta.toObject(values);
        data.push({ value: o._value, id: o._field });
    }

    return data;
};

let data:any; // Variable para almacenar los datos actualizados

// Programar la tarea cron para actualizar los datos cada 5 segundos
cron.schedule('*/5 * * * * *', async () => {
    try {
        data = await myQuery();
    } catch (error) {
        console.error('Error en la tarea cron:', error);
    }
});


const port = 8000;
const host = "0.0.0.0"; // Establece la dirección IP que deseas escuchar

const app: Express = express();

// Configurar Express para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Configure Express to use EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", async (req: Request, res: Response) => {
    try {
        res.render('index', { data }); // Pasar los datos a la vista EJS
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error interno del servidor');
    }
})

app.use(express.static("public"));

app.listen(port, host, () => {
    console.log("now listen port: " + port);
});