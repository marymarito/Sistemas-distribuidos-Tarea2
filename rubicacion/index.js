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

var location;
var patent;

const locations = async () => {
    const consumer = kafka.consumer({ groupId: 'Locations' , fromBeginning: true});
    await consumer.connect();
    await consumer.subscribe({ topic: 'Locations' });
    await consumer.run({
        eachMessage: async ({ topic, partition, message}) => {
            if (message.value && partition == 0){
                var data = JSON.parse(message.value.toString());
                location = data.location;
                patent = data.patent;

                client.query('INSERT INTO carrito(location, patent) VALUES($1, $2);',
                [
                    data.location, data.patent
                ], (error, results) => {
                    if(error){
                        throw error
                    }
                })
                console.log(`Ubicacion: ${location}`);
                console.log(`Patente: ${patent}`);
            }
            if(message.value && partition == 1){
                var data = JSON.parse(message.value.toString());
                location = data.location;
                client.query('INSERT INTO profugo(location, patent) VALUES ($1, $2);',
                [
                    data.location, data.patent
                ], (error, results) => {
                    if(error){
                        throw error
                    }
                })
                console.log(`CARRITOS PROFUGOS: `);
                client.query('SELECT * FROM profugo;', (error, results) => {
                    if(error){
                        console.log(results.rows)
                        throw error

                    }
                    console.log(results.rows)
                })
            }
        },
    })
}
//solicitud de un minuto
setTimeout(() => {
    console.log("Atraso de un minuto");
}, 6000)

app.listen(port, () => {
    console.log(`La API esta corriendo en  http://localhost:${port}`);
    locations();
});