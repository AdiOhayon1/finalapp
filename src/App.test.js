import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PostsModule } from "./posts/posts.module";

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGO_URI), PostsModule],
})
export class AppModule {}
