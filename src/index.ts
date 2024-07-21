import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { logger } from "hono/logger";
import dbconnect from "./db/connect";
import FavYoutubeVideoModel from "./db/fav-youtube-model";
import { isValidObjectId } from "mongoose";
import { stream, streamText, streamSSE } from "hono/streaming";

const app = new Hono();
app.use(poweredBy());
app.use(logger());

dbconnect()
  .then(() => {
    // GET List
    app.get("/", async (c) => {
      const documents = await FavYoutubeVideoModel.find();
      return c.json(
        documents.map((d) => d.toObject()),
        200
      );
    });

    // Create document
    app.post("/", async (c) => {
      const formData = await c.req.json();
      if (!formData.thumbnailUrl) delete formData.thumbnailUrl;
      const favYoutubeVideosObj = new FavYoutubeVideoModel(formData);
      try {
        const document = await favYoutubeVideosObj.save();
        return c.json(document.toObject(), 201);
      } catch (error) {
        return c.json((error as any)?.message || "Internal Server Error", 500);
      }
    });

    // View document
    app.get("/:documentId", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) return c.json("Invalid ID", 400);

      const document = await FavYoutubeVideoModel.findById(id);
      if (!document) return c.json("Document not found", 404);

      return c.json(document.toObject(), 200);
    });

    app.get("/d/:documentId/", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) return c.json("Invalid ID", 400);

      const document = await FavYoutubeVideoModel.findById(id);
      if (!document) return c.json("Document not found", 404);

      return streamText(c, async (stream) => {
        stream.onAbort(() => {
          console.log("Aborted");
        });
        for (let i = 0; i < document.description.length; i++) {
          await stream.write(document.description[i]);
          //Wait 1 second
          await stream.sleep(100);
        }
      });
    });

    // Update document
    app.patch("/:documentId", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) return c.json("Invalid ID", 400);

      const document = await FavYoutubeVideoModel.findById(id);
      if (!document) return c.json("Document not found", 404);

      const formData = await c.req.json();
      if (!formData.thumbnailUrl) delete formData.thumbnailUrl;

      try {
        const updatedDocument = await FavYoutubeVideoModel.findByIdAndUpdate(
          id,
          formData,
          {
            new: true,
          }
        );

        return c.json(updatedDocument?.toObject(), 200);
      } catch (error) {
        return c.json((error as any)?.message || "Internal Server Error", 500);
      }
    });

    // Delete document
    app.delete("/:documentId", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) return c.json("Invalid ID", 400);

      try {
        const deletedDocument = await FavYoutubeVideoModel.findByIdAndDelete(
          id
        );
        return c.json(deletedDocument?.toObject(), 200);
      } catch (error) {
        return c.json((error as any)?.message || "Internal Server Error", 500);
      }
    });
  })
  .catch((err) => {
    app.get("/*", (c) => {
      return c.text(`Failed to connect MongoDB: ${err.message}`);
    });
  });

app.onError((err, c) => {
  return c.text(`App error: ${err.message}`);
});

export default app;
