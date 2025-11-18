import Message from "../models/messages.model.js";

export const postMessage = async (req, res) => {
      const {messages, thread_id, chatId} = req.body;
      

     

      try {
            
            if(!messages, !chatId){
                  return res.status(400).json({message: "Role and content are required"});
            }

            let message = await new Message({
                 
                  messages,
                  thread_id,
                  chatId
            })
           
           const msg = await message.save();

           

           
            return res.status(201).json(message);

      } catch (error) {
            return res.status(500).json({message: error.message});
      }


}

export const getMessage = async (req, res) => {
      const messageId = req.params.id
      try {
            if (!messageId) {
                  return res.status(400).json({message: "no message-Id "})
            }


            const message = await Message.find({chatId:messageId})
            if (!message) {
                  return res.status(400).json({message: "no message found"})
            }

            return res.status(200).json(message)

      } catch (error) {
            return res.status(500).json({message: error.message})
      }
}

export const updateMessage = async (req, res) => {
       const {messages, thread_id, chatId} = req.body;


      try {
            
            if(!messages || !thread_id, !chatId){
                  return res.status(400).json({message: "empty data fields"});
            }

            let msg = await Message.find
            ({chatId})

            let message =await Message.findOneAndUpdate(
                   {chatId},{
                 
                        messages,
                  },  { 
                        new: true,  
                        runValidators: true
                  })

                  //if (!message) {
                        //return res.status(404).json({message: "Message not found"}); }

                  return res.status(201).json(message);

      } catch (error) {
            return res.status(500).json({message: error.message});
      }


}