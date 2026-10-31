import { useState } from "react";

export default function Contact() {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const email = "vijayykumar785@gmail.com";
  const github = "https://github.com/codewithrishee";
  const linkedin = "https://www.linkedin.com/in/vijayykumar001/";

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name")?.trim(),
      email: formData.get("email")?.trim(),
      subject: formData.get("role")?.trim() || null,
      message: formData.get("message")?.trim(),
    };

    setIsSending(true);
    setMessage("Sending...");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const errors = result.errors
          ? Object.values(result.errors).flat().join(" ")
          : result.message || "Failed to send message.";

        throw new Error(errors);
      }

      form.reset();
      setMessage("Message sent successfully! 🎉");

      setTimeout(() => {
        setMessage("");
      }, 4000);
    } catch (error) {
      console.error("Contact form error:", error);

      setMessage(
        error.message || "Unable to send message. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setMessage("Email copied!");

      setTimeout(() => {
        setMessage("");
      }, 2000);
    } catch {
      setMessage(`Email: ${email}`);
    }
  }

  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        <div className="contact-layout">
          {/* LEFT SIDE */}
          <div className="contact-left">
            <div className="contact-section-label">
              <span>05</span>
              <p>CONTACT</p>
            </div>

            <h2>
              Let's talk about your
              <br />
              next project.
            </h2>

            <p className="contact-intro">
              Have a developer opportunity, project idea or collaboration
              in mind? Send me the details or reach out directly.
            </p>

            <div className="contact-details-panel">
              <div className="contact-detail">
                <span>EMAIL</span>
                <a href={`mailto:${email}`}>{email}</a>
              </div>

              <div className="contact-detail">
                <span>LOCATION</span>
                <strong>Delhi, India</strong>
              </div>

              <div className="contact-detail">
                <span>GITHUB</span>
                <a href={github} target="_blank" rel="noreferrer">
                  codewithrishee
                </a>
              </div>

              <div className="contact-detail">
                <span>LINKEDIN</span>
                <a href={linkedin} target="_blank" rel="noreferrer">
                  vijayykumar001
                </a>
              </div>
            </div>

            <div className="contact-social-row">
              <button
                type="button"
                className="contact-copy-btn"
                onClick={copyEmail}
              >
                <span>▢</span> Copy email
              </button>

              <a
                href={github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.29-1.24-1.63-1.24-1.63-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .1.76 2.06 3.6 1.57.1-.73.4-1.23.7-1.52-2.47-.28-5.07-1.24-5.07-5.5 0-1.22.44-2.21 1.16-2.99-.12-.29-.5-1.42.11-2.95 0 0 .95-.3 3.05 1.14a10.6 10.6 0 0 1 5.56 0c2.1-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.66.11 2.95.72.78 1.16 1.77 1.16 2.99 0 4.27-2.6 5.21-5.08 5.49.4.34.75 1 .75 2.02v3.01c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
                </svg>
              </a>

              <a
                href={linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.45H4.97V9h2.96v9.45ZM6.45 7.71a1.72 1.72 0 1 1 0-3.44 1.72 1.72 0 0 1 0 3.44Zm12 10.74h-2.96v-4.6c0-1.1-.02-2.51-1.53-2.51-1.53 0-1.77 1.19-1.77 2.43v4.68H9.23V9h2.84v1.29h.04c.4-.74 1.36-1.53 2.8-1.53 3 0 3.55 1.97 3.55 4.53v5.16Z" />
                </svg>
              </a>
            </div>

            {message && (
              <p
                className="contact-copy-feedback"
                role="status"
                aria-live="polite"
              >
                {message}
              </p>
            )}
          </div>

          {/* RIGHT SIDE */}
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-input-row">
              <label>
                YOUR NAME
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  maxLength={255}
                  required
                />
              </label>

              <label>
                EMAIL
                <input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  maxLength={255}
                  required
                />
              </label>
            </div>

            <label>
              ROLE &amp; COMPANY
              <input
                type="text"
                name="role"
                placeholder="PHP Developer — Company Name"
                maxLength={255}
                required
              />
            </label>

            <label>
              MESSAGE
              <textarea
                name="message"
                rows="5"
                maxLength={5000}
                placeholder="Tell me about the role, project or opportunity..."
                required
              />
            </label>

            <button
              type="submit"
              className="contact-submit"
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Send message"} <span>➤</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}