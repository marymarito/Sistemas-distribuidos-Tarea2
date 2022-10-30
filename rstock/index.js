const express = require("express");
const { Kafka } = require('kafkajs')
const client = require("./connect")

const port = process.env.PORT;
const app = express();

app.use(express.json());

const kafka = new Kafka({
    brokers: [process.env.kafkaHost]
});

var arreglo = [];

const stock = async () => {
    const consumer = kafka.consumer({ groupId: 'Stock' , fromBeginning: true});
    await consumer.connect();
    await consumer.subscribe({ topic: 'newSale'});
    await consumer.tun({
        eachMessage: async ({ topic, partition, message }) => {
            if (message.value){
                var data = JSON.parse(message.value.toString());
                arreglo.push(data)
                if (arreglo.length == 5){
                    for (i=0; i<5; i++){
                        if ( arreglo[i].remainingStock < 10){
                            console.log('Hey! Queda menos de 10 de stock!');
                            console.log('Ubicación carrito ', arreglo[i].location);
                        }
                    }
                    //aca se guardan los datos  del carrito en la base de datos
                }
            }
        },
    })
}

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    stock();
});