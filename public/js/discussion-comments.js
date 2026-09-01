$(document).ready(function () {

    /*
     * Allow the component to exist on any page.
     *
     * Project:
     *   /projects/:projectId/comments
     *
     * Task:
     *   /tasks/:taskId/comments
     */

    $("[data-discussion]").each(function () {

        initializeDiscussion($(this));

    });


    function initializeDiscussion($discussion) {

        const createUrl =
            $discussion.data("create-url");

        const deleteUrl =
            $discussion.data("delete-url");

        const $input =
            $discussion.find("[data-comment-input]");

        const $submit =
            $discussion.find("[data-submit-comment]");

        const $submitText =
            $discussion.find("[data-submit-text]");

        const $commentsList =
            $discussion.find("[data-comments-list]");

        const $replyBox =
            $discussion.find("[data-reply-box]");

        const $replyUser =
            $discussion.find("[data-reply-user]");

        const $replyContent =
            $discussion.find("[data-reply-content]");

        const $characterCount =
            $discussion.find("[data-character-count]");


        let replyToId = null;


        // =====================================================
        // CHARACTER COUNT
        // =====================================================

        $input.on("input", function () {

            $characterCount.text(
                $(this).val().length
            );

        });


        // =====================================================
        // REPLY
        // =====================================================

        $discussion.on(
            "click",
            "[data-reply-comment]",
            function () {

                replyToId =
                    $(this).data("comment-id");

                const commentUser =
                    $(this).data("comment-user");

                const commentContent =
                    $(this).data("comment-content");


                $replyUser.text(
                    commentUser
                );

                $replyContent.text(
                    `"${commentContent}"`
                );

                $replyBox.removeClass(
                    "d-none"
                );

                $submitText.text(
                    "Post Reply"
                );

                $input.focus();

                // Scroll gently to composer.
                $input[0].scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }
        );


        // =====================================================
        // CANCEL REPLY
        // =====================================================

        $discussion.on(
            "click",
            "[data-cancel-reply]",
            function () {

                cancelReply();

            }
        );


        function cancelReply() {

            replyToId = null;

            $replyBox.addClass(
                "d-none"
            );

            $replyUser.empty();

            $replyContent.empty();

            $submitText.text(
                "Post Comment"
            );

        }


        // =====================================================
        // SUBMIT
        // =====================================================

        $submit.on(
            "click",
            function () {

                submitComment();

            }
        );


        // Ctrl + Enter
        $input.on(
            "keydown",
            function (event) {

                if (
                    event.ctrlKey &&
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    submitComment();
                }

            }
        );


        function submitComment() {

            const content =
                $input.val().trim();


            if (!content) {

                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "warning",
                    title:
                        "Comment cannot be empty.",
                    showConfirmButton: false,
                    timer: 2000
                });

                return;
            }


            setSubmitting(true);


            $.ajax({

                url: createUrl,

                type: "POST",

                contentType:
                    "application/json",

                data: JSON.stringify({

                    content,

                    replyToId:
                        replyToId || null

                }),

                success: function (response) {

                    if (
                        !response ||
                        !response.success ||
                        !response.comment
                    ) {

                        showError(
                            "Comment could not be added."
                        );

                        return;
                    }


                    // Remove empty state.
                    $commentsList
                        .find("[data-empty-state]")
                        .remove();


                    // Render immediately.
                    const $comment =
                        renderComment(
                            response.comment
                        );

                    $commentsList.append(
                        $comment
                    );


                    // Clear composer.
                    $input.val("");

                    $characterCount.text(
                        "0"
                    );

                    cancelReply();


                    // Scroll to new comment.
                    $comment[0].scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                },

                error: function (xhr) {

                    const message =
                        xhr.responseJSON?.message ||
                        "Failed to add comment.";

                    showError(message);

                },

                complete: function () {

                    setSubmitting(false);

                }

            });

        }


        // =====================================================
        // DELETE
        // =====================================================

        $discussion.on(
            "click",
            "[data-delete-comment]",
            function () {

                const commentId =
                    $(this).data("comment-id");

                const $comment =
                    $discussion.find(
                        `[data-comment-id="${commentId}"]`
                    );


                Swal.fire({

                    title:
                        "Delete comment?",

                    text:
                        "This action cannot be undone.",

                    icon:
                        "warning",

                    showCancelButton:
                        true,

                    confirmButtonText:
                        "Delete",

                    cancelButtonText:
                        "Cancel"

                }).then(function (result) {

                    if (
                        !result.isConfirmed
                    ) {
                        return;
                    }


                    deleteComment(
                        commentId,
                        $comment
                    );

                });

            }
        );


        function deleteComment(
            commentId,
            $comment
        ) {

            $.ajax({

                url:
                    buildDeleteUrl(
                        deleteUrl,
                        commentId
                    ),

                type:
                    "DELETE",

                success: function (
                    response
                ) {

                    if (
                        !response ||
                        !response.success
                    ) {

                        showError(
                            "Failed to delete comment."
                        );

                        return;
                    }


                    $comment
                        .slideUp(
                            180,
                            function () {

                                $(this).remove();

                                showEmptyStateIfNeeded();

                            }
                        );

                },

                error: function (xhr) {

                    const message =
                        xhr.responseJSON?.message ||
                        "Failed to delete comment.";

                    showError(message);

                }

            });

        }


        // =====================================================
        // RENDER COMMENT
        // =====================================================

        function renderComment(comment) {

            const isOwnComment =
                String(
                    comment.user_id
                ) === String(
                    getCurrentUserId()
                );


            const avatarHtml =
                comment.profile_image

                    ? `
                        <img
                            src="${escapeHtml(comment.profile_image)}"
                            alt="${escapeHtml(comment.full_name)}"
                        >
                    `

                    : `
                        <div class="discussion-avatar-placeholder">
                            <i class="fas fa-user"></i>
                        </div>
                    `;


            const ownBadge =
                isOwnComment
                    ? `
                        <span class="discussion-you-badge">
                            You
                        </span>
                    `
                    : "";


            const parentHtml =
                comment.reply_to_id &&
                comment.reply_content

                    ? `
                        <div class="discussion-parent">

                            <div class="discussion-parent-author">
                                <i class="fas fa-reply me-1"></i>
                                Replying to
                                <strong>
                                    ${escapeHtml(
                                        comment.reply_user_name || ""
                                    )}
                                </strong>
                            </div>

                            <div class="discussion-parent-content">
                                "${escapeHtml(
                                    comment.reply_content
                                )}"
                            </div>

                        </div>
                    `

                    : "";


            const deleteHtml =
                isOwnComment

                    ? `
                        <button
                            type="button"
                            class="discussion-action-btn discussion-delete-btn"
                            data-delete-comment
                            data-comment-id="${comment.comment_id}"
                        >
                            <i class="fas fa-trash-alt me-1"></i>
                            Delete
                        </button>
                    `

                    : "";


            const createdAt =
                comment.created_at
                    ? new Date(
                        comment.created_at
                    ).toLocaleString()
                    : "";


            const html = `

                <article
                    class="discussion-comment"
                    data-comment-id="${comment.comment_id}"
                    data-comment-user-id="${comment.user_id}"
                >

                    <div class="d-flex gap-3">

                        <div class="discussion-avatar flex-shrink-0">

                            ${avatarHtml}

                        </div>


                        <div class="discussion-comment-body flex-grow-1">

                            <div class="d-flex align-items-center flex-wrap">

                                <strong class="discussion-author">
                                    ${escapeHtml(
                                        comment.full_name || "Unknown User"
                                    )}
                                </strong>

                                ${ownBadge}

                                <span class="discussion-time">
                                    ${escapeHtml(createdAt)}
                                </span>

                            </div>


                            ${parentHtml}


                            <div class="discussion-content">
                                ${escapeHtml(
                                    comment.content || ""
                                )}
                            </div>


                            <div class="discussion-actions">

                                <button
                                    type="button"
                                    class="discussion-action-btn"
                                    data-reply-comment
                                    data-comment-id="${comment.comment_id}"
                                    data-comment-user="${escapeHtml(
                                        comment.full_name || ""
                                    )}"
                                    data-comment-content="${escapeHtml(
                                        comment.content || ""
                                    )}"
                                >

                                    <i class="fas fa-reply me-1"></i>
                                    Reply

                                </button>

                                ${deleteHtml}

                            </div>

                        </div>

                    </div>

                </article>
            `;


            return $(html);

        }


        // =====================================================
        // EMPTY STATE
        // =====================================================

        function showEmptyStateIfNeeded() {

            if (
                $commentsList.find(
                    "[data-comment-id]"
                ).length > 0
            ) {
                return;
            }


            $commentsList.html(`

                <div
                    class="discussion-empty"
                    data-empty-state
                >

                    <div class="discussion-empty-icon">
                        <i class="far fa-comments"></i>
                    </div>

                    <h6>No comments yet</h6>

                    <p class="text-muted mb-0">
                        Start the discussion.
                    </p>

                </div>

            `);

        }


        // =====================================================
        // SUBMITTING STATE
        // =====================================================

        function setSubmitting(
            submitting
        ) {

            $submit.prop(
                "disabled",
                submitting
            );

            if (submitting) {

                $submitText.text(
                    replyToId
                        ? "Posting Reply..."
                        : "Posting..."
                );

                $submit
                    .find("i")
                    .removeClass(
                        "fa-paper-plane"
                    )
                    .addClass(
                        "fa-spinner fa-spin"
                    );

            } else {

                $submitText.text(
                    replyToId
                        ? "Post Reply"
                        : "Post Comment"
                );

                $submit
                    .find("i")
                    .removeClass(
                        "fa-spinner fa-spin"
                    )
                    .addClass(
                        "fa-paper-plane"
                    );

            }

        }


        // =====================================================
        // HELPERS
        // =====================================================

        function buildDeleteUrl(
            template,
            commentId
        ) {

            return template.replace(
                ":commentId",
                commentId
            );

        }


        function getCurrentUserId() {

            return $discussion.data(
                "current-user-id"
            );

        }


        function escapeHtml(value) {

            return String(value ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

        }


        function showError(message) {

            Swal.fire({

                toast: true,

                position: "top-end",

                icon: "error",

                title: message,

                showConfirmButton: false,

                timer: 2500

            });

        }

    }

});