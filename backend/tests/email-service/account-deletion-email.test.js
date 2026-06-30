// Testing the account deletion email

import processEmailJob from "../../services/queue/_workers/processors/EmailProcessor.js";

async function testAccountDeletionEmail() {
    const TO_EMAIL = "nimam700@gmail.com";
    const FNAME = "TestFN";

    const info = await processEmailJob({
        to: TO_EMAIL,
        template: "account-deletion",
        vars: { fname: FNAME },
    });

    console.log("Account deletion email sent:", info.messageId);
}

async function testAccountDeletionEmailError() {
    const TO_EMAIL = "invalid-email@@example-com";
    const FNAME = "TestFN";

    await processEmailJob({
        to: TO_EMAIL,
        template: "account-deletion",
        vars: { fname: FNAME },
    });
}

(async () => {
    try {
        await testAccountDeletionEmail();
        console.log("SUCCESS: Account deletion email sent successfully");
    } catch (error) {
        console.error(
            "FAIL: Account deletion email not sent successfully:",
            error,
        );
        process.exit(1);
    }

    try {
        await testAccountDeletionEmailError();
        console.error("FAIL: Expected validation error but email was sent");
        process.exit(1);
    } catch (error) {
        console.log("SUCCESS: Invalid email rejected:", error.message);
    }
})();
