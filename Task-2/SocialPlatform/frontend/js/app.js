const API_BASE = "http://localhost:5000/api";
const pageData = document.body.dataset.page;

function getAuthToken() {
    return localStorage.getItem("nexus_token");
}

function getUser() {
    try {
        const storedUser = localStorage.getItem("nexus_user");
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        return null;
    }
}

function showAlert(target, message, type = "error") {
    if (!target) return;
    const alertBox = document.createElement("div");
    alertBox.className = `alert ${type}`;
    alertBox.textContent = message;
    target.innerHTML = "";
    target.appendChild(alertBox);
}

function clearAlert(target) {
    if (!target) return;
    target.innerHTML = "";
}

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function saveSession(token, user) {
    localStorage.setItem("nexus_token", token);
    localStorage.setItem("nexus_user", JSON.stringify(user));
}

function logout() {
    localStorage.removeItem("nexus_token");
    localStorage.removeItem("nexus_user");
    window.location.href = "./login.html";
}

async function requestJson(path, method = "GET", body = null, auth = false) {
    const headers = {
        "Content-Type": "application/json"
    };

    if (auth) {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authorization required.");
        }
        headers.Authorization = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${path}`, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

async function postJson(path, body, auth = false) {
    return requestJson(path, "POST", body, auth);
}

async function getJson(path) {
    return requestJson(path, "GET", null, true);
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.querySelector("#login-email").value.trim();
    const password = document.querySelector("#login-password").value.trim();
    const alertTarget = document.querySelector("#login-alert");
    clearAlert(alertTarget);

    if (!email || !password) {
        showAlert(alertTarget, "Please enter both email and password.", "error");
        return;
    }

    try {
        const data = await postJson("/auth/login", { email, password });
        saveSession(data.token, data.user);
        window.location.href = "./feed.html";
    } catch (error) {
        showAlert(alertTarget, error.message, "error");
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const username = document.querySelector("#register-username").value.trim();
    const fullName = document.querySelector("#register-fullname").value.trim();
    const email = document.querySelector("#register-email").value.trim();
    const password = document.querySelector("#register-password").value.trim();
    const bio = document.querySelector("#register-bio").value.trim();
    const alertTarget = document.querySelector("#register-alert");
    clearAlert(alertTarget);

    if (!username || !fullName || !email || !password) {
        showAlert(alertTarget, "All required fields are required.", "error");
        return;
    }

    try {
        await postJson("/auth/register", { username, full_name: fullName, email, password, bio });
        showAlert(alertTarget, "Registration successful! Check your email for verification.", "success");
        setTimeout(() => {
            window.location.href = "./login.html";
        }, 1400);
    } catch (error) {
        showAlert(alertTarget, error.message, "error");
    }
}

async function renderUserDetails() {
    const user = getUser();
    const token = getAuthToken();
    if (!user || !token) {
        window.location.href = "./login.html";
        return;
    }

    try {
        const fullUser = await getJson("/users/me");
        if (fullUser && fullUser.user) {
            Object.assign(user, fullUser.user);
            saveSession(token, user);
        }
    } catch(e) { console.error(e); }

    const profileName = document.querySelector("#profile-name");
    const navAvatar = document.querySelector("#nav-profile-avatar");
    const sideAvatar = document.querySelector("#side-avatar");
    const composerAvatar = document.querySelector("#composer-avatar");
    const composerFirstName = document.querySelector("#composer-first-name");
    
    // Profile page elements
    const avatarImg = document.querySelector("#profile-avatar-img");
    const defaultAvatar = document.querySelector("#profile-avatar");
    const coverImg = document.querySelector("#profile-cover-img");
    const bioText = document.querySelector("#profile-bio");
    
    const initials = (user.full_name || user.username).charAt(0).toUpperCase();

    if (profileName) profileName.textContent = user.full_name || user.username;
    if (navAvatar) navAvatar.textContent = initials;
    if (sideAvatar) sideAvatar.textContent = initials;
    if (composerAvatar) composerAvatar.textContent = initials;
    if (composerFirstName) composerFirstName.textContent = (user.full_name || user.username).split(" ")[0];

    // For profile page specifically
    if (pageData === "profile") {
        if (user.profile_picture) {
            if (avatarImg) { avatarImg.src = user.profile_picture; avatarImg.classList.remove("hidden"); }
            if (defaultAvatar) defaultAvatar.classList.add("hidden");
        } else {
            if (avatarImg) avatarImg.classList.add("hidden");
            if (defaultAvatar) { defaultAvatar.textContent = initials; defaultAvatar.classList.remove("hidden"); }
        }
        if (coverImg && user.cover_picture) coverImg.src = user.cover_picture;
        if (bioText) bioText.textContent = user.bio || "Add a bio to tell people more about yourself.";
        
        const detailsContainer = document.querySelector("#profile-details-list");
        if (detailsContainer) {
            detailsContainer.innerHTML = "";
            if (user.location) {
                const locDiv = document.createElement("div");
                locDiv.style.display = "flex";
                locDiv.style.alignItems = "center";
                locDiv.style.gap = "8px";
                locDiv.style.marginBottom = "10px";
                locDiv.innerHTML = `<i class="fa-solid fa-map-marker-alt" style="color: #65676b; width: 18px;"></i> <span>Lives in <strong>${escapeHtml(user.location)}</strong></span>`;
                detailsContainer.appendChild(locDiv);
            }
            if (user.website) {
                const webDiv = document.createElement("div");
                webDiv.style.display = "flex";
                webDiv.style.alignItems = "center";
                webDiv.style.gap = "8px";
                webDiv.innerHTML = `<i class="fa-solid fa-link" style="color: #65676b; width: 18px;"></i> <a href="${escapeHtml(user.website)}" target="_blank" rel="noopener noreferrer" style="color: var(--fb-blue); font-weight: 500;">${escapeHtml(user.website)}</a>`;
                detailsContainer.appendChild(webDiv);
            }
        }

        const editDetailsBtn = document.querySelector(".intro-card .btn-block");
        if (editDetailsBtn) {
            editDetailsBtn.addEventListener("click", () => {
                document.getElementById('edit-profile-modal').classList.remove('hidden');
            });
        }
        
        // Populate edit modal
        document.querySelector("#edit-fullname").value = user.full_name || "";
        document.querySelector("#edit-bio").value = user.bio || "";
        document.querySelector("#edit-location").value = user.location || "";
        document.querySelector("#edit-website").value = user.website || "";
        document.querySelector("#edit-profile-pic").value = user.profile_picture || "";
        document.querySelector("#edit-cover-pic").value = user.cover_picture || "";
    }
}

function createPostCard(post) {
    const card = document.createElement("article");
    card.className = "post-card";
    card.dataset.postId = post.id;

    const header = document.createElement("div");
    header.className = "post-heading";

    const identity = document.createElement("div");
    identity.className = "post-identity";

    const avatar = document.createElement("div");
    avatar.className = "avatar small-avatar";
    avatar.textContent = (post.full_name || post.username || "N").charAt(0).toUpperCase();

    const identityText = document.createElement("div");
    identityText.className = "post-identity-text";

    const title = document.createElement("strong");
    title.textContent = `${post.full_name || post.username}`;

    const meta = document.createElement("span");
    meta.className = "post-meta";
    meta.textContent = `${new Date(post.created_at).toLocaleDateString()} • Public`;

    identityText.appendChild(title);
    identityText.appendChild(meta);
    identity.appendChild(avatar);
    identity.appendChild(identityText);
    header.appendChild(identity);

    const more = document.createElement("span");
    more.className = "post-more";
    more.textContent = "•••";
    header.appendChild(more);

    card.appendChild(header);

    if (post.content) {
        const content = document.createElement("p");
        content.className = "post-content";
        content.textContent = post.content;
        card.appendChild(content);
    }

    if (post.image_url) {
        const image = document.createElement("img");
        image.src = post.image_url;
        image.alt = "Post image";
        image.className = "post-media";
        card.appendChild(image);
    }

    if (post.video_url) {
        if (post.video_url.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
            const video = document.createElement("video");
            video.className = "post-media";
            video.controls = true;
            const source = document.createElement("source");
            source.src = post.video_url;
            source.type = `video/${post.video_url.split('.').pop().split('?')[0]}`;
            video.appendChild(source);
            card.appendChild(video);
        } else {
            const link = document.createElement("a");
            link.href = post.video_url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Open video link";
            link.className = "post-link";
            card.appendChild(link);
        }
    }

    if (post.link_url) {
        const link = document.createElement("a");
        link.href = post.link_url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = post.link_url;
        link.className = "post-link pill-link";
        card.appendChild(link);
    }

    const actions = document.createElement("div");
    actions.className = "post-actions";
    const likeIconClass = post.is_liked ? "fa-solid fa-thumbs-up" : "fa-regular fa-thumbs-up";
    const likeActiveAttr = post.is_liked ? "active" : "";
    const likeActiveStyle = post.is_liked ? "color: var(--fb-blue);" : "";
    actions.innerHTML = `
        <button type="button" data-action="like" data-liked="${post.is_liked ? "true" : "false"}" class="${likeActiveAttr}" style="${likeActiveStyle}"><i class="${likeIconClass}" style="margin-right: 4px;"></i> Like <span>${post.total_likes || 0}</span></button>
        <button type="button" data-action="comment"><i class="fa-regular fa-comment" style="margin-right: 4px;"></i> Comment <span>${post.total_comments || 0}</span></button>
        <button type="button" data-action="share"><i class="fa-solid fa-share" style="margin-right: 4px;"></i> Share <span>${post.total_shares || 0}</span></button>
    `;
    card.appendChild(actions);

    const commentBox = document.createElement("div");
    commentBox.className = "comment-box";
    commentBox.innerHTML = `
        <input type="text" class="comment-input" placeholder="Write a comment...">
        <button type="button" class="comment-send">Post</button>
    `;
    card.appendChild(commentBox);

    const commentsList = document.createElement("div");
    commentsList.className = "comments-list";
    card.appendChild(commentsList);

    getJson(`/posts/${post.id}/comments`)
        .then(data => {
            if (data.comments && data.comments.length > 0) {
                data.comments.forEach(comment => {
                    const cDiv = document.createElement("div");
                    cDiv.className = "comment-item";
                    cDiv.style.marginBottom = "8px";
                    cDiv.style.fontSize = "0.9em";
                    cDiv.innerHTML = `<strong>${escapeHtml(comment.full_name || comment.username)}</strong>: ${escapeHtml(comment.comment)}`;
                    commentsList.appendChild(cDiv);
                });
            }
        })
        .catch(err => console.error("Failed to load comments", err));

    return card;
}

function renderNotifications(notifications) {
    const container = document.getElementById("notification-list");
    if (!container) return;

    container.innerHTML = "";

    if (!notifications || notifications.length === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.className = "alert success";
        emptyMessage.textContent = "No notifications yet.";
        container.appendChild(emptyMessage);
        return;
    }

    notifications.forEach((notification) => {
        const item = document.createElement("article");
        item.className = `notification-item ${notification.is_read ? "read" : "unread"}`;
        item.innerHTML = `
            <strong>${escapeHtml(notification.sender_full_name || notification.sender_username || "Someone")}</strong>
            <p>${escapeHtml(notification.message || "")}</p>
            <small>${new Date(notification.created_at).toLocaleString()}</small>
        `;
        container.appendChild(item);
    });
}

function renderPosts(posts, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    if (!posts || posts.length === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.className = "alert success";
        emptyMessage.textContent = "No posts yet. Share your first update!";
        container.appendChild(emptyMessage);
        return;
    }

    posts.forEach((post) => {
        container.appendChild(createPostCard(post));
    });
}

async function handlePost(event) {
    event.preventDefault();
    const content = document.querySelector("#post-content").value.trim();
    const image_url = document.querySelector("#post-image").value.trim();
    const video_url = document.querySelector("#post-video").value.trim();
    const link_url = document.querySelector("#post-link").value.trim();
    const alertTarget = document.querySelector("#feed-alert");
    clearAlert(alertTarget);

    if (!content && !image_url && !video_url && !link_url) {
        showAlert(alertTarget, "Post text, photo URL, video URL, or link is required.", "error");
        return;
    }

    try {
        await postJson("/posts", { content, image_url, video_url, link_url }, true);
        showAlert(alertTarget, "Post published successfully!", "success");
        
        const form = pageData === "profile" ? document.querySelectorAll("#post-form")[1] || document.querySelector("#post-form") : document.querySelector("#post-form");
        if(form) form.reset();
        
        if (pageData === "feed") {
            await loadFeed();
        } else if (pageData === "profile") {
            await loadMyPosts();
        }
    } catch (error) {
        showAlert(alertTarget, error.message, "error");
    }
}

async function handleReaction(action, postCard) {
    const postId = postCard.dataset.postId;

    if (action === "like") {
        const likeBtn = postCard.querySelector('button[data-action="like"]');
        const isLiked = likeBtn && likeBtn.dataset.liked === "true";
        if (isLiked) {
            await requestJson(`/posts/${postId}/like`, "DELETE", null, true);
        } else {
            await postJson(`/posts/${postId}/like`, {}, true);
        }
    } else if (action === "share") {
        await postJson(`/posts/${postId}/share`, {}, true);
    }

    if (pageData === "feed") {
        await loadFeed();
    } else if (pageData === "profile") {
        await loadMyPosts();
    }
}

async function handleCommentSend(postCard) {
    const input = postCard.querySelector(".comment-input");
    const comment = input.value.trim();

    if (!comment) return;

    await postJson(`/posts/${postCard.dataset.postId}/comments`, { comment }, true);
    input.value = "";
    if (pageData === "feed") {
        await loadFeed();
    } else if (pageData === "profile") {
        await loadMyPosts();
    }
}

async function loadFeed() {
    try {
        const data = await getJson("/posts");
        renderPosts(data.posts, "feed-list");
    } catch (error) {
        console.error(error);
    }
}

async function loadMyPosts() {
    try {
        const data = await getJson("/posts/me");
        renderPosts(data.posts, "profile-posts");
    } catch (error) {
        console.error(error);
    }
}

async function loadNotifications() {
    try {
        const data = await getJson("/posts/notifications");
        renderNotifications(data.notifications);
    } catch (error) {
        console.error(error);
    }
}

async function loadSuggestedFriends() {
    try {
        const data = await getJson("/users");
        const container = document.getElementById("suggested-friends-list");
        if (!container) return;
        
        container.innerHTML = "";
        if (data.users && data.users.length > 0) {
            data.users.forEach(user => {
                const div = document.createElement("div");
                div.className = "contact-item";
                div.dataset.userId = user.id;
                const avatarContent = user.profile_picture ? `<img src="${user.profile_picture}" class="avatar tiny-avatar" style="object-fit:cover;">` : `<div class="avatar tiny-avatar">${(user.full_name || user.username).charAt(0).toUpperCase()}</div>`;
                const btnText = user.is_following ? "Followed" : "Follow";
                const btnClass = user.is_following ? "btn secondary follow-btn followed" : "btn secondary follow-btn";
                div.innerHTML = `
                    <div style="display:flex; align-items:center; gap:8px; flex:1;">
                        ${avatarContent}
                        <span style="font-size:0.95em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px;">${user.full_name || user.username}</span>
                    </div>
                    <button class="${btnClass}" style="padding:2px 8px; font-size:12px; margin-left:auto;">${btnText}</button>
                `;
                container.appendChild(div);
            });
        }
    } catch (error) {
        console.error("Error loading suggested friends", error);
    }
}

async function loadShortcuts() {
    try {
        const data = await getJson("/posts/following");
        const container = document.getElementById("shortcuts-list");
        if (!container) return;
        
        container.innerHTML = "";
        if (data.following && data.following.length > 0) {
            data.following.forEach(user => {
                const link = document.createElement("a");
                link.href = "#";
                link.className = "side-nav-item";
                const initials = (user.full_name || user.username).charAt(0).toUpperCase();
                const avatarContent = user.profile_picture ? `<img src="${user.profile_picture}" class="avatar tiny-avatar" style="object-fit:cover; width:28px; height:28px;">` : `<div class="avatar tiny-avatar" style="width:28px; height:28px; font-size: 10px;">${initials}</div>`;
                link.innerHTML = `
                    ${avatarContent}
                    <strong>${user.full_name || user.username}</strong>
                `;
                container.appendChild(link);
            });
        } else {
            container.innerHTML = `<p style="color: var(--fb-muted); font-size: 0.9em; padding: 0 8px;">No shortcuts yet.</p>`;
        }
    } catch(err) {
        console.error("Failed to load shortcuts", err);
    }
}

function toggleNotificationsPopover(event) {
    event.stopPropagation();
    let popover = document.getElementById("notifications-popover");
    
    if (popover) {
        popover.classList.toggle("hidden");
        if (!popover.classList.contains("hidden")) {
            loadNotificationsIntoPopover();
        }
        return;
    }

    popover = document.createElement("div");
    popover.id = "notifications-popover";
    popover.className = "notifications-popover-card";
    popover.innerHTML = `
        <div class="popover-header">
            <h3>Notifications</h3>
            <button type="button" class="mark-all-read-btn">Mark all read</button>
        </div>
        <div class="divider"></div>
        <div id="popover-notification-list" class="popover-list">
            <div class="popover-loading">Loading notifications...</div>
        </div>
    `;
    
    document.body.appendChild(popover);
    
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    popover.style.position = "absolute";
    popover.style.top = `${rect.bottom + window.scrollY + 8}px`;
    popover.style.right = `${window.innerWidth - rect.right - window.scrollX}px`;
    popover.style.zIndex = "1000";

    popover.querySelector(".mark-all-read-btn").addEventListener("click", async () => {
        try {
            const list = popover.querySelector("#popover-notification-list");
            const unreadItems = list.querySelectorAll(".popover-item.unread");
            for (let item of unreadItems) {
                const notifId = item.dataset.notificationId;
                await requestJson(`/posts/notifications/${notifId}/read`, "PATCH", {}, true);
            }
            loadNotificationsIntoPopover();
        } catch(err) {
            console.error("Mark all read failed", err);
        }
    });

    document.addEventListener("click", (e) => {
        if (!popover.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
            popover.classList.add("hidden");
        }
    });

    loadNotificationsIntoPopover();
}

async function loadNotificationsIntoPopover() {
    const list = document.getElementById("popover-notification-list");
    if (!list) return;

    try {
        const data = await getJson("/posts/notifications");
        list.innerHTML = "";
        
        if (!data.notifications || data.notifications.length === 0) {
            list.innerHTML = `<div class="popover-empty">No notifications yet.</div>`;
            return;
        }

        data.notifications.forEach(notif => {
            const item = document.createElement("div");
            item.className = `popover-item ${notif.is_read ? "read" : "unread"}`;
            item.dataset.notificationId = notif.id;
            
            const timeStr = new Date(notif.created_at).toLocaleString();
            const actorName = notif.sender_full_name || notif.sender_username || "Someone";
            const initials = actorName.charAt(0).toUpperCase();
            
            item.innerHTML = `
                <div class="avatar tiny-avatar">${initials}</div>
                <div class="popover-notif-body">
                    <p><strong>${escapeHtml(actorName)}</strong> ${escapeHtml(notif.message)}</p>
                    <span class="popover-time">${timeStr}</span>
                </div>
                ${!notif.is_read ? `<button type="button" class="mark-read-dot-btn" title="Mark as read"><i class="fa-solid fa-circle"></i></button>` : ""}
            `;
            
            const dotBtn = item.querySelector(".mark-read-dot-btn");
            if (dotBtn) {
                dotBtn.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    try {
                        await requestJson(`/posts/notifications/${notif.id}/read`, "PATCH", {}, true);
                        loadNotificationsIntoPopover();
                    } catch(err) {
                        console.error(err);
                    }
                });
            }

            item.addEventListener("click", async () => {
                if (!notif.is_read) {
                    try {
                        await requestJson(`/posts/notifications/${notif.id}/read`, "PATCH", {}, true);
                    } catch(err) {
                        console.error(err);
                    }
                }
                window.location.href = pageData === "feed" ? `#post-${notif.post_id}` : `./feed.html#post-${notif.post_id}`;
                const popover = document.getElementById("notifications-popover");
                if (popover) popover.classList.add("hidden");
            });

            list.appendChild(item);
        });
    } catch(err) {
        list.innerHTML = `<div class="popover-error">Failed to load.</div>`;
        console.error(err);
    }
}

