const express = require("express");
const { Kafka } = require('kafkajs')
const { Client } = require('pg');

const client = new Client({ 
    host: 'db-tarea',
    user: 'postgres',
    password: 'postgres',
    port: 5432,
});
client.connect(function(err){
    if (err) console.log("Error al conectar a DB");
    console.log("Conectado a DB.")
});

const port = process.env.PORT;
const app = express();

app.use(express.json());

const kafka = new Kafka({
    brokers: [process.env.kafkaHost]
});

var c_clients = 0;
var c_sales = 0;
var av = 0;

const sale = async () => {
    const consumer = kafka.consumer({ groupId: 'DailySales' , fromBeginning: true});
    await consumer.connect();
    await consumer.subscribe({ topic: 'newSale' });
    await consumer.run({
        eachMessage: async ({ topic, partition, message}) => {
            if (message.value){
                var data = JSON.parse(message.value.toString());
                client.query('INSERT INTO ventas(quantity, remainingStock, location, patent) VALUES($1, $2, $3, $4);', 
                [
                    Number(data.quantity), Number(data.remainingStock), data.location, data.patent
                ], (error, results) => {
                    if(error){
                        throw error
                    }
                })
                c_clients = c_clients + 1;
                c_sales = Number(c_sales) + Number(data.quantity);

                console.log(`La cantidad de clientes es: ${c_clients} . Y la cantidad de ventas es: ${c_sales}`)

                client.query('SELECT cliente, quantity FROM ventas;', (error, results) =>{
                    if(error){
                        throw error
                    }
                    console.log(results.rows);
                })
            }
        },
    })
}

app.listen(port, () => {
    console.log(`La API esta corriendo en  http://localhost:${port}`);
    sale();
});