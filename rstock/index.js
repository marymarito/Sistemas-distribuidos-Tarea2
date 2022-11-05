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

var arreglo = []

const stock = async () => {
    const consumer = kafka.consumer({ groupId: 'Stock', fromBeginning: true });
    await consumer.connect();
    await consumer.subscribe({ topic: 'newSale' });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            if (message.value){
                var data = JSON.parse(message.value.toString());
                arreglo.push(data)
                if (arreglo.length == 5){
                    for (i=0; i<5; i++){
                        if (arreglo[i].remainingStock < 20){
                            console.log('Hey! Queda menos de 20 de stock!')
                            console.log('Ubicacion carrito: ', arreglo[i].location);
                        }
                    }
                    // coloca los datos en el arreglo
                    arreglo = [];
                }
                
                
            }
        },
      })
}


app.listen(port, () => {
    console.log(`La API esta corriendo en  http://localhost:${port}`);
    stock();
});