async function setupSearch() {
    const searchInputs = document.querySelectorAll(".search-input");
    searchInputs.forEach(input => {
        const searchContainer = input.closest(".fb-search");
        if (!searchContainer) return;
        
        let dropdown = searchContainer.querySelector(".search-results-dropdown");
        if (!dropdown) {
            dropdown = document.createElement("div");
            dropdown.className = "search-results-dropdown hidden";
            searchContainer.appendChild(dropdown);
        }

        input.addEventListener("input", async (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (!query) {
                dropdown.classList.add("hidden");
                return;
            }

            try {
                const data = await getJson("/users");
                if (!data.users) return;

                const filtered = data.users.filter(user => 
                    (user.full_name || "").toLowerCase().includes(query) ||
                    (user.username || "").toLowerCase().includes(query)
                );

                dropdown.innerHTML = "";
                if (filtered.length === 0) {
                    dropdown.innerHTML = `<div class="search-item muted-text">No results found</div>`;
                } else {
                    filtered.forEach(user => {
                        const div = document.createElement("div");
                        div.className = "search-item";
                        div.style.display = "flex";
                        div.style.alignItems = "center";
                        div.style.gap = "8px";
                        div.style.padding = "8px";
                        div.style.cursor = "pointer";
                        
                        const initials = (user.full_name || user.username).charAt(0).toUpperCase();
                        const avatarContent = user.profile_picture ? `<img src="${user.profile_picture}" class="avatar tiny-avatar" style="object-fit:cover; width:28px; height:28px;">` : `<div class="avatar tiny-avatar" style="width:28px; height:28px; font-size:10px;">${initials}</div>`;
                        
                        div.innerHTML = `
                            ${avatarContent}
                            <span>${escapeHtml(user.full_name || user.username)}</span>
                        `;
                        
                        div.addEventListener("click", () => {
                            window.location.href = `profile.html`;
                        });
                        
                        dropdown.appendChild(div);
                    });
                }
                dropdown.classList.remove("hidden");
            } catch(err) {
                console.error("Search failed", err);
            }
        });

        document.addEventListener("click", (e) => {
            if (!searchContainer.contains(e.target)) {
                dropdown.classList.add("hidden");
            }
        });
    });
}

