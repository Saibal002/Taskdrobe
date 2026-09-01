$(document).ready(function () {
  /*
   * =========================================================
   * REUSABLE DISCUSSION COMMENTS
   * =========================================================
   *
   * Used by:
   *   - Project Discussion
   *   - Task Discussion
   *
   * Communication:
   *   GET    -> load comments
   *   POST   -> comment / reply
   *   DELETE -> own comment
   *
   * This module uses jQuery AJAX only.
   *
   * IMPORTANT:
   * Global Chat / Socket.IO is completely independent.
   */

  $("[data-discussion]").each(function () {
    initializeDiscussion($(this));
  });

  function initializeDiscussion($discussion) {
    const listUrl = $discussion.data("list-url");

    const createUrl = $discussion.data("create-url");

    const deleteUrl = $discussion.data("delete-url");

    const currentUserId = String($discussion.data("current-user-id") || "");

    const $commentsList = $discussion.find("[data-comments-list]");

    const $input = $discussion.find("[data-comment-input]");

    const $submit = $discussion.find("[data-submit-comment]");

    const $submitText = $discussion.find("[data-submit-text]");

    const $replyBox = $discussion.find("[data-reply-box]");

    const $replyUser = $discussion.find("[data-reply-user]");

    const $replyContent = $discussion.find("[data-reply-content]");

    const $characterCount = $discussion.find("[data-character-count]");

    let replyToId = null;

    let commentsCache = {};

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    loadComments();

    // =====================================================
    // LOAD COMMENTS
    // =====================================================

    function loadComments() {
      showLoadingState();

      $.ajax({
        url: listUrl,

        type: "GET",

        dataType: "json",

        cache: false,

        success: function (response) {
          if (!response || !response.success) {
            showLoadError("Unable to load comments.");

            return;
          }

          const comments = Array.isArray(response.comments)
            ? response.comments
            : [];

          renderComments(comments);
        },

        error: function (xhr) {
          console.error("Load comments error:", xhr.responseText);

          showLoadError("Unable to load comments.");
        },
      });
    }

    // =====================================================
    // BUILD THREAD TREE
    // =====================================================

    function buildThreadTree(comments) {
      const commentMap = {};

      const roots = [];

      /*
       * First create a node for every comment.
       */
      comments.forEach(function (comment) {
        const id = String(comment.comment_id);

        commentMap[id] = {
          ...comment,

          replies: [],
        };
      });

      /*
       * Then attach every reply to its parent.
       */
      comments.forEach(function (comment) {
        const id = String(comment.comment_id);

        const parentId = comment.reply_to_id
          ? String(comment.reply_to_id)
          : null;

        if (parentId && commentMap[parentId]) {
          commentMap[parentId].replies.push(commentMap[id]);
        } else {
          /*
           * No valid parent means this is
           * a top-level comment.
           */
          roots.push(commentMap[id]);
        }
      });

      return roots;
    }

    // =====================================================
    // RENDER ALL COMMENTS
    // =====================================================
    // =====================================================
    // RENDER ALL COMMENTS
    // =====================================================

    function renderComments(comments) {
      commentsCache = {};

      comments.forEach(function (comment) {
        commentsCache[String(comment.comment_id)] = comment;
      });

      if (!comments.length) {
        showEmptyState();
        return;
      }

      const threads = buildThreadTree(comments);

      // Sort top-level threads to show the latest comments first
      threads.sort(function (a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
      });

      $commentsList.empty();

      threads.forEach(function (thread) {
        $commentsList.append(buildThreadHtml(thread));
      });
    }

    // =====================================================
    // THREAD HTML
    // =====================================================

    function buildThreadHtml(comment) {
      return `

                <div
                    class="discussion-thread"
                    data-thread-root="${comment.comment_id}"
                >

                    ${buildCommentHtml(comment, 0)}

                </div>

            `;
    }

    // =====================================================
    // COMMENT HTML
    // =====================================================

    function buildCommentHtml(comment, depth) {
      const commentId = String(comment.comment_id);

      const userId = String(comment.user_id);

      const isOwnComment = userId === currentUserId;

      const fullName = comment.full_name || "Unknown User";

      const content = comment.content || "";

      const createdAt = formatDate(comment.created_at);

      // -------------------------------------------------
      // AVATAR
      // -------------------------------------------------

      let avatarHtml;

      if (comment.profile_image) {
        avatarHtml = `

                    <img
                        src="${escapeHtml(comment.profile_image)}"
                        alt="${escapeHtml(fullName)}"
                    >

                `;
      } else {
        avatarHtml = `

                    <div class="discussion-avatar-placeholder">

                        <i class="fas fa-user"></i>

                    </div>

                `;
      }

      // -------------------------------------------------
      // YOU BADGE
      // -------------------------------------------------

      const youBadge = isOwnComment
        ? `

                        <span class="discussion-you-badge">
                            You
                        </span>

                    `
        : "";

      // -------------------------------------------------
      // DELETE
      // -------------------------------------------------

      const deleteHtml = isOwnComment
        ? `

                        <button
                            type="button"
                            class="discussion-action-btn discussion-delete-btn"
                            data-delete-comment
                            data-comment-id="${commentId}"
                        >

                            <i class="fas fa-trash-alt"></i>

                            Delete

                        </button>

                    `
        : "";

      /*
       * We visually cap indentation at level 3.
       *
       * The actual thread relationship is still
       * preserved in the DOM.
       */
      const visualDepth = Math.min(depth, 3);

      let html = `
                <article
                    class="discussion-comment ${depth > 0 ? "discussion-reply" : "discussion-root-comment"}"
                    data-comment-id="${commentId}"
                    data-comment-user-id="${userId}"
                    data-depth="${visualDepth}"
                >
                    <div class="discussion-comment-main">
                        <div class="discussion-avatar flex-shrink-0">
                            ${avatarHtml}
                        </div>

                        <div class="discussion-comment-content">
                            <div class="discussion-comment-meta">
                                <strong class="discussion-author">${escapeHtml(fullName)}</strong>
                                ${youBadge}
                                <span class="discussion-time">${escapeHtml(createdAt)}</span>
                            </div>

                            <div class="discussion-text">${escapeHtml(content)}</div>

                            <div class="discussion-actions">
                                <button type="button" class="discussion-action-btn" data-reply-comment data-comment-id="${commentId}">
                                    <i class="fas fa-reply"></i> Reply
                                </button>
                                ${deleteHtml}
                            </div>
                        </div>
                    </div>
            `;

      // -------------------------------------------------
      // REPLIES
      // -------------------------------------------------
      if (comment.replies && comment.replies.length) {
        html += `<div class="discussion-replies">`;
        comment.replies.forEach(function (reply) {
          html += buildCommentHtml(reply, depth + 1);
        });
        html += `</div>`;
      }

      html += `</article>`;
      return html;

      // -------------------------------------------------
      // REPLIES
      // -------------------------------------------------

      if (comment.replies && comment.replies.length) {
        html += `

                    <div class="discussion-replies">

                `;

        comment.replies.forEach(function (reply) {
          html += buildCommentHtml(reply, depth + 1);
        });

        html += `

                    </div>

                `;
      }

      html += `

                </article>

            `;

      return html;
    }

    // =====================================================
    // CHARACTER COUNT
    // =====================================================

    $input.on("input", function () {
      $characterCount.text($(this).val().length);
    });

    // =====================================================
    // REPLY BUTTON
    // =====================================================

    $discussion.on("click", "[data-reply-comment]", function () {
      const commentId = String($(this).data("comment-id"));

      const comment = commentsCache[commentId];

      if (!comment) {
        showError("Unable to prepare reply.");

        return;
      }

      replyToId = commentId;

      $replyUser.text(comment.full_name || "User");

      $replyContent.text(comment.content || "");

      $replyBox.removeClass("d-none");

      $submitText.text("Post Reply");

      $input.attr("placeholder", "Write a reply...").focus();
    });

    // =====================================================
    // CANCEL REPLY
    // =====================================================

    $discussion.on("click", "[data-cancel-reply]", function () {
      cancelReply();
    });

    function cancelReply() {
      replyToId = null;

      $replyBox.addClass("d-none");

      $replyUser.empty();

      $replyContent.empty();

      $submitText.text("Post Comment");

      $input.attr("placeholder", "Write a comment...");
    }

    // =====================================================
    // SUBMIT BUTTON
    // =====================================================

    $submit.on("click", function () {
      submitComment();
    });

    // =====================================================
    // CTRL + ENTER
    // =====================================================

    $input.on("keydown", function (event) {
      if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();

        submitComment();
      }
    });

    // =====================================================
    // CREATE COMMENT / REPLY
    // =====================================================

    function submitComment() {
      const content = $input.val().trim();

      if (!content) {
        showWarning("Comment cannot be empty.");

        $input.focus();

        return;
      }

      setSubmitting(true);

      $.ajax({
        url: createUrl,

        type: "POST",

        contentType: "application/json",

        dataType: "json",

        data: JSON.stringify({
          content: content,

          replyToId: replyToId || null,
        }),

        success: function (response) {
          if (!response || !response.success || !response.comment) {
            showError("Comment could not be added.");

            return;
          }

          const comment = response.comment;

          cacheComment(comment);

          // -------------------------------------------------
          // REPLY
          // -------------------------------------------------

          if (replyToId) {
            const $parent = $discussion.find(
              `[data-comment-id="${replyToId}"]`,
            );

            let $replies = $parent.children(".discussion-replies");

            if (!$replies.length) {
              $replies = $("<div>").addClass("discussion-replies");

              $parent.append($replies);
            }

            const parentDepth = getCommentDepth($parent);

            $replies.append(
              buildCommentHtml(
                {
                  ...comment,
                  replies: [],
                },

                parentDepth + 1,
              ),
            );
          }

          // -------------------------------------------------
          // TOP-LEVEL COMMENT
          // -------------------------------------------------
          else {
            removeDiscussionMessages();

            // Use prepend instead of append to insert at the top
            $commentsList.prepend(
              buildThreadHtml({
                ...comment,
                replies: [],
              }),
            );
          }

          // -------------------------------------------------
          // RESET COMPOSER
          // -------------------------------------------------

          $input.val("");

          $characterCount.text("0");

          cancelReply();

          // -------------------------------------------------
          // SCROLL NEW COMMENT INTO VIEW
          // -------------------------------------------------

          const $newComment = $discussion.find(
            `[data-comment-id="${comment.comment_id}"]`,
          );

          if ($newComment.length) {
            $newComment[0].scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        },

        error: function (xhr) {
          console.error("Create comment error:", xhr.responseText);

          const message =
            xhr.responseJSON && xhr.responseJSON.message
              ? xhr.responseJSON.message
              : "Failed to add comment.";

          showError(message);
        },

        complete: function () {
          setSubmitting(false);
        },
      });
    }

    // =====================================================
    // CACHE COMMENT
    // =====================================================

    function cacheComment(comment) {
      commentsCache[String(comment.comment_id)] = comment;
    }

    // =====================================================
    // GET DEPTH
    // =====================================================

    function getCommentDepth($comment) {
      return parseInt($comment.attr("data-depth"), 10) || 0;
    }

    // =====================================================
    // DELETE COMMENT
    // =====================================================

    $discussion.on("click", "[data-delete-comment]", function () {
      const commentId = String($(this).data("comment-id"));

      const $comment = $discussion.find(`[data-comment-id="${commentId}"]`);

      Swal.fire({
        title: "Delete comment?",

        text: "This action cannot be undone.",

        icon: "warning",

        showCancelButton: true,

        confirmButtonText: "Delete",

        cancelButtonText: "Cancel",
      }).then(function (result) {
        if (!result.isConfirmed) {
          return;
        }

        deleteComment(commentId, $comment);
      });
    });

    function deleteComment(commentId, $comment) {
      const url = deleteUrl.replace(
        ":commentId",
        encodeURIComponent(commentId),
      );

      $.ajax({
        url: url,

        type: "DELETE",

        dataType: "json",

        success: function (response) {
          if (!response || !response.success) {
            showError("Failed to delete comment.");

            return;
          }

          delete commentsCache[commentId];

          /*
           * Remove the complete branch.
           *
           * This means deleting a parent also
           * removes its visible replies.
           */
          $comment.slideUp(180, function () {
            $(this).remove();

            showEmptyStateIfNeeded();
          });
        },

        error: function (xhr) {
          console.error("Delete comment error:", xhr.responseText);

          const message =
            xhr.responseJSON && xhr.responseJSON.message
              ? xhr.responseJSON.message
              : "Failed to delete comment.";

          showError(message);
        },
      });
    }

    // =====================================================
    // UI STATES
    // =====================================================

    function removeDiscussionMessages() {
      $commentsList
        .find("[data-empty-state], [data-discussion-message]")
        .remove();
    }

    function showEmptyStateIfNeeded() {
      const count = $commentsList.find("[data-comment-id]").length;

      if (count === 0) {
        showEmptyState();
      }
    }

    function showEmptyState() {
      $commentsList.html(`

                <div
                    class="discussion-empty"
                    data-empty-state
                >

                    <div class="discussion-empty-icon">

                        <i class="far fa-comments"></i>

                    </div>


                    <h6>
                        No comments yet
                    </h6>


                    <p class="text-muted mb-0">
                        Start the discussion.
                    </p>

                </div>

            `);
    }

    function showLoadingState() {
      $commentsList.html(`

                <div
                    class="discussion-empty"
                    data-discussion-message
                >

                    <div class="discussion-empty-icon">

                        <i class="fas fa-spinner fa-spin"></i>

                    </div>


                    <h6>
                        Loading comments...
                    </h6>

                </div>

            `);
    }

    function showLoadError(message) {
      $commentsList.html(`

                <div
                    class="discussion-empty"
                    data-discussion-message
                >

                    <div class="discussion-empty-icon">

                        <i class="fas fa-exclamation-circle"></i>

                    </div>


                    <h6>
                        ${escapeHtml(message)}
                    </h6>


                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary mt-2"
                        data-retry-comments
                    >
                        Try Again
                    </button>

                </div>

            `);
    }

    $discussion.on("click", "[data-retry-comments]", function () {
      loadComments();
    });

    // =====================================================
    // SUBMIT STATE
    // =====================================================

    function setSubmitting(submitting) {
      $submit.prop("disabled", submitting);

      if (submitting) {
        $submitText.text(replyToId ? "Posting Reply..." : "Posting...");

        $submit
          .find("i")
          .removeClass("fa-paper-plane")
          .addClass("fa-spinner fa-spin");
      } else {
        $submitText.text(replyToId ? "Post Reply" : "Post Comment");

        $submit
          .find("i")
          .removeClass("fa-spinner fa-spin")
          .addClass("fa-paper-plane");
      }
    }

    // =====================================================
    // DATE FORMAT
    // =====================================================

    function formatDate(value) {
      if (!value) {
        return "";
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "";
      }

      return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    }

    // =====================================================
    // HTML ESCAPE
    // =====================================================

    function escapeHtml(value) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
    }

    // =====================================================
    // WARNING
    // =====================================================

    function showWarning(message) {
      Swal.fire({
        toast: true,

        position: "top-end",

        icon: "warning",

        title: message,

        showConfirmButton: false,

        timer: 2200,
      });
    }

    // =====================================================
    // ERROR
    // =====================================================

    function showError(message) {
      Swal.fire({
        toast: true,

        position: "top-end",

        icon: "error",

        title: message,

        showConfirmButton: false,

        timer: 2500,
      });
    }
  }
});
