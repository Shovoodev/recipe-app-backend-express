import express from 'express'
import { ENV } from './config/env.js'
import { db } from './config/db.js'
import { favoritesTable } from './db/schema.js'
import { and, eq } from 'drizzle-orm'
import job from './config/cron.js'
job
const app = express()

const PORT=ENV.PORT || 8001

app.use(express.json());

if(ENV.NODE_ENV === "production"){ job.start()}
app.get("/api/health" , (req , res) => {
    res.status(200).json({success : true})
})

app.post("/api/favorites", async (req, res) => {
    try {
        const { userId, recipeId, title, image, cookTime, servings } = req.body;
        if(!userId || !recipeId || !title ){
            return res.status(400).json({error : "Missing required field"})
        }
       const newFavorate =  await db.insert(favoritesTable).values({
        userId,
        recipeId,
        title,
        image,
        cookTime,
        servings,
      })
      .returning();
       res.status(201).json(newFavorate[0])
    } catch (error) {
        console.log("error adding favorates", error);
        res.status(500).json({error : "something went wrong"})
    }
})

app.delete("/api/favorites/:userId/:recipeId", async (req , res) => {
    try {
        const { userId , recipeId } =  req.params

        await db.delete(favoritesTable).where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.recipeId, parseInt(recipeId))))
        res.status(200).json({message : "Favorite removed sucessfully"})
    } catch (error) {
        console.log("error removing a favorates", error);
        res.status(500).json({error : "something went wrong"})
    }
})

app.get("/api/favorites/:userId" , async(req , res) => {
    try {
        const { userId } = req.params
       const userFavorites =  await db.select().from(favoritesTable).where(eq(favoritesTable.userId, userId))
        res.status(200).json(userFavorites)
    } catch (error) {
        console.log("error removing a favorates", error);
        res.status(500).json({error : "something went wrong"})
    }
})
app.listen(PORT , () => {
    console.log("Server is running on " + PORT)
})