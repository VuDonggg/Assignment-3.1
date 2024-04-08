import apiRequest from "./apirequest.js";

/* A small data model to represent a Post. */
export class Post {
  /* Data is the post data from the API. */
  constructor(data) {
    /* Technically we don't have a full User object here (no followers list), but this is still useful. */
    this.user = new User(data.user);
    this.time = new Date(data.time);
    this.text = data.text;
  }
}

/* A data model representing a user of the app. */
export default class User {
  /* Returns an array of user IDs. */
  static async listUsers() {
    let data = await apiRequest("GET", "/users");
    console.log(data);
    return data.users;
  }

  /* Returns a User instance, creating the user if necessary. */
  static async loadOrCreate(id) {
    const data = await apiRequest("GET", "/users/" + id);
if (data.success) {
  return new User(data);
} else if (data.status === 404) {
  // Tạo user mới nếu không tìm thấy
  const createdData = await apiRequest("POST", "/users", { id: id });
  return new User(createdData);
} else {
  throw new Error("Lỗi API: " + data.message);
}
  }

  /* data is the user object from the API. */
  constructor(data) {
    // TODO
    this.id = data.id;
    this.name = data.name;
    this.avatarURL = data.avatarURL;
    this.following = data.following;
  }

  /* The string representation of a User is their display name. */
  toString() {
    return this.name;
  }

  /* Returns an Object containing only the instances variables we want to send back to the API when we save() the user. */
  toJSON() {
    // TODO
    return {
      id: this.id,
      name: this.name,
      avatarURL: this.avatarURL,
    };
  }

  /* Save the current state (name and avatar URL) of the user to the server. */
  async save() {
    await apiRequest("PATCH", "/users/" + this.id, this);
  }

  /* Gets the user's current feed. Returns an Array of Post objects. */
  async getFeed() {
    try {
      const data = await apiRequest("GET", "/users/" + this.id + "/posts");
      const res = [];
      for (let post of data.posts) {
        res.push(new Post(post));
      }
      return res;
    } catch (e) {
      console.error("Lỗi API:", e.message);
      throw e; // Ném lại lỗi để xử lý ở lớp cao hơn
    }
  }
  

  /* Create a new post with hte given text. */
  async makePost(text) {
    await apiRequest("POST", "/users/" + this.id + "/posts", { text: text });
  }

  async addFollow(id) {
    await apiRequest("POST", "/users/" + this.id + "/follow?target=" + id);
    this.following.push(id);
  }
  
  async deleteFollow(id) {
    await apiRequest("DELETE", "/users/" + this.id + "/follow?target=" + id);
    this.following = this.following.filter(x => x !== id);
  }
  
}

window.User = User;
