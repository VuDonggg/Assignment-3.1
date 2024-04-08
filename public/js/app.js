import bodyParser from "body-parser";
import express from "express";
import { MongoClient } from "mongodb";
import FollowList from "./followlist.js";
import User, { Post } from "./user.js";

const api = new express.Router();

export default class App {
  constructor(userColl, postColl) {
    this._userColl = userColl;
    this._postColl = postColl;
    /* Store the currently logged-in user. */
    this._user = null;

    this._onListUsers = this._onListUsers.bind(this);
    this._onLogin = this._onLogin.bind(this);
    this._loginForm = document.querySelector("#loginForm");
    this._loginForm.listUsers.addEventListener("click", this._onListUsers);
    this._loginForm.login.addEventListener("click", this._onLogin);

    //TODO: Initialize any additional private variables/handlers, and set up the FollowList
    this._postForm = document.querySelector("#postForm");
    this._onPost = this._onPost.bind(this);
    this._postForm
      .querySelector("#postButton")
      .addEventListener("click", this._onPost);

    this._onAddFollower = this._onAddFollower.bind(this);
    this._onRemoveFollower = this._onRemoveFollower.bind(this);
    this._followList = new FollowList(
      document.querySelector("#followContainer"),
      this._onAddFollower,
      this._onRemoveFollower
    );

    this._onAvatarSubmit = this._onAvatarSubmit.bind(this);
    this._onNameSubmit = this._onNameSubmit.bind(this);
  }

  //TODO: Add your event handlers/callback functions here
  async _onLogin(event) {
    event.preventDefault(); // ngăn chặn việc reload lại trang sau khi đăng nhập
    const userId = this._loginForm.userid.value;
    const user = await this._userColl.findOne({ id: userId });
    if (!user) {
      throw new Error("User not found");
    }
    this._user = new User(user, this._postColl);
    await this._loadProfile();
    let postArray = await this._user.getFeed();
    for (let i of postArray) {
      this._displayPost(i);
    }
  }

  async _onPost(event) {
    event.preventDefault();
    await this._user.makePost(this._postForm.querySelector("#newPost").value);
    await this._loadProfile();
    let postArray = await this._user.getFeed();
    for (let i of postArray) {
      this._displayPost(i);
    }
  }

  //TODO: Add your event handlers/callback functions here
  async _onRemoveFollower(id) {
    await this._user.deleteFollow(id);
    await this._loadProfile();
    let postArray = await this._user.getFeed();
    for (let i of postArray) {
      this._displayPost(i);
    }
  }

  async _onAddFollower(id) {
    await this._user.addFollow(id);
    await this._loadProfile();
    let postArray = await this._user.getFeed();
    for (let i of postArray) {
      this._displayPost(i);
    }
  }

  async _onNameSubmit(event) {
    event.preventDefault();
    this._user.name = document.querySelector("#nameInput").value;
    await this._user.save();
    await this._loadProfile();
    let postArray = await this._user.getFeed();
    for (let i of postArray) {
      this._displayPost(i);
    }
  }

  async _onAvatarSubmit(event) {
    event.preventDefault();
    this._user.avatarURL = document.querySelector("#avatarInput").value;
    await this._user.save();
    await this._loadProfile();
    let postArray = await this._user.getFeed();
    for (let i of postArray) {
      this._displayPost(i);
    }
  }

  /*** Helper methods ***/
}
