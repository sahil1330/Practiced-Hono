import { Schema, model } from "mongoose";

export interface IFavYoutubeVideosSchema {
  title: string;
  description: string;
  thumbnailUrl?: string;
  watched: boolean;
  youtuberName: string;
}

const FavYoutubeVideoSchema = new Schema<IFavYoutubeVideosSchema>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default: "https://via.placeholder.com/150",
    required: false,
  },
  watched: {
    type: Boolean,
    default: false,
    required: true,
  },
  youtuberName: {
    type: String,
    required: true,
  },
});

const FavYoutubeVideoModel = model("fav-youtube-videos", FavYoutubeVideoSchema);

export default FavYoutubeVideoModel;