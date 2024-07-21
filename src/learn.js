import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";

let videos = []

const app = new Hono();

app.get("/", (c) => {
    return c.html('<h1>Welcome to Hono Crash Course</h1>')
})  

app.post('/video', async(c)=>{
    const {videoName, channelName, duration} = await c.req.json()
    const newVideo = {
        id: uuidv4(),
        videoName,
        channelName,
        duration
    }  
    videos.push(newVideo)
    return c.json(newVideo)
})

// Read all the data (using Stream)

app.get('/videos', (c)=>{
    
})

export default app;