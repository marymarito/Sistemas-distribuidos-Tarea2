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
        app.get('/', function (req, res) {
            res.status(200).send('Status: 200 OK')
        });
    }else{
        await producer.send({
            topic: 'Register',
            messages: [{value: JSON.stringify(req.body), partition: 0}]
        })
        console.log("Se registro un sopaipillero que no es premium");
        app.get('/', function (req, res) {
            res.status(500).send('Status: 500 ERROR')
        });
    }
    await producer.disconnect().then(
        res.status(200).json({
            data: req.body
        })
    )
});

//registro de una venta
app.post("/sale", async (req, res) => {
    await producer.connect();
    await producer.send({
        topic: 'newSale',
        messages: [{value: JSON.stringify(req.body) }]
    })

    //de esta venta aprovechamos que tenemos la ubicación
    await producer.send({
        topic: 'Locations',
        messages: [{value: JSON.stringify(req.body), partition: 0}]
      })

    await producer.disconnect().then(
        res.status(200).json({
            data: req.body
        })
    )
});

//actividad extraña de ubicación de carrito
app.post("/odd", async (req, res) => {
    await producer.connect();
    await producer.send({
      topic: 'Locations',
      messages: [{value: JSON.stringify(req.body), partition: 1}]
    })
    await producer.disconnect().then(
        res.status(200).json({
            data: req.body
        })
    )
  });
  
//registro ubicación
app.post("/location", async (req, res) => {
    await producer.connect();
    await producer.send({
      topic: 'Locations',
      messages: [{value: JSON.stringify(req.body), partition: 0}]
    })
    await producer.disconnect().then(
        res.status(200).json({
            data: req.body
        })
    )
  });


  app.listen(port, () => {
    console.log(`La API esta corriendo en  http://localhost:${port}`);
  });
