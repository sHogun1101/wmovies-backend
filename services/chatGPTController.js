require("dotenv").config();
const { OpenAI } = require("openai");
const axios = require("axios");
const configs = require("../configs/connection");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

const askToChatGpt = async function (req, res) {
  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: req.body.message }],
      model: "gpt-3.5-turbo",
    });
    if (chatCompletion) {
      const repliedMessage = chatCompletion.choices[0].message.content;
      const arrayWordInsert = [];
      try {
        const dataInsert = JSON.parse(repliedMessage);
        if (dataInsert) {
          const tempWordInsert = {};
          let type = "";
          if (dataInsert.type && dataInsert.type.toUpperCase() === "NOUN") {
            type = " (Danh từ)";
          }
          if (dataInsert.type && dataInsert.type.toUpperCase() === "PRONOUN") {
            type = "(Đại từ)";
          }
          if (
            dataInsert.type &&
            dataInsert.type.toUpperCase() === "ADJECTIVE"
          ) {
            type = " (Tính từ)";
          }
          if (dataInsert.type && dataInsert.type.toUpperCase() === "VERB") {
            type = " (Động từ)";
          }
          if (dataInsert.type && dataInsert.type.toUpperCase() === "ADVERB") {
            type = " (Trạng từ)";
          }
          if (
            dataInsert.type &&
            dataInsert.type.toUpperCase() === "DETERMINER"
          ) {
            type = " (Từ hạn định)";
          }
          if (
            dataInsert.type &&
            dataInsert.type.toUpperCase() === "PREPOSITION"
          ) {
            type = " (Giới từ)";
          }
          if (
            dataInsert.type &&
            dataInsert.type.toUpperCase() === "CONJUNCTION"
          ) {
            type = " (Liên từ)";
          }
          if (
            dataInsert.type &&
            dataInsert.type.toUpperCase() === "INTERJECTION"
          ) {
            type = " (Thán từ)";
          }
          tempWordInsert.type = dataInsert.type + type ?? "";
          tempWordInsert.word = dataInsert.word ?? "";
          tempWordInsert.pronunciation = dataInsert.pronunciation ?? "";
          tempWordInsert.meaning = dataInsert.description ?? "";
          tempWordInsert.example = dataInsert.example ?? "";
          arrayWordInsert.push(tempWordInsert);
        }
        if (arrayWordInsert.length > 0) {
          const body = {
            query: `
                    mutation MyMutation($objects: [dictionaries_insert_input!]!) {
                      insert_dictionaries(
                        objects: $objects
                        ) {
                        affected_rows
                        returning {
                            id
                            word
                            pronunciation
                            type
                            meaning
                            example
                        }
                      }
                    }
                    `,
            variables: { objects: arrayWordInsert },
          };
          const resInsert = await axios.post(
            configs.graphql_endpoint,
            body,
            configs.graphql_options
          );
          // console.log(JSON.stringify(resInsert));
          if (
            resInsert &&
            resInsert.data &&
            resInsert.data.data &&
            resInsert.data.data.insert_dictionaries &&
            resInsert.data.data.insert_dictionaries.returning &&
            resInsert.data.data.insert_dictionaries.returning.length > 0
          ) {
            res.send({
              from: "bot",
              data: resInsert.data.data.insert_dictionaries.returning,
              status: true,
            });
          } else {
            res.send({ from: "bot", data: repliedMessage });
          }
        } else {
          res.send({ from: "bot", data: repliedMessage });
        }
      } catch (error) {
        res.send({ from: "bot", data: repliedMessage });
      }
    } else {
      res.send({ from: "bot", data: "Đã xảy ra lỗi vui lòng thử lại" });
    }
  } catch (error) {
    console.log(error);
  }
};
const askToChatGptCouplet = async function (req, res) {
  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: req.body.message }],
      model: "gpt-3.5-turbo",
    });
    if (chatCompletion) {
      const repliedMessage = chatCompletion.choices[0].message.content;

      try {
        res.send({ from: "bot", data: repliedMessage });
      } catch (error) {
        res.send({ from: "bot", data: repliedMessage });
      }
    } else {
      res.send({ from: "bot", data: "Đã xảy ra lỗi vui lòng thử lại" });
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  askToChatGpt,
  askToChatGptCouplet,
};
