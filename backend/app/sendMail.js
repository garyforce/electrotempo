const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_KEY);

exports.sendMail = async (depotInfo, userInfo) => {

    if(!process.env.SENDGRID_KEY) {
        console.warn("The SendGrid key needs to be set in the environment");
        return false;
    }

    const { address, description, environment, location } = depotInfo;
    const { userAuth0Id, userOrgId } = userInfo;

    const htmlContent = `
        <p>User request a missing depot.</p>
        <table border="1">
            <thead>
                <tr>
                    <th>User Auth ID</th>
                    <th>User Org ID</th>
                    <th>Environment Url</th>
                    <th>Location</th>
                    <th>Address</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${userAuth0Id || ""}</td>
                    <td>${userOrgId || ""}</td>
                    <td>${environment || ""}</td>
                    <td>${location || ""}</td>
                    <td>${address || ""}</td>
                    <td>${description || ""}</td>
                </tr>
            </tbody>
        </table>`;

    const msg = {
        to: ['bharathi.kannan@electrotempo.com', 'info@electrotempo.com', 'saurabh.deshpande@electrotempo.com', 'mike.leikin@electrotempo.com' ],
        from: 'saurabh.deshpande@electrotempo.com',
        subject: 'Report missing depot',
        html: htmlContent,
    };

    try {
        await sgMail.send(msg);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};
