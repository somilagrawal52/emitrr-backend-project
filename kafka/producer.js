const { Kafka } = require("kafkajs");

let producer = null;

async function connectProducer() {
  if (process.env.NODE_ENV === "production") {
    console.log("Kafka disabled in production");
    return;
  }

  const kafka = new Kafka({
    clientId: "connect4-game",
    brokers: ["localhost:9092"],
  });

  producer = kafka.producer();
  await producer.connect();
  console.log("Kafka producer connected");
}

async function sendEvent(type, payload) {
  if (!producer) return;

  await producer.send({
    topic: "connect4-events",
    messages: [
      {
        value: JSON.stringify({ type, payload, timestamp: Date.now() }),
      },
    ],
  });
}

module.exports = { connectProducer, sendEvent };