async function handleProfileEdit(event) {
    event.preventDefault();
    const full_name = document.querySelector("#edit-fullname").value.trim();
    const bio = document.querySelector("#edit-bio").value.trim();
    const location = document.querySelector("#edit-location").value.trim();
    const website = document.querySelector("#edit-website").value.trim();
    const profile_picture = document.querySelector("#edit-profile-pic").value.trim();
    const cover_picture = document.querySelector("#edit-cover-pic").value.trim();
    
    try {
        const data = await requestJson("/users/profile", "PUT", { full_name, bio, location, website, profile_picture, cover_picture }, true);
        saveSession(getAuthToken(), data.user);
        document.getElementById('edit-profile-modal').classList.add('hidden');
        renderUserDetails();
    } catch (error) {
        showAlert(document.querySelector("#edit-alert"), error.message, "error");
    }
}

function initPage() {
    const loginForm = document.querySelector("#login-form");
    const registerForm = document.querySelector("#register-form");
    const postForm = document.querySelector("#post-form");
    const feedList = document.querySelector("#feed-list");
    const profilePosts = document.querySelector("#profile-posts");
    const openNotificationsButton = document.querySelector("#open-notifications-button");
    const logoutButtons = document.querySelectorAll(".logout-button");
    const token = getAuthToken();

    if (token && (pageData === "login" || pageData === "register")) {
        window.location.href = "./feed.html";
        return;
    }

    if (!token && (pageData === "feed" || pageData === "profile")) {
        window.location.href = "./login.html";
        return;
    }

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
    }

    if (postForm) {
        postForm.addEventListener("submit", handlePost);
    }

    function setupPostInteractions(container) {
        if (!container) return;
        container.addEventListener("click", async (event) => {
            const actionButton = event.target.closest("button[data-action]");
            if (actionButton) {
                const postCard = actionButton.closest(".post-card");
                await handleReaction(actionButton.dataset.action, postCard);
                return;
            }

            const commentButton = event.target.closest(".comment-send");
            if (commentButton) {
                const postCard = commentButton.closest(".post-card");
                await handleCommentSend(postCard);
            }
        });
    }

    setupPostInteractions(feedList);
    setupPostInteractions(profilePosts);

    const friendsList = document.querySelector("#suggested-friends-list");
    if (friendsList) {
        friendsList.addEventListener("click", async (e) => {
            if (e.target.classList.contains("follow-btn")) {
                const item = e.target.closest(".contact-item");
                const userId = item.dataset.userId;
                const isFollowing = e.target.classList.contains("followed");
                try {
                    if (isFollowing) {
                        await requestJson(`/posts/follow/${userId}`, "DELETE", null, true);
                        e.target.textContent = "Follow";
                        e.target.classList.remove("followed");
                    } else {
                        await postJson(`/posts/follow/${userId}`, {}, true);
                        e.target.textContent = "Followed";
                        e.target.classList.add("followed");
                    }
                    if (pageData === "feed") {
                        await loadFeed();
                        await loadShortcuts();
                    }
                } catch(err) {
                    console.error("Follow/unfollow failed", err);
                }
            }
        });
    }

    const editProfileForm = document.querySelector("#edit-profile-form");
    if (editProfileForm) {
        editProfileForm.addEventListener("submit", handleProfileEdit);
    }

    if (openNotificationsButton) {
        openNotificationsButton.addEventListener("click", toggleNotificationsPopover);
    }

    const composerActions = document.querySelectorAll(".composer-action");
    composerActions.forEach(action => {
        action.addEventListener("click", (e) => {
            const btn = e.currentTarget;
            const text = btn.textContent.toLowerCase();
            
            // Show form
            const form = document.querySelector("#post-form");
            const openBtn = document.querySelector("#open-composer-modal");
            const bottom = document.querySelector(".composer-bottom");
            
            if (form) form.style.display = 'grid';
            if (openBtn) openBtn.style.display = 'none';
            if (bottom) bottom.style.display = 'none';

            // Focus specific inputs
            if (text.includes("photo") || text.includes("image")) {
                const imgInput = document.querySelector("#post-image");
                if (imgInput) imgInput.focus();
            } else if (text.includes("video")) {
                const vidInput = document.querySelector("#post-video");
                if (vidInput) vidInput.focus();
            } else if (text.includes("feeling") || text.includes("activity") || text.includes("smile") || text.includes("life")) {
                const contentInput = document.querySelector("#post-content");
                if (contentInput) {
                    contentInput.placeholder = "How are you feeling?";
                    contentInput.focus();
                }
            }
        });
    });

    logoutButtons.forEach((button) => {
        button.addEventListener("click", logout);
    });

    if (pageData === "feed" || pageData === "profile") {
        renderUserDetails();
        setupSearch();
    }

    if (pageData === "feed") {
        loadFeed();
        loadSuggestedFriends();
        loadShortcuts();
    }

    if (pageData === "profile") {
        loadMyPosts();
    }
}

document.addEventListener("DOMContentLoaded", initPage);
