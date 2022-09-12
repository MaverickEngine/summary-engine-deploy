(function () {
    'use strict';

    async function main() {
        let submission_count = 0;

        const get_content = () => {
            if (jQuery("#titlewrap").length) { // Classic editor
                if (jQuery(".wp-editor-area").is(":visible")) { // The code editor is visible
                    return jQuery(".wp-editor-area").val();
                } else { // The visual editor is visible
                    let content = tinymce.editors.content.getContent();
                    if (content.length > 0) {
                        return content;
                    }
                }
                return jQuery("#content").val(); // Last try...
            } else {
                return wp.data.select( "core/editor" ).getEditedPostContent();
            }
        };

        const get_submissions_count = async () => {
            return new Promise((resolve, reject) => {
                jQuery("#summaryEngineMetaBlockSummariseButtonContainer").addClass("summaryengine-loading");
                wp.apiRequest({
                    path: "summaryengine/v1/post/count/" + jQuery("#post_ID").val(),
                    type: "GET",
                })
                .fail(async (response) => {
                    reject(response);
                })
                .done(async (response) => {
                    if (response.error) {
                        reject(response);
                    }
                    if (response.count) {
                        resolve(response.count);
                    } else {
                        reject("No count returned");
                    }
                }).always(async () => {
                    jQuery("#summaryEngineMetaBlockSummariseButtonContainer").removeClass("summaryengine-loading");
                });
            });
        };

        const use_submission = () => {
            submission_count++;
            jQuery("#summaryEngineSubmissionsLeft").text(Number(summaryengine_max_number_of_submissions_per_post) - submission_count);
            check_submissions();
        };

        const check_submissions = () => {
            if (Number(summaryengine_max_number_of_submissions_per_post) < 0) {
                jQuery("#summaryEngineSubmissionsLeft").html("&infin;");
                return;
            }        const submissions_left = Number(summaryengine_max_number_of_submissions_per_post) - submission_count;
            if (submission_count >= Number(summaryengine_max_number_of_submissions_per_post)) {
                jQuery("#summaryEngineSubmissionsLeft").text(0);
                jQuery("#summaryEngineMetaBlockSummariseButton").attr("disabled", "disabled");
                jQuery("#summaryEngineMetaBlockSummariseButtonContainer").addClass("summaryengine-disabled");
            }
            if (submissions_left === 1) {
                jQuery("#summaryEngineSubmissionsLeftLabel").text("submission left");
            } else {
                jQuery("#summaryEngineSubmissionsLeftLabel").text("submissions left");
            }
            jQuery("#summaryEngineSubmissionsLeft").text(submissions_left);
        };

        const submit = async () => {
            const content = get_content();
            if (!content.length) {
                alert("Nothing to summarise yet...");
                return;
            }
            try {
                jQuery("#summaryEngineMetaBlockSummariseButtonContainer").addClass("summaryengine-loading");
                wp.apiRequest({
                    path: "summaryengine/v1/summarise",
                    data: {
                        content: content,
                        post_id: jQuery("#post_ID").val(),
                    },
                    type: "POST",
                })
                .done(async (response) => {
                    if (response.error) {
                        alert(response.error.message || response.error);
                        return;
                    }
                    use_submission();
                    jQuery("#summaryEngineSummaryId").val(response.summary_id);
                    jQuery("#summaryEngineSummary").val(response.choices[0].text.trim());
                    jQuery("#summaryEngineRate").removeClass("summaryengine-hidden");
                    jQuery("#summaryEngineRateLabel").removeClass("summaryengine-hidden");
                    jQuery("#summaryEngineFeedback").addClass("summaryengine-hidden");
                    jQuery("#summaryEngineRateIcons").removeClass("summaryengine-hidden");
                })
                .fail(async (response) => {
                    if (response.responseJSON?.message) {
                        alert(response.responseJSON?.message);
                        return;
                    }
                    throw response.error?.message || response.error || response;
                }).always(async () => {
                    jQuery("#summaryEngineMetaBlockSummariseButtonContainer").removeClass("summaryengine-loading");
                });
                return;
            } catch (err) {
                alert(err);
            }
        };

        const saveRate = async (rating) => {
            {
                try {
                    const summary_id = jQuery("#summaryEngineSummaryId").val();
                    if (!summary_id) throw "Could not find summary ID";
                    wp.apiRequest({
                        path: "summaryengine/v1/rate/" + jQuery("#summaryEngineSummaryId").val(),
                        data: {
                            rating,
                        },
                        type: "POST",
                    })
                    .done(async (response) => {
                        if (response.error) {
                            alert(response.error.message || response.error);
                            return;
                        }
                        jQuery("#summaryEngineRateLabel").addClass("summaryengine-hidden");
                        jQuery("#summaryEngineFeedback").removeClass("summaryengine-hidden");
                        jQuery("#summaryEngineRateIcons").addClass("summaryengine-hidden");
                    })
                    .fail(async (response) => {
                        if (response.responseJSON?.message) {
                            alert(response.responseJSON?.message);
                            return;
                        }
                        throw response.error?.message || response.error || response;
                    }).always(async () => {
                        jQuery("#summaryEngineRate").removeClass("summaryengine-loading");
                    });
                    return;
                } catch (err) {
                    alert(err);
                }
            }
        };

        jQuery(async () => {
            submission_count = await get_submissions_count();
            check_submissions();
            jQuery("#summaryEngineMetaBlockSummariseButton").on("click", submit);
            jQuery(".summaryengine-rate-icon").on("click", async (e) => {
                const rating = jQuery(e.target).data("rating");
                await saveRate(rating);
            });
        });
    }

    main();

})();
//# sourceMappingURL=summaryengine.js.map
