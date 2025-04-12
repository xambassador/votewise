import type { Request, Response } from "express";
import type { ForgotPasswordTemplate, PasswordResetSuccessTemplate, SignupTemplate, WelcomeTemplate } from "./types";

import path from "node:path";
import pug from "pug";

const logo = "http://localhost:8080/assets/logo.png";
const name = "John Doe";
const email = "johndoe@gmail.com";
const templates = [
  {
    name: "forgot-password.pug",
    data: {
      resetLink: "https://example.com/reset-password?token=abc123",
      email,
      expiresIn: 2,
      expiresInUnit: "hours",
      firstName: "John",
      logo
    } as ForgotPasswordTemplate["locals"]
  },
  {
    name: "password-reset-success.pug",
    data: { name, logo, loginUrl: "https://example.com/login" } as PasswordResetSuccessTemplate["locals"]
  },
  {
    name: "signup.pug",
    data: {
      logo,
      expiresIn: 2,
      expiresInUnit: "hours",
      otp: "123456"
    } as SignupTemplate["locals"]
  },
  {
    name: "welcome.pug",
    data: {
      name,
      logo,
      featuredContent: [
        { title: "What about wooden floors?", description: "Wooden floors are a great choice for your home." },
        { title: "How to choose the right flooring?", description: "Choosing the right flooring can be challenging." },
        {
          title: "What is the best flooring for pets?",
          description: "The best flooring for pets depends on your needs."
        }
      ]
    } as WelcomeTemplate["locals"]
  }
];

function getTemplateFilePath(templateName: string): string {
  return path.join(__dirname, "templates", templateName);
}

function renderTemplate(templateName: string, data: object): string {
  const templatePath = getTemplateFilePath(templateName);
  return pug.renderFile(templatePath, data);
}

export function previewEmails(req: Request, res: Response) {
  const templateName = req.query.template as string;
  const template = templates.find((t) => t.name === templateName);
  if (!template) {
    const html = `<h1>Template not found</h1><p>Available templates:</p><ul>${templates.map((t) => `<li><a href="?template=${t.name}">${t.name}</a></li>`).join("")}</ul>`;
    return res.send(html);
  }
  const data = template.data;
  const renderedTemplate = renderTemplate(template.name, data);
  return res.send(renderedTemplate);
}
