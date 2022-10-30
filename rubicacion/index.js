const express = require("express");
const { Kafka } = require('kafkajs')
const client = require("./connect")


const port = process.env.PORT;
const app = express();

app.use(express.json());

const kafka = new Kafka({
    brokers: [process.env.kafkaHost]
});

var location;
var patent;

const location = async () => {
    const consumer = kafka.consumer({ groupId: 'Locations' , fromBeginning: true});
    await consumer.connect();
    await consumer.subscribe({ topic: 'newSale' });
    await consumer.run({
        eachMessage: async ({ topic, partition, message}) => {
            if (message.value){
                var data = JSON.parse(message.value.toString());
                location = data.location;
                patent = data.patent;
                console.log(`Ubicacion: ${location}`);
                console.log(`Patente: ${patent}`);
            }
        },
    })
}

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    location();
});