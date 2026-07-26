document.addEventListener('DOMContentLoaded',()=>{
//post.ejs
const commentForm = document.querySelector(`.post-<%- post._id %>`);
commentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const commentText = commentForm.commentText.value;
  const postID = `<%- post._id %>`;
  const depth = 1;
  const parentID = null;

  try {
    const res = await fetch("/create/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commentText,
        postID,
        depth,
        parentID,
      }),
    });

    const data = await res.json();
    if (data.id) {
      window.location.reload(true);
    } else {
      alert("Oops something went wrong");
    }
  } catch (error) {
    alert("Oops something went wrong");
  }
});

const addReplyBox = (parentID, parentDepth) => {
  const parentComment = document.querySelector(`#comment-${parentID}`);
  const replyBox = document.createElement("div");
  replyBox.classList.add("media", "media-comment", "align-items-center");
  let replyButtonFunction =
    "replyFunction(`" + parentID + "`," + "`" + parentDepth + "`)";
  replyBox.innerHTML = `
  <img
              alt="Image placeholder"
              class="avatar rounded-circle shadow mr-4"
              src="<%= user.image %>"
            />
            <div class="media-body">
              <form
                class="comment-reply-${parentID}"
                id="comment-<%= user.username %>-${parentID}-${parentDepth}"

              >
                <div class="form-group mb-0">
                  <div class="input-group input-group-merge border">
                    <textarea
                      class="form-control"
                      data-toggle="autosize"
                      name="commentText"
                      id="commentText"
                      placeholder="Write your comment"
                      rows="1"
                    ></textarea>
                    <div class="input-group-append">
                      <button
                        class="btn btn-primary"
                        form="comment-${parentID}"
                        id="comment-button-${parentID}"
                        onclick = "${replyButtonFunction}"
                        type="submit"
                      >
                        <span class="fas fa-paper-plane"></span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

  `;
  parentComment.appendChild(replyBox);

};

const replyFunction = async (parentID, parentDepth) => {
  const replyForm = document.querySelector(`.comment-reply-${parentID}`);
  const commentText = replyForm.commentText.value;
  const postID = `<%= post._id %>`;
  const depth = Number(parentDepth) + 1;
  try {
    const res = await fetch("/create/comment", {
      method: "POST",
      body: JSON.stringify({
        commentText,
        postID,
        depth,
        parentID,
      }),
      headers: { "Content-Type": "application/json" },
    });
    console.log(res);
    const data = await res.json();
    if (data.id) {
      console.log(data.id);
      window.location.reload(true);
    } else {
      throw new Error("Something went wrong");
    }
  } catch (error) {
    console.log(error);
    alert("Oops something went wrong !");
  }
};

const loadReplies = async (parentID, parentDepth) => {
  try {
    const res = await fetch(
      `/fetch/reply?parentID=${parentID}&parentDepth=${parentDepth}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    const data = await res.json();
    console.log(data);
    const parentBody = document.querySelector(`#comment-${parentID}`);
    for (var comment of data) {
      const commentBox = document.createElement("div");
      commentBox.classList.add("media", "media-comment");
      let replyButtonFunction =
        "addReplyBox(`" + comment._id + "`," + "`" + comment.depth + "`)";
      let loadRepliesButtonFunction =
        "loadReplies(`" + comment._id + "`," + "`" + comment.depth + "`)";
      commentBox.innerHTML = `<img
        alt="Image placeholder"
        class="rounded-circle shadow mr-4"
        src="${comment.authorImage}"
        style="width: 64px; height: 64px"
      />
      <div class="media-body" id="comment-${comment._id}">
        <div class="media-comment-bubble left-top">
          <h6 class="mt-0">${comment.author}</h6>
          <p class="text-sm lh-160"> ${comment.commentText} </p>
          <div class="icon-actions">
            <button
              href="blog-article.html#"
              class="btn btn-small"
              onclick="${loadRepliesButtonFunction}"
            >
              <i class="fas fa-comment"></i>
              <span class="text-muted">View Replies</span>
            </button>
            

            <button
              href="blog-article.html#"
              class="btn btn-small"
              onclick="${replyButtonFunction}"
            >
              <i class="fas fa-reply"></i>
              <span class="text-muted">Reply</span>
            </button>
          </div>
        </div>
      </div>`;
      parentBody.appendChild(commentBox);
    }
    if (!data.length) {
      const noReplyBox = document.createElement("div");
      noReplyBox.classList.add("media-comment-bubble", "left-top");

      noReplyBox.innerHTML = `<p class="text-sm lh-160"> No Reply Yet </p>`;
      parentBody.appendChild(noReplyBox);
      setTimeout(() => {
        parentBody.removeChild(parentBody.lastChild);
      }, 1500);
    }
  } catch (error) {
    console.log(error);
    alert("Oops something went wrong!");
  }
};

const like = async (postID) => {
  const response = await fetch("/post/like", {
    method: "PATCH",
    body: JSON.stringify({
      id: postID,
    }),
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (response.status == 200) {
    const likeBtn = document.querySelector("#likeBtn");
    const likeCnt = document.querySelector("#like-count");
    likeCnt.innerHTML = Number(likeCnt.textContent.trim()) + 1;
    likeBtn.innerHTML = `<i class="fas fa-thumbs-up fa-2x"></i>`;
  } else {
    alert("You already liked the post!");
  }
};

const share = () => {

navigator.clipboard.writeText(window.location.href);
const shareBtn = document.querySelector("#shareBtn");
console.log(shareBtn);
shareBtn.setAttribute("data-original-title", "Copied to Clipboard");
setTimeout(() => {
  shareBtn.setAttribute("data-original-title", "Share Link");
}, 5000);
};
const deletefunc = async (postID) => {

  const response = await fetch("/post/delete", {
    method: "DELETE",
    body: JSON.stringify({
      id: postID,
    }),
    headers: { "Content-Type": "application/json" },
  });
  console.log("In ejs delete");
  const data = await response.json();
  if (response.status == 200) {
    console.log("Post got deleted");
    window.location.href = "/dashboard";
  } else {
    alert("Oops, Something went wrong!");
  }
};


const myVideo = document.getElementById("my-video");
let viewed = JSON.parse("<%= JSON.stringify(viewed) %>");
let postID = myVideo.getAttribute("data-id");
myVideo.addEventListener("timeupdate", async function () {
const playedPercentage = (myVideo.currentTime / myVideo.duration) * 100;
if (playedPercentage >= 20) {
if (!viewed) {
  viewed = true;

  const response = await fetch("/post/view", {
    method: "PATCH",
    body: JSON.stringify({
      id: postID,
    }),
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (response.status == 200) {
    viewed = true;
  } else {
    viewed = false;
  }
}
}
});
});