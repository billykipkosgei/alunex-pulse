const { Resend } = require('resend');
const nodemailer = require('nodemailer');

// Initialize Resend if API key is available
let resend = null;
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
}

// Create nodemailer transporter as fallback
const createTransporter = () => {
    const smtpPort = parseInt(process.env.SMTP_PORT) || 587;

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465 (SSL), false for 587 (TLS)
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000,
        tls: {
            rejectUnauthorized: false // Accept self-signed certificates
        }
    });
};

// Send invitation email
exports.sendInvitationEmail = async (recipientEmail, recipientName, temporaryPassword, invitedBy) => {
    const appUrl = process.env.FRONTEND_URL || 'https://billyk.online/alunex-production';
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = process.env.FROM_NAME || 'Alunex Project Management';

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px 10px 0 0;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                }
                .content {
                    background: #f9fafb;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }
                .credentials {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #667eea;
                }
                .credentials h3 {
                    margin-top: 0;
                    color: #667eea;
                }
                .credential-item {
                    margin: 10px 0;
                    padding: 10px;
                    background: #f3f4f6;
                    border-radius: 4px;
                }
                .credential-label {
                    font-weight: 600;
                    color: #6b7280;
                    font-size: 12px;
                    text-transform: uppercase;
                }
                .credential-value {
                    font-size: 16px;
                    color: #1f2937;
                    margin-top: 5px;
                }
                .button {
                    display: inline-block;
                    padding: 12px 30px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    margin-top: 20px;
                    font-weight: 600;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    color: #6b7280;
                    font-size: 14px;
                }
                .warning {
                    background: #fef3c7;
                    border-left: 4px solid #f59e0b;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                }
                .warning p {
                    margin: 0;
                    color: #92400e;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Welcome to Alunex</h1>
            </div>
            <div class="content">
                <h2>Hello ${recipientName},</h2>
                <p>You have been invited by <strong>${invitedBy}</strong> to join the Alunex Project Management System.</p>

                <div class="credentials">
                    <h3>Your Login Credentials</h3>
                    <div class="credential-item">
                        <div class="credential-label">Email Address</div>
                        <div class="credential-value">${recipientEmail}</div>
                    </div>
                    <div class="credential-item">
                        <div class="credential-label">Temporary Password</div>
                        <div class="credential-value">${temporaryPassword}</div>
                    </div>
                </div>

                <div class="warning">
                    <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
                </div>

                <p>Click the button below to log in and get started:</p>

                <a href="${appUrl}/login" class="button">Log In to Alunex</a>

                <div class="footer">
                    <p>If you have any questions, please contact your administrator.</p>
                    <p>This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        // Try Resend first if API key is available
        if (resend) {
            const result = await resend.emails.send({
                from: `${fromName} <${fromEmail}>`,
                to: recipientEmail,
                subject: 'Welcome to Alunex Project Management',
                html: htmlContent
            });

            console.log('Resend API Response:', JSON.stringify(result, null, 2));

            // Check if there was an error
            if (result.error) {
                console.error('Resend API Error:', result.error);
                throw new Error(`Resend API Error: ${JSON.stringify(result.error)}`);
            }

            // Resend returns { data: { id: '...' }, error: null } on success
            const messageId = result.data?.id || result.id;
            console.log('Invitation email sent via Resend:', messageId);
            return { success: true, messageId, provider: 'resend' };
        }

        // Fallback to SMTP if Resend is not configured
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            const transporter = createTransporter();

            const mailOptions = {
                from: `"${fromName}" <${process.env.SMTP_USER}>`,
                to: recipientEmail,
                subject: 'Welcome to Alunex Project Management',
                html: htmlContent
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Invitation email sent via SMTP:', info.messageId);
            return { success: true, messageId: info.messageId, provider: 'smtp' };
        }

        throw new Error('No email service configured. Please set up Resend or SMTP.');
    } catch (error) {
        console.error('Error sending invitation email:', error);
        throw error;
    }
};

// Send password reset email
exports.sendPasswordResetEmail = async (recipientEmail, recipientName, resetToken) => {
    const appUrl = process.env.FRONTEND_URL || 'https://billyk.online/alunex-production';
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = process.env.FROM_NAME || 'Alunex Project Management';

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px 10px 0 0;
                    text-align: center;
                }
                .content {
                    background: #f9fafb;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }
                .button {
                    display: inline-block;
                    padding: 12px 30px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    margin-top: 20px;
                    font-weight: 600;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    color: #6b7280;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Password Reset</h1>
            </div>
            <div class="content">
                <h2>Hello ${recipientName},</h2>
                <p>We received a request to reset your password for your Alunex account.</p>
                <p>Click the button below to reset your password:</p>
                <a href="${resetUrl}" class="button">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this password reset, please ignore this email.</p>
                <div class="footer">
                    <p>This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        // Try Resend first if API key is available
        if (resend) {
            const result = await resend.emails.send({
                from: `${fromName} <${fromEmail}>`,
                to: recipientEmail,
                subject: 'Password Reset Request - Alunex',
                html: htmlContent
            });

            console.log('Resend API Response:', JSON.stringify(result, null, 2));

            // Check if there was an error
            if (result.error) {
                console.error('Resend API Error:', result.error);
                throw new Error(`Resend API Error: ${JSON.stringify(result.error)}`);
            }

            // Resend returns { data: { id: '...' }, error: null } on success
            const messageId = result.data?.id || result.id;
            console.log('Password reset email sent via Resend:', messageId);
            return { success: true, messageId, provider: 'resend' };
        }

        // Fallback to SMTP if Resend is not configured
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            const transporter = createTransporter();

            const mailOptions = {
                from: `"${fromName}" <${process.env.SMTP_USER}>`,
                to: recipientEmail,
                subject: 'Password Reset Request - Alunex',
                html: htmlContent
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Password reset email sent via SMTP:', info.messageId);
            return { success: true, messageId: info.messageId, provider: 'smtp' };
        }

        throw new Error('No email service configured. Please set up Resend or SMTP.');
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
};

// Send task assignment notification
exports.sendTaskAssignmentEmail = async (recipientEmail, recipientName, taskTitle, taskDescription, assignedBy, dueDate) => {
    const appUrl = process.env.FRONTEND_URL || 'https://billyk.online/alunex-production';
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = process.env.FROM_NAME || 'Alunex Project Management';

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px 10px 0 0;
                    text-align: center;
                }
                .content {
                    background: #f9fafb;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }
                .task-info {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #667eea;
                }
                .button {
                    display: inline-block;
                    padding: 12px 30px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    margin-top: 20px;
                    font-weight: 600;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    color: #6b7280;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📋 New Task Assigned</h1>
            </div>
            <div class="content">
                <h2>Hello ${recipientName},</h2>
                <p><strong>${assignedBy}</strong> has assigned you a new task.</p>
                <div class="task-info">
                    <h3>${taskTitle}</h3>
                    <p>${taskDescription || 'No description provided'}</p>
                    ${dueDate ? `<p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>` : ''}
                </div>
                <a href="${appUrl}/tasks" class="button">View Task</a>
                <div class="footer">
                    <p>This is an automated notification from Alunex Project Management.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        if (resend) {
            const result = await resend.emails.send({
                from: `${fromName} <${fromEmail}>`,
                to: recipientEmail,
                subject: `New Task Assigned: ${taskTitle}`,
                html: htmlContent
            });
            if (result.error) throw new Error(`Resend API Error: ${JSON.stringify(result.error)}`);
            return { success: true, messageId: result.data?.id || result.id, provider: 'resend' };
        }

        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            const transporter = createTransporter();
            const info = await transporter.sendMail({
                from: `"${fromName}" <${process.env.SMTP_USER}>`,
                to: recipientEmail,
                subject: `New Task Assigned: ${taskTitle}`,
                html: htmlContent
            });
            return { success: true, messageId: info.messageId, provider: 'smtp' };
        }

        throw new Error('No email service configured');
    } catch (error) {
        console.error('Error sending task assignment email:', error);
        throw error;
    }
};

// Send project update notification
exports.sendProjectUpdateEmail = async (recipientEmail, recipientName, projectName, updateType, updatedBy) => {
    const appUrl = process.env.FRONTEND_URL || 'https://billyk.online/alunex-production';
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = process.env.FROM_NAME || 'Alunex Project Management';

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px 10px 0 0;
                    text-align: center;
                }
                .content {
                    background: #f9fafb;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }
                .button {
                    display: inline-block;
                    padding: 12px 30px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    margin-top: 20px;
                    font-weight: 600;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    color: #6b7280;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🔔 Project Update</h1>
            </div>
            <div class="content">
                <h2>Hello ${recipientName},</h2>
                <p>The project <strong>${projectName}</strong> has been ${updateType} by <strong>${updatedBy}</strong>.</p>
                <a href="${appUrl}/projects" class="button">View Project</a>
                <div class="footer">
                    <p>This is an automated notification from Alunex Project Management.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        if (resend) {
            const result = await resend.emails.send({
                from: `${fromName} <${fromEmail}>`,
                to: recipientEmail,
                subject: `Project Update: ${projectName}`,
                html: htmlContent
            });
            if (result.error) throw new Error(`Resend API Error: ${JSON.stringify(result.error)}`);
            return { success: true, messageId: result.data?.id || result.id, provider: 'resend' };
        }

        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            const transporter = createTransporter();
            const info = await transporter.sendMail({
                from: `"${fromName}" <${process.env.SMTP_USER}>`,
                to: recipientEmail,
                subject: `Project Update: ${projectName}`,
                html: htmlContent
            });
            return { success: true, messageId: info.messageId, provider: 'smtp' };
        }

        throw new Error('No email service configured');
    } catch (error) {
        console.error('Error sending project update email:', error);
        throw error;
    }
};

