const express = require("express");
const { Kafka } = require('kafkajs')
const client = require("./connect")

const port = process.env.PORT;
const app = express();

app.use(express.json());

const kafka = new Kafka({
    brokers: [process.env.kafkaHost]
});

var c_clients = 0;
var c_sales = 0;
var av = 0;

const sales = async () => {
    const consumer = kafka.consumer({ groupId: 'DailySales' , fromBeginning: true});
    await consumer.connect();
    await consumer.subscribre({ topic: 'newSale' });
    await consumer.run({
        eachMessage: async ({ topic, partition, message}) => {
            if (message.value){
                var data = JSON.parse(message.value.toString());
                c_clients = c_clients + 1;
                c_sales = Number(c_sales) + Number(data.quantity);

                console.log(`La cantidad de clientes es: ${c_clients} . Y la cantidad de ventas es: ${c_sales}`)
            }
        },
    })
}

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    sales();
});