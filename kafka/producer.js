const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "connect4-game",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

async function connectProducer() {
  await producer.connect();
  console.log("Kafka producer connected");
}

async function sendEvent(type, payload) {
  await producer.send({
    topic: "connect4-events",
    messages: [
      {
        value: JSON.stringify({
          type,
          payload,
          timestamp: Date.now(),
        }),
      },
    ],
  });
}

module.exports = {
  connectProducer,
  sendEvent,
};
