const cuid = require('cuid');
const OpenAI = require('openai');

const db = require('../helpers/db');

module.exports = {
    list,
    get,
    create,
    edit,
    remove
}

const Message = db.model('Message', {
    _id: {type: String, default: cuid},
    user: {
        type: String,
        ref: 'User',
        index: true,
        required: true
    },
    message: String,
    response: String,
    timestamp: { type: Date, default: Date.now }
});

async function list(opts = {}) {
    const {limit = 1, offset = 0} = opts;

    const message = await Message.find({})
    .sort({ _id: 1 })
    .skip(offset)
    .limit(limit);

    return message;
}

async function get(_id) {
    const message = await Message.findById(_id)
    .populate('user')
    .exec();

    return message;
}

async function create(fields) {
    fields = {
        ...fields,
        response: await getResponse(fields.message)
    }
    const message = await new Message(fields).save();
    return message;
}

async function edit(_id, change) {
    const message = await get(_id);
    Object.keys(change).forEach((key) => message[key] = change[key]);
    await message.save();
    return message; 
}

async function remove(_id) {
    await Message.deleteOne({ _id });
}

async function getResponse(message) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "user", content: message }
            ],
            temperature: 0.7,
        });
        
        return response.choices[0].message.content;
    } catch(err) {
        console.log(err);
        return 'Error occurs, please try again later.';
    }
}