// Send chat message notification
exports.sendChatMessageEmail = async (recipientEmail, recipientName, senderName, channelName, messagePreview) => {
    const appUrl = process.env.FRONTEND_URL || 'https://billyk.online/alunex-production';
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = process.env.FROM_NAME || 'Alunex Project Management';

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px 10px 0 0;
                    text-align: center;
                }
                .content {
                    background: #f9fafb;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }
                .message-preview {
                    background: white;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #667eea;
                    font-style: italic;
                }
                .button {
                    display: inline-block;
                    padding: 12px 30px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    margin-top: 20px;
                    font-weight: 600;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    color: #6b7280;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>💬 New Message</h1>
            </div>
            <div class="content">
                <h2>Hello ${recipientName},</h2>
                <p><strong>${senderName}</strong> sent a message in <strong>${channelName}</strong>:</p>
                <div class="message-preview">
                    "${messagePreview}"
                </div>
                <a href="${appUrl}/chat" class="button">View Message</a>
                <div class="footer">
                    <p>This is an automated notification from Alunex Project Management.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        if (resend) {
            const result = await resend.emails.send({
                from: `${fromName} <${fromEmail}>`,
                to: recipientEmail,
                subject: `New message from ${senderName} in ${channelName}`,
                html: htmlContent
            });
            if (result.error) throw new Error(`Resend API Error: ${JSON.stringify(result.error)}`);
            return { success: true, messageId: result.data?.id || result.id, provider: 'resend' };
        }

        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            const transporter = createTransporter();
            const info = await transporter.sendMail({
                from: `"${fromName}" <${process.env.SMTP_USER}>`,
                to: recipientEmail,
                subject: `New message from ${senderName} in ${channelName}`,
                html: htmlContent
            });
            return { success: true, messageId: info.messageId, provider: 'smtp' };
        }

        throw new Error('No email service configured');
    } catch (error) {
        console.error('Error sending chat message email:', error);
        throw error;
    }
};

