// TelegramHelper.ts

import fs from "node:fs";
import path from "node:path";
import { app } from "electron";
import * as https from "https";
import * as http from "http";

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

export class TelegramHelper {
  private config: TelegramConfig;

  constructor(config: TelegramConfig) {
    this.config = config;
  }

  public updateConfig(config: TelegramConfig): void {
    this.config = config;
  }

  public isEnabled(): boolean {
    return this.config.enabled && !!this.config.botToken && !!this.config.chatId;
  }

  public async sendScreenshot(imagePath: string, caption?: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isEnabled()) {
      return { success: false, error: "Telegram is not configured" };
    }

    try {
      if (!fs.existsSync(imagePath)) {
        return { success: false, error: "Image file not found" };
      }

      const result = await this.sendPhotoFromFile(imagePath, caption);
      return result;
    } catch (error: any) {
      console.error("Error sending screenshot to Telegram:", error);
      return { success: false, error: error.message };
    }
  }

  private async sendPhotoFromFile(imagePath: string, caption?: string): Promise<{ success: boolean; error?: string }> {
    console.log(`Telegram: Sending to chat_id: ${this.config.chatId}`);
    console.log(`Telegram: Bot token: ${this.config.botToken.substring(0, 10)}...`);
    
    return new Promise((resolve) => {
      const imageBuffer = fs.readFileSync(imagePath);
      const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`;
      
      const bodyParts = [
        `--${boundary}\r\n`,
        `Content-Disposition: form-data; name="chat_id"\r\n\r\n${this.config.chatId}\r\n`,
      ];
      
      if (caption) {
        bodyParts.push(`--${boundary}\r\n`);
        bodyParts.push(`Content-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n`);
      }
      
      bodyParts.push(`--${boundary}\r\n`);
      bodyParts.push(`Content-Disposition: form-data; name="photo"; filename="screenshot.png"\r\n`);
      bodyParts.push(`Content-Type: image/png\r\n\r\n`);
      
      const bodyEnd = `\r\n--${boundary}--\r\n`;
      
      const body = Buffer.concat([
        Buffer.from(bodyParts.join(""), "utf-8"),
        imageBuffer,
        Buffer.from(bodyEnd, "utf-8")
      ]);

      const options = {
        hostname: "api.telegram.org",
        path: `/bot${this.config.botToken}/sendPhoto`,
        method: "POST",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": body.length,
        },
      };

      console.log("Telegram: Full API URL:", `https://api.telegram.org/bot${this.config.botToken.substring(0, 10)}.../sendPhoto`);

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const result = JSON.parse(data);
            if (result.ok) {
              console.log("Screenshot sent to Telegram successfully");
              resolve({ success: true });
            } else {
              console.error("Telegram API error:", result);
              resolve({ success: false, error: result.description || "Failed to send photo" });
            }
          } catch (e) {
            console.error("Failed to parse response:", data);
            resolve({ success: false, error: "Invalid response from Telegram" });
          }
        });
      });

      req.on("error", (e) => {
        console.error("Request error:", e);
        resolve({ success: false, error: e.message });
      });

      req.write(body);
      req.end();
    });
  }

  public async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.config.botToken || !this.config.chatId) {
      return { success: false, error: "Bot token or chat ID not configured" };
    }

    console.log("Testing Telegram connection with:");
    console.log("  Bot token:", this.config.botToken.substring(0, 10) + "...");
    console.log("  Chat ID:", this.config.chatId);

    return new Promise((resolve) => {
      const options = {
        hostname: "api.telegram.org",
        path: `/bot${this.config.botToken}/getUpdates`,
        method: "GET",
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const result = JSON.parse(data);
            console.log("getUpdates response:", JSON.stringify(result).substring(0, 500));
            
            if (result.ok) {
              if (result.result && result.result.length > 0) {
                resolve({ success: true });
              } else {
                resolve({ success: false, error: "No messages found. Make sure you've sent a message to your bot first!" });
              }
            } else {
              resolve({ success: false, error: result.description });
            }
          } catch (e) {
            resolve({ success: false, error: "Invalid response" });
          }
        });
      });

      req.on("error", (e) => {
        resolve({ success: false, error: e.message });
      });

      req.end();
    });
  }
}