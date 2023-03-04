import { Schema, model } from 'mongoose';

// const {Schema, model} = require('mongoose');

interface User {
  email: string;
  password: string;
}

const userSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

export const User = model<User>('User', userSchema);

interface Todo {
  text: string;
  userEmail: string;
  completed: boolean;
}

const todoSchema = new Schema<Todo>({
  text: { type: String, required: true },
  userEmail: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

export const Todo = model<Todo>('Todo', todoSchema);

interface Post {
  text: string;
  userEmail: string;
  comments: Schema.Types.ObjectId[];
}

const postSchema = new Schema<Post>({
  text: { type: String, required: true },
  userEmail: { type: String, required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
});

export const Post = model<Post>('Post', postSchema);

interface Comment {
  text: string;
  userEmail: string;
  postId: Schema.Types.ObjectId;
}

const commentSchema = new Schema<Comment>({
  text: { type: String, required: true },
  userEmail: { type: String, required: true },
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true }
});

export const Comment = model<Comment>('Comment', commentSchema);