// Send budget alert notification
exports.sendBudgetAlertEmail = async (recipientEmail, recipientName, entityType, entityName, budgetAllocated, budgetSpent, percentage) => {
    const appUrl = process.env.FRONTEND_URL || 'https://billyk.online/alunex-production';
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = process.env.FROM_NAME || 'Alunex Project Management';

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px 10px 0 0;
                    text-align: center;
                }
                .content {
                    background: #f9fafb;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }
                .alert-box {
                    background: #fef3c7;
                    border-left: 4px solid #f59e0b;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 4px;
                }
                .budget-stats {
                    background: white;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 10px 0;
                }
                .button {
                    display: inline-block;
                    padding: 12px 30px;
                    background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    margin-top: 20px;
                    font-weight: 600;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    color: #6b7280;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>⚠️ Budget Alert</h1>
            </div>
            <div class="content">
                <h2>Hello ${recipientName},</h2>
                <div class="alert-box">
                    <p><strong>Warning:</strong> The ${entityType} <strong>${entityName}</strong> has exceeded ${percentage}% of its allocated budget.</p>
                </div>
                <div class="budget-stats">
                    <p><strong>Allocated Budget:</strong> $${budgetAllocated.toLocaleString()}</p>
                    <p><strong>Budget Spent:</strong> $${budgetSpent.toLocaleString()}</p>
                    <p><strong>Utilization:</strong> ${percentage}%</p>
                </div>
                <p>Please review the spending and take necessary action.</p>
                <a href="${appUrl}/${entityType === 'Department' ? 'departments' : 'projects'}" class="button">View Details</a>
                <div class="footer">
                    <p>This is an automated notification from Alunex Project Management.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        if (resend) {
            const result = await resend.emails.send({
                from: `${fromName} <${fromEmail}>`,
                to: recipientEmail,
                subject: `Budget Alert: ${entityName} - ${percentage}% Used`,
                html: htmlContent
            });
            if (result.error) throw new Error(`Resend API Error: ${JSON.stringify(result.error)}`);
            return { success: true, messageId: result.data?.id || result.id, provider: 'resend' };
        }

        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            const transporter = createTransporter();
            const info = await transporter.sendMail({
                from: `"${fromName}" <${process.env.SMTP_USER}>`,
                to: recipientEmail,
                subject: `Budget Alert: ${entityName} - ${percentage}% Used`,
                html: htmlContent
            });
            return { success: true, messageId: info.messageId, provider: 'smtp' };
        }

        throw new Error('No email service configured');
    } catch (error) {
        console.error('Error sending budget alert email:', error);
        throw error;
    }
};
