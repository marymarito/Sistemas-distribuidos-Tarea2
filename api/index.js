const express = require("express");
const { Kafka } = require('kafkajs')

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());

const kafka = new Kafka({
  brokers: [process.env.kafkaHost]
});

const producer = kafka.producer();

//registro de un nuevo miembro
app.post("/register", async (req, res) => {
    await producer.connect();
    //reconocimiento de sopaipillero premium
    //en caso de ser un sopaipillero premiun, se debe enviar a una nueva particion
    if(JSON.stringify(req.body.premium) == true){
        await producer.send({
            topic: 'Register',
            messages: [{value: JSON.stringify(req.body), partition: 1}]
        })
        console.log("Se registro un sopaipillero premium");
    }else{
        await producer.send({
            topic: 'Register',
            messages: [{value: JSON.stringify(req.body), partition: 0}]
        })
        console.log("Se registro un sopaipillero que no es premium");
    }
    await producer.disconnect().then(
        res.status(200).json({
            data: req.body
        })
    )
});

//registro de una venta
app.post("/sold", async (req, res) => {
    await producer.connect();
    await producer.send({
        topic: 'newSale',
        messages: [{value: JSON.stringify(req.body) }]
    })
    await producer.disconnect().then(
        res.status(200).json({
            data: req.body
        })
    )
});


