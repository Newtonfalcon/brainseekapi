import Chat from "../models/chats.model.js"

export const createChat = async (req, res) => {
      const {title} = req.body

      try {
     
            if(!title){
                  res.status(400).json({message:"no title provided by the llm"})
            }

            const chat = await Chat.create({
                  title,
                  userId: req.user._id
            })

            res.status(201).json(chat)
                  
      } catch (error) {
            return res.status(500).json({message: error.message})
      }
      
}

export const getChat = async (req, res) => {
      const chatId = req.user._id
      

      try {
            if(!chatId){
                  return res.status(400).json({message:"no chatId"})
            } 
            const chats = await Chat.find({userId:chatId}).sort({createdAt: -1})
            if (!chats) {
                  return res.status(400).json({message:" no chats found in Db!"})
            }

            return res.status(200).json(chats)

            
      } catch (error) {
            return res.status(500).json({message: error.message})
      }
}