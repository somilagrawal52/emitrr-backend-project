const { Kafka } = require("kafkajs");

let producer = null;
let kafkaEnabled = true;

async function connectProducer() {
  // Disable Kafka in production or if explicitly disabled
  if (
    process.env.NODE_ENV === "production" ||
    process.env.ENABLE_KAFKA === "false"
  ) {
    console.log("Kafka disabled");
    kafkaEnabled = false;
    return;
  }

  try {
    const kafka = new Kafka({
      clientId: "connect4-game",
      brokers: ["localhost:9092"],
      retry: { retries: 2 },
    });

    producer = kafka.producer();
    await producer.connect();
    console.log("Kafka producer connected");
  } catch (err) {
    console.error("Kafka connection failed, disabling Kafka");
    kafkaEnabled = false;
    producer = null;
  }
}

async function sendEvent(type, payload) {
  if (!kafkaEnabled || !producer) return;

  try {
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
  } catch (err) {
    console.error("Kafka send failed, skipping event");
  }
}

module.exports = {
  connectProducer,
  sendEvent,
};
